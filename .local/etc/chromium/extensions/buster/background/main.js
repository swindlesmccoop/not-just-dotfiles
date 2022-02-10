import browser from 'webextension-polyfill';
import audioBufferToWav from 'audiobuffer-to-wav';
import aes from 'crypto-js/aes';
import sha256 from 'crypto-js/sha256';
import utf8 from 'crypto-js/enc-utf8';

import {initStorage} from 'storage/init';
import storage from 'storage/storage';
import {
  showNotification,
  showContributePage,
  sendNativeMessage
} from 'utils/app';
import {
  executeCode,
  executeFile,
  scriptsAllowed,
  functionInContext,
  getBrowser,
  getPlatform,
  getRandomInt,
  arrayBufferToBase64,
  normalizeAudio,
  sliceAudio
} from 'utils/common';
import {
  recaptchaChallengeUrlRx,
  captchaGoogleSpeechApiLangCodes,
  captchaIbmSpeechApiLangCodes,
  captchaMicrosoftSpeechApiLangCodes,
  captchaWitSpeechApiLangCodes,
  ibmSpeechApiUrls,
  microsoftSpeechApiUrls
} from 'utils/data';
import {targetEnv, clientAppVersion} from 'utils/config';

let nativePort;
let secrets;

function getFrameClientPos(index) {
  let currentIndex = -1;
  if (window !== window.top) {
    const siblingWindows = window.parent.frames;
    for (let i = 0; i < siblingWindows.length; i++) {
      if (siblingWindows[i] === window) {
        currentIndex = i;
        break;
      }
    }
  }

  const targetWindow = window.frames[index];
  for (const frame of document.querySelectorAll('iframe')) {
    if (frame.contentWindow === targetWindow) {
      let {left: x, top: y} = frame.getBoundingClientRect();
      const scale = window.devicePixelRatio;

      return {x: x * scale, y: y * scale, currentIndex};
    }
  }
}

async function getFramePos(tabId, frameId, frameIndex) {
  let x = 0;
  let y = 0;

  while (true) {
    frameId = (
      await browser.webNavigation.getFrame({
        tabId,
        frameId
      })
    ).parentFrameId;
    if (frameId === -1) {
      break;
    }

    const [data] = await executeCode(
      `(${getFrameClientPos.toString()})(${frameIndex})`,
      tabId,
      frameId
    );

    frameIndex = data.currentIndex;
    x += data.x;
    y += data.y;
  }

  return {x, y};
}

async function resetCaptcha(tabId, frameId, challengeUrl) {
  frameId = (
    await browser.webNavigation.getFrame({
      tabId,
      frameId: frameId
    })
  ).parentFrameId;

  if (!(await scriptsAllowed(tabId, frameId))) {
    await showNotification({messageId: 'error_scriptsNotAllowed'});
    return;
  }

  if (!(await functionInContext('addListener', tabId, frameId))) {
    await executeFile('/src/content/initReset.js', tabId, frameId);
  }
  await executeCode('addListener()', tabId, frameId);

  await browser.tabs.sendMessage(
    tabId,
    {
      id: 'resetCaptcha',
      challengeUrl
    },
    {frameId}
  );
}

function challengeRequestCallback(details) {
  const url = new URL(details.url);
  if (url.searchParams.get('hl') !== 'en') {
    url.searchParams.set('hl', 'en');
    return {redirectUrl: url.toString()};
  }
}

async function setChallengeLocale() {
  const {loadEnglishChallenge, simulateUserInput} = await storage.get(
    ['loadEnglishChallenge', 'simulateUserInput'],
    'sync'
  );

  if (loadEnglishChallenge || simulateUserInput) {
    if (
      !browser.webRequest.onBeforeRequest.hasListener(challengeRequestCallback)
    ) {
      browser.webRequest.onBeforeRequest.addListener(
        challengeRequestCallback,
        {
          urls: [
            'https://www.google.com/recaptcha/api2/anchor*',
            'https://www.google.com/recaptcha/api2/bframe*',
            'https://www.recaptcha.net/recaptcha/api2/anchor*',
            'https://www.recaptcha.net/recaptcha/api2/bframe*',
            'https://recaptcha.net/recaptcha/api2/anchor*',
            'https://recaptcha.net/recaptcha/api2/bframe*',
            'https://www.google.com/recaptcha/enterprise/anchor*',
            'https://www.google.com/recaptcha/enterprise/bframe*',
            'https://www.recaptcha.net/recaptcha/enterprise/anchor*',
            'https://www.recaptcha.net/recaptcha/enterprise/bframe*',
            'https://recaptcha.net/recaptcha/enterprise/anchor*',
            'https://recaptcha.net/recaptcha/enterprise/bframe*'
          ],
          types: ['sub_frame']
        },
        ['blocking']
      );
    }
  } else if (
    browser.webRequest.onBeforeRequest.hasListener(challengeRequestCallback)
  ) {
    browser.webRequest.onBeforeRequest.removeListener(challengeRequestCallback);
  }
}

function removeRequestOrigin(details) {
  const origin = window.location.origin;
  const headers = details.requestHeaders;
  for (const header of headers) {
    if (header.name.toLowerCase() === 'origin' && header.value === origin) {
      headers.splice(headers.indexOf(header), 1);
      break;
    }
  }

  return {requestHeaders: headers};
}

function addBackgroundRequestListener() {
  if (
    !browser.webRequest.onBeforeSendHeaders.hasListener(removeRequestOrigin)
  ) {
    const urls = [
      'https://www.google.com/*',
      'https://www.recaptcha.net/*',
      'https://recaptcha.net/*',
      'https://api.wit.ai/*',
      'https://speech.googleapis.com/*',
      'https://*.speech-to-text.watson.cloud.ibm.com/*',
      'https://*.stt.speech.microsoft.com/*'
    ];

    const extraInfo = ['blocking', 'requestHeaders'];
    if (
      targetEnv !== 'firefox' &&
      Object.values(browser.webRequest.OnBeforeSendHeadersOptions).includes(
        'extraHeaders'
      )
    ) {
      extraInfo.push('extraHeaders');
    }

    browser.webRequest.onBeforeSendHeaders.addListener(
      removeRequestOrigin,
      {
        urls,
        types: ['xmlhttprequest']
      },
      extraInfo
    );
  }
}

function removeBackgroundRequestListener() {
  if (browser.webRequest.onBeforeSendHeaders.hasListener(removeRequestOrigin)) {
    browser.webRequest.onBeforeSendHeaders.removeListener(removeRequestOrigin);
  }
}

async function prepareAudio(audio) {
  const audioBuffer = await normalizeAudio(audio);

  const audioSlice = await sliceAudio({
    audioBuffer,
    start: 1.5,
    end: audioBuffer.duration - 1.5
  });

  return audioBufferToWav(audioSlice);
}

async function loadSecrets() {
  try {
    const ciphertext = await (await fetch('/secrets.txt')).text();

    const key = sha256(
      (await (await fetch('/src/background/script.js')).text()) +
        (await (await fetch('/src/solve/script.js')).text())
    ).toString();

    secrets = JSON.parse(aes.decrypt(ciphertext, key).toString(utf8));
  } catch (err) {
    secrets = {};
    const {speechService} = await storage.get('speechService', 'sync');
    if (speechService === 'witSpeechApiDemo') {
      await storage.set({speechService: 'witSpeechApi'}, 'sync');
    }
  }
}

async function getWitSpeechApiKey(speechService, language) {
  if (speechService === 'witSpeechApiDemo') {
    if (!secrets) {
      await loadSecrets();
    }
    const apiKeys = secrets.witApiKeys;
    if (apiKeys) {
      const apiKey = apiKeys[language];
      if (Array.isArray(apiKey)) {
        return apiKey[getRandomInt(1, apiKey.length) - 1];
      }
      return apiKey;
    }
  } else {
    const {witSpeechApiKeys: apiKeys} = await storage.get(
      'witSpeechApiKeys',
      'sync'
    );
    return apiKeys[language];
  }
}

async function getWitSpeechApiResult(apiKey, audioContent) {
  const result = {};

  const rsp = await fetch('https://api.wit.ai/speech?v=20200513', {
    referrer: '',
    mode: 'cors',
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey
    },
    body: new Blob([audioContent], {type: 'audio/wav'})
  });

  if (rsp.status !== 200) {
    if (rsp.status === 429) {
      result.errorId = 'error_apiQuotaExceeded';
      result.errorTimeout = 6000;
    } else {
      throw new Error(`API response: ${rsp.status}, ${await rsp.text()}`);
    }
  } else {
    const data = (await rsp.json()).text;
    if (data) {
      result.text = data.trim();
    }
  }

  return result;
}

async function getIbmSpeechApiResult(apiUrl, apiKey, audioContent, language) {
  const rsp = await fetch(
    `${apiUrl}?model=${language}&profanity_filter=false`,
    {
      referrer: '',
      mode: 'cors',
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + window.btoa('apiKey:' + apiKey),
        'X-Watson-Learning-Opt-Out': 'true'
      },
      body: new Blob([audioContent], {type: 'audio/wav'})
    }
  );

  if (rsp.status !== 200) {
    throw new Error(`API response: ${rsp.status}, ${await rsp.text()}`);
  }

  const results = (await rsp.json()).results;
  if (results && results.length) {
    return results[0].alternatives[0].transcript.trim();
  }
}

async function getMicrosoftSpeechApiResult(
  apiUrl,
  apiKey,
  audioContent,
  language
) {
  const rsp = await fetch(
    `${apiUrl}?language=${language}&format=detailed&profanity=raw`,
    {
      referrer: '',
      mode: 'cors',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-type': 'audio/wav; codec=audio/pcm; samplerate=16000'
      },
      body: new Blob([audioContent], {type: 'audio/wav'})
    }
  );

  if (rsp.status !== 200) {
    throw new Error(`API response: ${rsp.status}, ${await rsp.text()}`);
  }

  const results = (await rsp.json()).NBest;
  if (results) {
    return results[0].Lexical.trim();
  }
}

async function transcribeAudio(audioUrl, lang) {
  let solution;

  const audioRsp = await fetch(audioUrl, {referrer: ''});
  const audioContent = await prepareAudio(await audioRsp.arrayBuffer());

  const {speechService, tryEnglishSpeechModel} = await storage.get(
    ['speechService', 'tryEnglishSpeechModel'],
    'sync'
  );

  if (['witSpeechApiDemo', 'witSpeechApi'].includes(speechService)) {
    const language = captchaWitSpeechApiLangCodes[lang] || 'english';

    const apiKey = await getWitSpeechApiKey(speechService, language);
    if (!apiKey) {
      showNotification({messageId: 'error_missingApiKey'});
      return;
    }

    const result = await getWitSpeechApiResult(apiKey, audioContent);
    if (result.errorId) {
      showNotification({
        messageId: result.errorId,
        timeout: result.errorTimeout
      });
      return;
    }
    solution = result.text;

    if (!solution && language !== 'english' && tryEnglishSpeechModel) {
      const apiKey = await getWitSpeechApiKey(speechService, 'english');
      if (!apiKey) {
        showNotification({messageId: 'error_missingApiKey'});
        return;
      }
      const result = await getWitSpeechApiResult(apiKey, audioContent);
      if (result.errorId) {
        showNotification({
          messageId: result.errorId,
          timeout: result.errorTimeout
        });
        return;
      }
      solution = result.text;
    }
  } else if (speechService === 'googleSpeechApi') {
    const {googleSpeechApiKey: apiKey} = await storage.get(
      'googleSpeechApiKey',
      'sync'
    );
    if (!apiKey) {
      showNotification({messageId: 'error_missingApiKey'});
      return;
    }
    const apiUrl = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apiKey}`;

    const language = captchaGoogleSpeechApiLangCodes[lang] || 'en-US';

    const data = {
      audio: {
        content: arrayBufferToBase64(audioContent)
      },
      config: {
        encoding: 'LINEAR16',
        languageCode: language,
        model: 'video',
        sampleRateHertz: 16000
      }
    };
    if (!['en-US', 'en-GB'].includes(language) && tryEnglishSpeechModel) {
      data.config.model = 'default';
      data.config.alternativeLanguageCodes = ['en-US'];
    }

    const rsp = await fetch(apiUrl, {
      referrer: '',
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (rsp.status !== 200) {
      throw new Error(`API response: ${rsp.status}, ${await rsp.text()}`);
    }

    const results = (await rsp.json()).results;
    if (results) {
      solution = results[0].alternatives[0].transcript.trim();
    }
  } else if (speechService === 'ibmSpeechApi') {
    const {
      ibmSpeechApiLoc: apiLoc,
      ibmSpeechApiKey: apiKey
    } = await storage.get(['ibmSpeechApiLoc', 'ibmSpeechApiKey'], 'sync');
    if (!apiKey) {
      showNotification({messageId: 'error_missingApiKey'});
      return;
    }
    const apiUrl = ibmSpeechApiUrls[apiLoc];
    const language =
      captchaIbmSpeechApiLangCodes[lang] || 'en-US_BroadbandModel';

    solution = await getIbmSpeechApiResult(
      apiUrl,
      apiKey,
      audioContent,
      language
    );
    if (
      !solution &&
      !['en-US_BroadbandModel', 'en-GB_BroadbandModel'].includes(language) &&
      tryEnglishSpeechModel
    ) {
      solution = await getIbmSpeechApiResult(
        apiUrl,
        apiKey,
        audioContent,
        'en-US_BroadbandModel'
      );
    }
  } else if (speechService === 'microsoftSpeechApi') {
    const {
      microsoftSpeechApiLoc: apiLoc,
      microsoftSpeechApiKey: apiKey
    } = await storage.get(
      ['microsoftSpeechApiLoc', 'microsoftSpeechApiKey'],
      'sync'
    );
    if (!apiKey) {
      showNotification({messageId: 'error_missingApiKey'});
      return;
    }
    const apiUrl = microsoftSpeechApiUrls[apiLoc];
    const language = captchaMicrosoftSpeechApiLangCodes[lang] || 'en-US';

    solution = await getMicrosoftSpeechApiResult(
      apiUrl,
      apiKey,
      audioContent,
      language
    );
    if (
      !solution &&
      !['en-US', 'en-GB'].includes(language) &&
      tryEnglishSpeechModel
    ) {
      solution = await getMicrosoftSpeechApiResult(
        apiUrl,
        apiKey,
        audioContent,
        'en-US'
      );
    }
  }

  if (!solution) {
    showNotification({messageId: 'error_captchaNotSolved', timeout: 6000});
  } else {
    return solution;
  }
}

async function onMessage(request, sender) {
  if (request.id === 'notification') {
    showNotification({
      message: request.message,
      messageId: request.messageId,
      title: request.title,
      type: request.type,
      timeout: request.timeout
    });
  } else if (request.id === 'captchaSolved') {
    let {useCount} = await storage.get('useCount', 'sync');
    useCount += 1;
    await storage.set({useCount}, 'sync');
    if ([30, 100].includes(useCount)) {
      await showContributePage('use');
    }
  } else if (request.id === 'transcribeAudio') {
    addBackgroundRequestListener();
    try {
      return await transcribeAudio(request.audioUrl, request.lang);
    } finally {
      removeBackgroundRequestListener();
    }
  } else if (request.id === 'resetCaptcha') {
    await resetCaptcha(sender.tab.id, sender.frameId, request.challengeUrl);
  } else if (request.id === 'getFramePos') {
    return getFramePos(sender.tab.id, sender.frameId, request.frameIndex);
  } else if (request.id === 'getTabZoom') {
    return browser.tabs.getZoom(sender.tab.id);
  } else if (request.id === 'getBackgroundScriptScale') {
    return window.devicePixelRatio;
  } else if (request.id === 'startClientApp') {
    nativePort = browser.runtime.connectNative('org.buster.client');
  } else if (request.id === 'stopClientApp') {
    if (nativePort) {
      nativePort.disconnect();
    }
  } else if (request.id === 'messageClientApp') {
    const message = {
      apiVersion: clientAppVersion,
      ...request.message
    };
    return sendNativeMessage(nativePort, message);
  } else if (request.id === 'openOptions') {
    browser.runtime.openOptionsPage();
  } else if (request.id === 'getPlatform') {
    return getPlatform();
  } else if (request.id === 'getBrowser') {
    return getBrowser();
  }
}

async function onStorageChange(changes, area) {
  await setChallengeLocale();
}

function addStorageListener() {
  browser.storage.onChanged.addListener(onStorageChange);
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(onMessage);
}

async function onInstall(details) {
  if (
    ['chrome', 'edge', 'opera'].includes(targetEnv) &&
    ['install', 'update'].includes(details.reason)
  ) {
    const tabs = await browser.tabs.query({
      url: ['http://*/*', 'https://*/*'],
      windowType: 'normal'
    });

    for (const tab of tabs) {
      const tabId = tab.id;

      const frames = await browser.webNavigation.getAllFrames({tabId});
      for (const frame of frames) {
        const frameId = frame.frameId;

        if (frameId && recaptchaChallengeUrlRx.test(frame.url)) {
          await browser.tabs.insertCSS(tabId, {
            frameId,
            runAt: 'document_idle',
            file: '/src/solve/reset-button.css'
          });

          await browser.tabs.executeScript(tabId, {
            frameId,
            runAt: 'document_idle',
            file: '/src/manifest.js'
          });
          await browser.tabs.executeScript(tabId, {
            frameId,
            runAt: 'document_idle',
            file: '/src/solve/script.js'
          });
        }
      }
    }

    const setupTabs = await browser.tabs.query({
      url: 'http://127.0.0.1/buster/setup?session=*',
      windowType: 'normal'
    });

    for (const tab of setupTabs) {
      await browser.tabs.reload(tab.id);
    }
  }
}

async function onLoad() {
  await initStorage('sync');
  await setChallengeLocale();
  addStorageListener();
  addMessageListener();
}

browser.runtime.onInstalled.addListener(onInstall);

document.addEventListener('DOMContentLoaded', onLoad);
