const Promise = require('bluebird');
const _ = require('lodash');

const audio = require('./_audio');
const ui = require('./_ui');
const utils = require('./_utils');
const screensaver = require('./_screensaver');

const screensaverTimeoutLength = 30 * 1000; // ms

let faceInFrame = false;
let processEmotions = true;

let conversationPhase = 'start';
const conversation = {
  start: {
    next: 'feelings'
  },
  feelings: {
    next: 'joke'
  },
  // jokeAsk: {
  //   next: 'joke'
  // },
  joke: {
    next: 'ad'
  },
  ad: {
    next: 'end'
  },
  end: {
    next: 'start'
  }
};

function asyncInit() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function handleAudioProcessingSuccess(res) {
  const userText = res.transcription;

  console.log('text', userText, 'conversation phase', conversationPhase);
  ui.setUserText(userText);

  switch (conversationPhase) {
    case 'start':
      if (utils.strHas(userText, 'start') !== true) {
        setConversationStageFeelings();
      } else {
        asyncBotSay(
          "Although I don't think you said 'Start Conversation', let's go ahead and get started. No harm, no foul."
        ).then(setConversationStageFeelings);
      }
      break;
    case 'feelings':
      break;
    case 'joke':
      break;
    case 'ad':
      break;
    default:
      throw new Error('unknown conversation phase');
  }
  // ui.setAudioAnalysis(getEmotionAnalysisHtml(res.emotions));
  //
  // setTimeout(() => {
  //   ui.setAudioStatus('Listening...');
  //   ui.setUserText();
  //   ui.setAudioAnalysis();
  // }, showUserTextTimeout);
}

function handleAudioProcessingError(error) {
  console.log('error processing audio', error);
  // setTimeout(() => {
  //   ui.setAudioStatus('Listening...');
  //   ui.setUserText();
  //   ui.setAudioAnalysis();
  // }, showUserTextTimeout);
}

function resetConversation() {
  conversationPhase = 'start';
}

function setConversationStage(stage) {
  console.log('setting conversation stage', stage);
  switch (stage) {
    case 'start':
      setConversationStageStart();
      break;
    case 'feelings':
      break;
    case 'joke':
      break;
    case 'ad':
      break;
    case 'end':
      break;
    default:
      console.log('cannot set unknown conversation stage', stage);
      break;
  }

  keepAwake();
}

function setConversationStageStart() {
  conversationPhase = 'start';
  ui.setConversationStage('start');
  // asyncBotSay('Say "Start" to begin conversation.');
}

function setConversationStageFeelings() {
  conversationPhase = 'feelings';
  ui.setConversationStage('feelings');
  asyncBotSay("I'm in my feelings");
  // hideSections(['video-analysis-wrap', 'audio-analysis-wrap']);
  // resetSections('video-analysis', 'audio-analysis');
  // setBotText('Start Conversation');
}

function asyncBotSay(text) {
  return audio
    .asyncGenerateAndSay(text)
    .then(res => {
      ui.setBotText(text);
      console.log('bot say success', res);
    })
    .catch(e => {
      console.log('error saying', text, e);
    });
}

function keepAwake() {
  screensaver.keepAwake(screensaverTimeoutLength, resetConversation, goToSleep);
}

function goToSleep() {
  screensaver.start();
  audio.stopListening();
  resetConversation();
}

function wakeUp() {
  screensaver.stop();
}

function setFaceStatus(newFaceStatus) {
  faceInFrame = newFaceStatus === true;

  if (faceInFrame === true) {
    ui.setVideoStatus('Face in frame');
    // $faceStatus.text('Face in frame');
    // $emotionsWrap.show();
  } else {
    ui.setVideoStatus('No face in frame');
    // $faceStatus.text('No face in frame');
    // $emotionsWrap.hide();
  }
  faceInFrame = newFaceStatus === true;
}

function getFaceStatus() {
  return faceInFrame === true;
}

function getProcessEmotionsStatus() {
  return processEmotions === true;
}

exports.asyncInit = asyncInit;
exports.resetConversation = resetConversation;
exports.asyncBotSay = asyncBotSay;
exports.handleAudioProcessingSuccess = handleAudioProcessingSuccess;
exports.handleAudioProcessingError = handleAudioProcessingError;
exports.setConversationStage = setConversationStage;
exports.keepAwake = keepAwake;
exports.setFaceStatus = setFaceStatus;
exports.getFaceStatus = getFaceStatus;
exports.getProcessEmotionsStatus = getProcessEmotionsStatus;
