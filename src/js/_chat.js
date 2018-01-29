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
const neutralityThreshold = config.emotions.neutralityThreshold;

let faceInFrame = false;

let listening = false;
let recording = false;
let talking = false;

let repeatTimeout = null;

let updateVideoChart = false;

let conversationPhase = 'start';
const conversation = config.chat.conversationMap;

let mostRecentJoke = null;

function setRepeatTimeout(repeatText) {
  console.log('setting timeout for', config.chat.repeatTimeoutLength);
  repeatTimeout = setTimeout(() => {
    console.log('repeat!');
    asyncBotAsk(repeatText, null, true);
  }, config.chat.repeatTimeoutLength);
}

function setRefreshTimeout() {
  repeatTimeout = setTimeout(() => {
    console.log('reset!');
    resetConversation();
  }, config.chat.repeatTimeoutLength);
}

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
    audio.setFaceInFrameThisRecording();

    if (recording || updateVideoChart) {
      const processedEmotions = emotions.getVideoEmotionsObj(faces);

      if (processedEmotions !== null) {
        if (recording) emotions.rememberVideoEmotions(processedEmotions);
        if (updateVideoChart) {
          chart.updateVideoData(processedEmotions);
        }
      }
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
      if (text.containsWakeWord(userText)) {
        setConversationStageName();
      } else {
        console.log(
          `"${userText}" does not contain wake word. Continuing to sleep.`
        );
        audio.startListening();
      }
      break;
    case 'name':
      setConversationStageFeelings(userText);
      break;
    case 'feelings':
      setConversationStageFeelingsAnalysis(userText, res.textSentimentScore);
      break;
    case 'joke-ask':
      console.log('1');
      setConversationStageJoke(res.textSentimentScore).then(() => {
        console.log('3');
      });
      console.log('2');
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
  if (ui.getConvoStage() === 'main') {
    asyncBotAsk(
      `I'm sorry, I didn't get that. Say again?`,
      `Sorry, once more? I promise I'm not pulling your leg`
    ).catch(e => {
      console.log('error handling audio processing error');
    });
  } else {
    console.log('error processing audio, ignoring');
    audio.startListening();
  }
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
  // ui.showVideoChart();
  ui.setConversationStage('name');
  recording = false;
  updateVideoChart = true;
  asyncBotSay(
    `Hello, I'm Sal. Over the course of a short conversation, I can watch and listen to you speak to detect your emotions.`
  )
    .then(() => {
      return Promise.delay(0.5 * 1000);
    })
    .then(() => {
      return asyncBotAsk(
        `To begin, what's your name?`,
        `Sorry, I didn't catch that. What's your name?`
      );
    })
    .catch(e => {
      console.log(e);
    });
}

function setConversationStageFeelings(nameText) {
  conversationPhase = 'feelings';
  ui.setConversationStage('feelings');
  // ui.hideCharts(true);

  // make sure name text doesn't contain `my name is` or `my name's`
  const name = text.formatNameStr(nameText);
  asyncBotSay(
    `Hi ${utils.titleCase(name)}. Next, I'll start analyzing your emotions.`
  )
    .then(() => {
      ui.showCameraFeed(true); // fade
      return Promise.delay(1 * 1000);
    })
    .then(() => {
      ui.showVideoChart(true);
      return asyncBotSay(
        'This graph shows my analysis of your facial expressions.'
      );
    })
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      ui.showTextChart(true);
      return asyncBotSay(
        `And this is where I'll show my analysis of your speech content.`
      );
    })
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      // ui.hideCharts(true);
      chart.resetCharts();
      recording = true;
      updateVideoChart = false;
      emotions.resetVideoEmotionsHistory();

      return asyncBotAsk(
        `Let's continue. How are you feeling today?`,
        `Sorry, I didn't catch that. How are you feeling today?`
      );
    })
    .catch(e => {
      console.log(e);
    });
}

function setConversationStageFeelingsAnalysis(response, textSentimentScore) {
  // ui.hideCharts(true);
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

  // ui.showCharts(true);

  console.log('comparisonFeelingText', comparisonFeelingText);
  asyncBotSay(comparisonFeelingText)
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      return setConversationStageJokeAsk();
    })
    .catch(e => {
      console.log(e);
    });
}

function setConversationStageJokeAsk() {
  console.log('joke ask');
  conversationPhase = 'joke-ask';
  ui.setConversationStage('joke-ask');
  chart.resetCharts();
  return asyncBotAsk(
    `Alright, next I'm going to tell you a joke. How does that sound?`,
    `Sorry, I didn't get that. Are you up for a joke?`
  );
}

function setConversationStageJoke(textSentimentScore = 0) {
  audio.stopListening();
  conversationPhase = 'joke';
  ui.setConversationStage('joke');

  let response = '';
  if (textSentimentScore < -1 * neutralityThreshold) {
    response = `Well, too bad. There's no stopping me now.`;
  } else {
    response = `Alright, let's do it.`;
  }

  return asyncBotSay(response)
    .then(() => {
      return Promise.delay(1.5 * 1000);
    })
    .then(() => {
      recording = true;
      updateVideoChart = false;
      chart.resetCharts();
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
      console.log('pre');
      return asyncBotAsk(
        `What did you think of my joke?`,
        `Sorry, I didn't get that. What did you think of my joke?`
      );
    })
    .catch(e => {
      console.log(e);
    });
}

function setConversationStageJokeAnalysis(response, textSentimentScore) {
  // ui.hideCharts(true);
  recording = false;
  updateVideoChart = false;

  const avgVideoEmotions = emotions.getAverageEmotionsFromVideoHistory();
  const formattedTextSentiment = emotions.getFormattedTextSentiment(
    textSentimentScore
  );

  db.logJokeReaction(mostRecentJoke, formattedTextSentiment);

  chart.updateVideoData(avgVideoEmotions);
  chart.updateTextSentimentData(formattedTextSentiment);

  // ui.showCharts(true);

  const comparisonJokeText = text.getComparisonJokeText(
    avgVideoEmotions,
    formattedTextSentiment
  );
  asyncBotSay(comparisonJokeText)
    .then(() => {
      return Promise.delay(1 * 1000);
    })
    .then(() => {
      return asyncBotSay(
        `That’s all I have for you today. Come back another time, and I’ll tell you another joke.`
      );
    })
    .then(() => {
      // RESET EVERYTHING!
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
          setRepeatTimeout(repeatText);
        } else {
          setRefreshTimeout();
        }
        resolve();
      })
      .catch(e => {
        reject(e);
      });
  });
}

function unableToSeeUser() {
  setRefreshTimeout();
  asyncBotSay(
    `Unfortunately, I'm unable to detect any faces in the frame. Please take a step forward if you are able.`
  )
    .then(audio.startListening)
    .catch(e => {
      console.log(e);
      audio.startListening();
    });
}

function asyncBotSay(text) {
  return new Promise((resolve, reject) => {
    if (talking) reject(new Error('bot already talking'));
    ui.showConvoMain(); // make sure

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
        location.reload(); // FIXME idk what is happening to get here

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

  // setTimeout(resetConversation, 2 * 1000); // give enough time for screen to fade out
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
  audio.stopListening();
  console.log('resetting conversation');
  location.reload();
  // chart.resetCharts(true);
  // emotions.resetVideoEmotionsHistory();
  // ui.showPreloading();
  // setTimeout(restartConversation, 7.5 * 1000);
}

function restartConversation() {
  ui.showConvoIntro();
  audio.startListening();
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
exports.unableToSeeUser = unableToSeeUser;
