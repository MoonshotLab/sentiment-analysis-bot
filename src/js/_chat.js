const Promise = require('bluebird');
const _ = require('lodash');

const audio = require('./_audio');
const ui = require('./_ui');
const utils = require('./_utils');
const text = require('./_text');
const screensaver = require('./_screensaver');
const config = require('./_config');
const emotions = require('./_emotions');
const chart = require('./_chart');
const db = require('./_db');

const screensaverTimeoutLength = config.chat.defaultScreensaverTimeoutLength; // ms

let faceInFrame = false;

let listening = false;
let recording = false;
let talking = false;

let repeatTimeout = null;

let updateVideoChart = false;

let conversationPhase = 'start';
const conversation = config.chat.conversationMap;

let mostRecentJoke = null;

function clearRepeatTimeout() {
  clearTimeout(repeatTimeout);
}

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
      const processedEmotions = emotions.getVideoEmotionsObj(faces);

      if (recording) emotions.rememberVideoEmotions(processedEmotions);
      if (updateVideoChart) chart.updateVideoData(processedEmotions);
    }
  } else {
    if (updateVideoChart) chart.updateVideoData();
  }

  if (newFaceStatus !== faceInFrame) {
    setFaceStatus(newFaceStatus);
  }
}

function handleAudioProcessingSuccess(res) {
  clearTimeout(repeatTimeout);

  const userText = res.transcription;
  console.log(res);

  console.log('text', userText, 'conversation phase', conversationPhase);
  ui.setUserText(userText);

  switch (conversationPhase) {
    case 'start':
      setConversationStageName();
      break;
    case 'name':
      setConversationStageFeelings(userText);
      break;
    case 'feelings':
      setConversationStageFeelingsAnalysis(userText, res.textSentimentScore);
      break;
    case 'joke-ask':
      setConversationStageJoke(res.textSentimentScore);
      break;
    case 'joke':
      setConversationStageJokeAnalysis(userText, res.textSentimentScore);
      break;
    case 'ad':
      break;
    default:
      throw new Error('unknown conversation phase');
  }
}

function handleAudioProcessingError(error) {
  clearTimeout(repeatTimeout);
  console.log('error processing audio', error);
  asyncBotAsk(
    `I'm sorry, I didn't get that. Say again?`,
    `Sorry, once more? I promise I'm not pulling your leg`
  );
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
  audio.startListening();
  recording = false;
  updateVideoChart = true;
}

function setConversationStageName() {
  conversationPhase = 'name';
  ui.showConvoMain();
  ui.showVideoChart();
  ui.setConversationStage('name');
  asyncBotAsk(
    `Hello, I'm Sal. What's your name?`,
    `I didn't catch that. What should I call you?`
  );
  recording = false;
  updateVideoChart = true;
}

function setConversationStageFeelings(nameText) {
  conversationPhase = 'feelings';
  ui.setConversationStage('feelings');
  ui.hideCharts();

  // make sure name text doesn't contain `my name is` or `my name's`
  const name = text.formatNameStr(nameText);

  asyncBotAsk(
    `Hi ${utils.titleCase(name)}. How are you feeling today?`,
    `I didn't catch that. How are you feeling today?`
  );
  recording = true;
  updateVideoChart = false;
  emotions.resetVideoEmotionsHistory();
}

function setConversationStageFeelingsAnalysis(response, textSentimentScore) {
  ui.hideCharts();
  audio.stopListening();
  // console.log(response, textSentimentScore);
  recording = false;
  updateVideoChart = false;
  const avgVideoEmotions = emotions.getAverageEmotionsFromVideoHistory();
  console.log('textsentimentscore before', textSentimentScore);
  const formattedTextSentiment = emotions.getFormattedTextSentiment(
    textSentimentScore
  );

  console.log('avgVideoEmotions before', avgVideoEmotions);
  chart.updateVideoData(avgVideoEmotions);
  console.log('avgVideoEmotions after', avgVideoEmotions);

  console.log('formattedTextSentiment before', formattedTextSentiment);
  chart.updateTextSentimentData(formattedTextSentiment);
  console.log('formattedTextSentiment after', formattedTextSentiment);

  const comparisonFeelingText = text.getComparisonFeelingText(
    avgVideoEmotions,
    formattedTextSentiment
  );

  ui.showCharts();

  console.log('comparisonFeelingText', comparisonFeelingText);
  asyncBotSay(comparisonFeelingText)
    .then(() => {
      return Promise.delay(2 * 1000);
    })
    .then(() => {
      setConversationStageJokeAsk();
    })
    .catch(e => {
      console.log(e);
    });
}

function setConversationStageJokeAsk() {
  console.log('joke ask');
  audio.startListening();
  conversationPhase = 'joke-ask';
  ui.setConversationStage('joke-ask');
  chart.resetCharts(true);
  asyncBotAsk(
    `Alright, next I'm going to tell you a joke. How does that sound?`,
    `Sorry, I didn't get that. Are you up for a joke?`
  );
}

function setConversationStageJoke(textSentimentScore = 0) {
  audio.stopListening();
  conversationPhase = 'joke';
  ui.setConversationStage('joke');

  let response = '';
  if (textSentimentScore < -1 * 0.3) {
    response = `Well, too bad. There's no stopping me now.`;
  } else {
    response = `Alright, let's do it.`;
  }

  asyncBotSay(response)
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      recording = true;
      updateVideoChart = false;
      emotions.resetVideoEmotionsHistory();

      const joke = text.getRandomJoke();
      mostRecentJoke = joke;

      return asyncBotSay(joke);
    })
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      audio.startListening();
      return asyncBotAsk(
        `What did you think of my joke?`,
        `Sorry, I didn't get that. What did you think of my joke?`
      );
    });
}

function setConversationStageJokeAnalysis(response, textSentimentScore) {
  ui.hideCharts();
  recording = false;
  updateVideoChart = false;

  const avgVideoEmotions = emotions.getAverageEmotionsFromVideoHistory();
  const formattedTextSentiment = emotions.getFormattedTextSentiment(
    textSentimentScore
  );

  db.logJokeReaction(mostRecentJoke, formattedTextSentiment);

  chart.updateVideoData(avgVideoEmotions);
  chart.updateTextSentimentData(formattedTextSentiment);

  ui.showCharts();

  const comparisonJokeText = text.getComparisonJokeText(
    avgVideoEmotions,
    formattedTextSentiment
  );
  asyncBotSay(comparisonJokeText)
    .then(() => {
      return Promise.delay(2 * 1000);
    })
    .then(() => {
      return asyncBotSay(
        `That’s all I have for you today. Come back another time, and I’ll tell you another joke.`
      );
    })
    .then(() => {
      // RESET EVERYTHING!
      // location.reload(); // FIXME
      resetConversation();
    });
}

function asyncBotAsk(text, repeatText = text, isRepeat = false) {
  return new Promise((resolve, reject) => {
    clearTimeout(repeatTimeout);

    asyncBotSay(text)
      .then(() => {
        audio.startListening();

        if (isRepeat !== true) {
          console.log('setting timeout for', config.chat.repeatTimeoutLength);
          repeatTimeout = setTimeout(() => {
            console.log('repeat!');
            asyncBotAsk(repeatText, null, true);
          }, config.chat.repeatTimeoutLength);
        } else {
          repeatTimeout = setTimeout(() => {
            console.log('reset!');
            resetConversation();
          }, config.chat.repeatTimeoutLength);
        }
        resolve();
      })
      .catch(e => {
        reject(e);
      });
  });
}

function asyncBotSay(text) {
  return new Promise((resolve, reject) => {
    if (talking) reject(new Error('bot already talking'));

    talking = true;
    audio.stopListening();
    audio
      .asyncGenerateAudio(text)
      .then(res => {
        ui.setBotText(text);
        return audio.asyncPlayFromUrl(res.recordingPath);
      })
      .then(res => {
        console.log('bot say success');
        talking = false;

        resolve();
      })
      .catch(e => {
        console.log('error saying', text, e);
        talking = false;
        reject(e);
      });
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
  audio.startListening();
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

function resetConversation() {
  console.log('resetting conversation');
  chart.resetCharts(true);
  audio.startListening();
  emotions.resetVideoEmotionsHistory();
  ui.showPreloading();
  setTimeout(ui.showConvoIntro, 5 * 1000);
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
exports.setConversationStageName = setConversationStageName;
exports.clearRepeatTimeout = clearRepeatTimeout;
