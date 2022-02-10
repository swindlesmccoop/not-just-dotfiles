import browser from 'webextension-polyfill';

import storage from 'storage/storage';
import {meanSleep, pingClientApp} from 'utils/app';
import {getText, waitForElement, getRandomFloat, sleep} from 'utils/common';
import {targetEnv, clientAppVersion} from 'utils/config';

let solverWorking = false;
let solverButton = null;

function setSolverState({working = true} = {}) {
  solverWorking = working;
  if (solverButton) {
    if (working) {
      solverButton.classList.add('working');
    } else {
      solverButton.classList.remove('working');
    }
  }
}

function resetCaptcha() {
  return browser.runtime.sendMessage({
    id: 'resetCaptcha',
    challengeUrl: window.location.href
  });
}

function syncUI() {
  if (isBlocked()) {
    if (!document.querySelector('.solver-controls')) {
      const div = document.createElement('div');
      div.classList.add('solver-controls');

      const button = document.createElement('button');
      button.classList.add('rc-button');
      button.setAttribute('tabindex', '0');
      button.setAttribute('title', getText('buttonText_reset'));
      button.id = 'reset-button';

      button.addEventListener('click', resetCaptcha);

      div.appendChild(button);
      document.querySelector('.rc-footer').appendChild(div);
    }
    return;
  }

  const helpButton = document.querySelector('#recaptcha-help-button');
  if (helpButton) {
    helpButton.remove();

    const helpButtonHolder = document.querySelector('.help-button-holder');
    const shadow = helpButtonHolder.attachShadow({mode: 'closed'});

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute(
      'href',
      browser.extension.getURL('/src/solve/solver-button.css')
    );
    shadow.appendChild(link);

    solverButton = document.createElement('button');
    solverButton.setAttribute('tabindex', '0');
    solverButton.setAttribute('title', getText('buttonText_solve'));
    solverButton.id = 'solver-button';
    if (solverWorking) {
      solverButton.classList.add('working');
    }

    solverButton.addEventListener('click', solveChallenge);

    shadow.appendChild(solverButton);
  }
}

function isBlocked({timeout = 0} = {}) {
  const selector = '.rc-doscaptcha-body';
  if (timeout) {
    return new Promise(resolve => {
      waitForElement(selector, {timeout}).then(result =>
        resolve(Boolean(result))
      );
    });
  }

  return Boolean(document.querySelector(selector));
}

function dispatchEnter(node) {
  const keyEvent = {
    code: 'Enter',
    key: 'Enter',
    keyCode: 13,
    which: 13,
    view: window,
    bubbles: true,
    composed: true,
    cancelable: true
  };

  node.focus();
  node.dispatchEvent(new KeyboardEvent('keydown', keyEvent));
  node.dispatchEvent(new KeyboardEvent('keypress', keyEvent));
  node.click();
}

async function navigateToElement(node, {forward = true} = {}) {
  if (document.activeElement === node) {
    return;
  }

  if (!forward) {
    await messageClientApp({command: 'pressKey', data: 'shift'});
    await meanSleep(300);
  }

  while (document.activeElement !== node) {
    await messageClientApp({command: 'tapKey', data: 'tab'});
    await meanSleep(300);
  }

  if (!forward) {
    await messageClientApp({command: 'releaseKey', data: 'shift'});
    await meanSleep(300);
  }
}

async function tapEnter(node, {navigateForward = true} = {}) {
  await navigateToElement(node, {forward: navigateForward});
  await meanSleep(200);
  await messageClientApp({command: 'tapKey', data: 'enter'});
}

async function clickElement(node, browserBorder) {
  const targetPos = await getClickPos(node, browserBorder);
  await messageClientApp({command: 'moveMouse', ...targetPos});
  await meanSleep(100);
  await messageClientApp({command: 'clickMouse'});
}

async function messageClientApp(message) {
  const rsp = await browser.runtime.sendMessage({
    id: 'messageClientApp',
    message
  });

  if (!rsp.success) {
    throw new Error(`Client app response: ${rsp.text}`);
  }

  return rsp;
}

async function getOsScale() {
  // The background script devicePixelRatio is not affected by the default
  // zoom level in Firefox, while the content script devicePixelRatio
  // is affected, unless only text is zoomed.
  if (targetEnv === 'firefox') {
    return browser.runtime.sendMessage({id: 'getBackgroundScriptScale'});
  }

  const zoom = await browser.runtime.sendMessage({id: 'getTabZoom'});

  return window.devicePixelRatio / zoom;
}

async function getBrowserBorder(clickEvent) {
  const framePos = await getFrameClientPos();
  const scale = window.devicePixelRatio;
  const osScale = await getOsScale();

  return {
    left:
      clickEvent.screenX * osScale -
      clickEvent.clientX * scale -
      framePos.x -
      window.screenX * scale,
    top:
      clickEvent.screenY * osScale -
      clickEvent.clientY * scale -
      framePos.y -
      window.screenY * scale
  };
}

async function getFrameClientPos() {
  if (window !== window.top) {
    let frameIndex;
    const siblingWindows = window.parent.frames;
    for (let i = 0; i < siblingWindows.length; i++) {
      if (siblingWindows[i] === window) {
        frameIndex = i;
        break;
      }
    }

    return await browser.runtime.sendMessage({id: 'getFramePos', frameIndex});
  }

  return {x: 0, y: 0};
}

async function getElementScreenRect(node, browserBorder) {
  let {left: x, top: y, width, height} = node.getBoundingClientRect();

  const data = await getFrameClientPos();
  const scale = window.devicePixelRatio;

  x *= scale;
  y *= scale;
  width *= scale;
  height *= scale;

  x += data.x + browserBorder.left + window.screenX * scale;
  y += data.y + browserBorder.top + window.screenY * scale;

  const {os} = await browser.runtime.sendMessage({id: 'getPlatform'});
  if (['windows', 'macos'].includes(os)) {
    const osScale = await getOsScale();
    x /= osScale;
    y /= osScale;
    width /= osScale;
    height /= osScale;
  }

  return {x, y, width, height};
}

async function getClickPos(node, browserBorder) {
  let {x, y, width, height} = await getElementScreenRect(node, browserBorder);

  return {
    x: Math.round(x + width * getRandomFloat(0.4, 0.6)),
    y: Math.round(y + height * getRandomFloat(0.4, 0.6))
  };
}

async function solve(simulateUserInput, clickEvent) {
  if (isBlocked()) {
    return;
  }

  const {navigateWithKeyboard} = await storage.get(
    'navigateWithKeyboard',
    'sync'
  );

  let browserBorder;
  let useMouse = true;
  if (simulateUserInput) {
    if (!navigateWithKeyboard && (clickEvent.clientX || clickEvent.clientY)) {
      browserBorder = await getBrowserBorder(clickEvent);
    } else {
      useMouse = false;
    }
  }

  const audioElSelector = 'audio#audio-source';
  let audioEl = document.querySelector(audioElSelector);
  if (!audioEl) {
    const audioButton = document.querySelector('#recaptcha-audio-button');
    if (simulateUserInput) {
      if (useMouse) {
        await clickElement(audioButton, browserBorder);
      } else {
        await tapEnter(audioButton, {navigateForward: false});
      }
    } else {
      dispatchEnter(audioButton);
    }

    const result = await Promise.race([
      new Promise(resolve => {
        waitForElement(audioElSelector, {timeout: 10000}).then(el => {
          meanSleep(500).then(() => resolve({audioEl: el}));
        });
      }),
      new Promise(resolve => {
        isBlocked({timeout: 10000}).then(blocked => resolve({blocked}));
      })
    ]);

    if (result.blocked) {
      return;
    }

    audioEl = result.audioEl;
  }

  if (simulateUserInput) {
    const muteAudio = function () {
      audioEl.muted = true;
    };
    const unmuteAudio = function () {
      removeCallbacks();
      audioEl.muted = false;
    };

    audioEl.addEventListener('playing', muteAudio, {
      capture: true,
      once: true
    });
    audioEl.addEventListener('ended', unmuteAudio, {
      capture: true,
      once: true
    });

    const removeCallbacks = function () {
      window.clearTimeout(timeoutId);
      audioEl.removeEventListener('playing', muteAudio, {
        capture: true,
        once: true
      });
      audioEl.removeEventListener('ended', unmuteAudio, {
        capture: true,
        once: true
      });
    };

    const timeoutId = window.setTimeout(unmuteAudio, 10000); // 10 seconds

    const playButton = document.querySelector(
      '.rc-audiochallenge-play-button > button'
    );
    if (useMouse) {
      await clickElement(playButton, browserBorder);
    } else {
      await tapEnter(playButton);
    }
  }

  const audioUrl = audioEl.src;
  const lang = document.documentElement.lang;

  const solution = await browser.runtime.sendMessage({
    id: 'transcribeAudio',
    audioUrl,
    lang
  });

  if (!solution) {
    return;
  }

  const input = document.querySelector('#audio-response');
  if (simulateUserInput) {
    if (useMouse) {
      await clickElement(input, browserBorder);
    } else {
      await navigateToElement(input);
    }
    await meanSleep(200);

    await messageClientApp({command: 'typeText', data: solution});
  } else {
    input.value = solution;
  }

  const submitButton = document.querySelector('#recaptcha-verify-button');
  if (simulateUserInput) {
    if (useMouse) {
      await clickElement(submitButton, browserBorder);
    } else {
      await tapEnter(submitButton);
    }
  } else {
    dispatchEnter(submitButton);
  }

  browser.runtime.sendMessage({id: 'captchaSolved'});
}

function solveChallenge(ev) {
  ev.preventDefault();
  ev.stopImmediatePropagation();

  if (!ev.isTrusted || solverWorking) {
    return;
  }
  setSolverState({working: true});

  runSolver(ev)
    .catch(err => {
      browser.runtime.sendMessage({
        id: 'notification',
        messageId: 'error_internalError'
      });
      console.log(err.toString());
      throw err;
    })
    .finally(() => {
      setSolverState({working: false});
    });
}

async function runSolver(ev) {
  const {simulateUserInput, autoUpdateClientApp} = await storage.get(
    ['simulateUserInput', 'autoUpdateClientApp'],
    'sync'
  );

  if (simulateUserInput) {
    try {
      let pingRsp;

      try {
        pingRsp = await pingClientApp({stop: false, checkResponse: false});
      } catch (err) {
        browser.runtime.sendMessage({
          id: 'notification',
          messageId: 'error_missingClientApp'
        });
        browser.runtime.sendMessage({id: 'openOptions'});
        throw err;
      }

      if (!pingRsp.success) {
        if (!pingRsp.apiVersion !== clientAppVersion) {
          if (!autoUpdateClientApp || pingRsp.apiVersion === '1') {
            browser.runtime.sendMessage({
              id: 'notification',
              messageId: 'error_outdatedClientApp'
            });
            browser.runtime.sendMessage({id: 'openOptions'});
            throw new Error('Client app outdated');
          } else {
            try {
              browser.runtime.sendMessage({
                id: 'notification',
                messageId: 'info_updatingClientApp'
              });
              const rsp = await browser.runtime.sendMessage({
                id: 'messageClientApp',
                message: {command: 'installClient', data: clientAppVersion}
              });

              if (rsp.success) {
                await browser.runtime.sendMessage({id: 'stopClientApp'});
                await sleep(10000);

                await pingClientApp({stop: false});

                await browser.runtime.sendMessage({
                  id: 'messageClientApp',
                  message: {command: 'installCleanup'}
                });
              } else {
                throw new Error(`Client app update failed: ${rsp.data}`);
              }
            } catch (err) {
              browser.runtime.sendMessage({
                id: 'notification',
                messageId: 'error_clientAppUpdateFailed'
              });
              browser.runtime.sendMessage({id: 'openOptions'});
              throw err;
            }
          }
        }
      }
    } catch (err) {
      console.log(err.toString());
      await browser.runtime.sendMessage({id: 'stopClientApp'});
      return;
    }
  }

  try {
    await solve(simulateUserInput, ev);
  } finally {
    if (simulateUserInput) {
      await browser.runtime.sendMessage({id: 'stopClientApp'});
    }
  }
}

function init() {
  const observer = new MutationObserver(syncUI);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  syncUI();
}

init();
