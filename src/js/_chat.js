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
    case 'joke-ask':
      setConverastionStageJoke(res.textSentimentScore);
      break;
    case 'joke':
      setConversationStageJokeAnalysis(userText, res.textSentimentScore);
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
  asyncBotSay(`I'm sorry, I didn't get that. Say again?`);
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
}

function setConversationStageName() {
  conversationPhase = 'name';
  ui.setConversationStage('name');
  asyncBotSay(`Hello, I'm Sal. What's your name?`);
  recording = false;
  updateVideoChart = true;
}

function setConversationStageFeelings(nameText) {
  conversationPhase = 'feelings';
  ui.setConversationStage('feelings');

  // make sure name text doesn't contain `my name is` or `my name's`
  const name = text.formatNameStr(nameText);

  asyncBotSay(`Hi ${_.capitalize(name)}. How are you feeling today?`);
  recording = true;
  updateVideoChart = false;
  emotions.resetVideoEmotionsHistory();
}

function setConversationStageFeelingsAnalysis(response, textSentimentScore) {
  audio.stopListening();
  // console.log(response, textSentimentScore);
  recording = false;
  updateVideoChart = false;
  const avgVideoEmotions = emotions.getAverageEmotionsFromVideoHistory();
  const formattedTextSentiment = emotions.getFormattedTextSentiment(
    textSentimentScore
  );

  chart.updateVideoData(avgVideoEmotions);
  chart.updateTextSentimentData(formattedTextSentiment);

  const comparisonFeelingText = text.getComparisonFeelingText(
    avgVideoEmotions,
    formattedTextSentiment[0]
  );
  // console.log(comparisonFeelingText);
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
  asyncBotSay(
    `Alright, next I'm going to tell you a joke. How does that sound?`
  );
}

function setConverastionStageJoke(textSentimentScore = 0.5) {
  audio.stopListening();
  conversationPhase = 'joke';
  ui.setConversationStage('joke');

  let response = '';
  if (textSentimentScore < 0.4) {
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
      return asyncBotSay(joke);
    })
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      audio.startListening();
      return asyncBotSay(`What did you think of my joke?`);
    });
}

function setConversationStageJokeAnalysis(response, textSentimentScore) {
  recording = false;
  updateVideoChart = false;
  const avgVideoEmotions = emotions.getAverageEmotionsFromVideoHistory();
  const formattedTextSentiment = emotions.getFormattedTextSentiment(
    textSentimentScore
  );

  chart.updateVideoData(avgVideoEmotions);
  chart.updateTextSentimentData(formattedTextSentiment);

  const comparisonJokeText = text.getComparisonJokeText(
    avgVideoEmotions,
    formattedTextSentiment[0]
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
      location.reload(); // FIXME
    });
}

function asyncBotSay(text) {
  return new Promise((resolve, reject) => {
    audio
      .asyncGenerateAudio(text)
      .then(res => {
        ui.setBotText(text);
        return audio.asyncPlayFromUrl(res.recordingPath);
      })
      .then(res => {
        console.log('bot say success');
        resolve();
      })
      .catch(e => {
        console.log('error saying', text, e);
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
