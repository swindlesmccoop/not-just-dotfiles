import browser from 'webextension-polyfill';

const message = 'Add IBM Watson Speech to Text API';

const revision = 'ONiJBs00o';
const downRevision = 'UoT3kGyBH';

const storage = browser.storage.local;

async function upgrade() {
  const changes = {
    ibmSpeechApiLoc: 'frankfurt', // 'frankfurt', 'dallas', 'washington', 'sydney', 'tokyo'
    ibmSpeechApiKey: ''
  };

  changes.storageVersion = revision;
  return storage.set(changes);
}

async function downgrade() {
  const changes = {};
  await storage.remove(['ibmSpeechApiLoc', 'ibmSpeechApiKey']);

  changes.storageVersion = downRevision;
  return storage.set(changes);
}

export {message, revision, upgrade, downgrade};
