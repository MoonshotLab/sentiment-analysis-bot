const Promise = require('bluebird');
const _ = require('lodash');

const audio = require('./_audio');
const ui = require('./_ui');
const utils = require('./_utils');
const screensaver = require('./_screensaver');
const config = require('./_config');
const emotions = require('./_emotions');
const chart = require('./_chart');

const screensaverTimeoutLength = config.chat.defaultScreensaverTimeoutLength; // ms

let faceInFrame = false;

let listening = false;
let recording = false;

let updateVideoChart = false;

let conversationPhase = 'start';
const conversation = config.chat.conversationMap;

function asyncInit() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

function processVideoFrame(faces) {
  const newFaceStatus = faces.length > 0;
  if (newFaceStatus === true) {
    keepAwake();

    if (recording || updateVideoChart) {
      const processedEmotions = emotions.getVideoEmotionsArray(faces);

      if (recording) emotions.rememberVideoEmotions(processedEmotions);
      if (updateVideoChart) chart.updateVideoData(processedEmotions);
    }

    if (listening !== true) {
      audio.startListening();
      listening = true;
    }
  } else {
    if (updateVideoChart) chart.updateVideoData();
  }

  if (newFaceStatus !== faceInFrame) {
    setFaceStatus(newFaceStatus);
  }
}

function handleAudioProcessingSuccess(res) {
  const userText = res.transcription;
  console.log(res);

  console.log('text', userText, 'conversation phase', conversationPhase);
  ui.setUserText(userText);

  switch (conversationPhase) {
    case 'start':
      if (utils.strHas(userText, 'start') !== true) {
        setConversationStageName();
      } else {
        asyncBotSay(
          "Although I don't think you said 'Start Conversation', let's go ahead and get started. No harm, no foul."
        ).then(setConversationStageName);
      }
      break;
    case 'name':
      setConversationStageFeelings(userText);
      break;
    case 'feelings':
      setConversationStageFeelingsAnalysis(userText, res.textSentimentScore);
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
  recording = false;
  updateVideoChart = true;
  // emotions.startMonitoringVideo();
  // setTimeout(() => {
  //   emotions.stopMonitoringVideo();
  // }, 5 * 1000);
  // asyncBotSay('Say "Start" to begin conversation.');
}

function setConversationStageName() {
  conversationPhase = 'name';
  ui.setConversationStage('name');
  asyncBotSay(`Hello, I'm Emobot. What's your name?`);
  recording = false;
  updateVideoChart = true;
  // hideSections(['video-analysis-wrap', 'text-analysis-wrap']);
  // resetSections('video-analysis', 'audio-analysis');
  // setBotText('Start Conversation');
}

function setConversationStageFeelings(name) {
  conversationPhase = 'feelings';
  ui.setConversationStage('feelings');
  asyncBotSay(`Hi ${_.capitalize(name)}. How are you feeling today?`);
  recording = true;
  updateVideoChart = false;
  emotions.resetVideoEmotionsHistory();

  // asyncBotSay("I'm in my feelings");
  // hideSections(['video-analysis-wrap', 'text-analysis-wrap']);
  // resetSections('video-analysis', 'audio-analysis');
  // setBotText('Start Conversation');
}

function setConversationStageFeelingsAnalysis(response, textSentimentScore) {
  console.log(response, textSentimentScore);
  recording = false;
  updateVideoChart = false;
  const avgEmotions = emotions.getAverageEmotionsFromVideoHistory();
  // console.log(avgEmotions);
  // const formattedAudioSentiment
  const formattedTextSentiment = emotions.getFormattedTextSentiment(
    textSentimentScore
  );
  chart.updateVideoData(avgEmotions);
  chart.updateTextSentimentData(formattedTextSentiment);
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
    emotions.clearVideoEmotions();
    // $faceStatus.text('No face in frame');
    // $emotionsWrap.hide();
  }
  faceInFrame = newFaceStatus === true;
}

function getFaceStatus() {
  return faceInFrame === true;
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
exports.processVideoFrame = processVideoFrame;
