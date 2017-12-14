const Promise = require('bluebird');

const chat = require('./_chat');
const ui = require('./_ui');
const config = require('./_config');

let videoEmotions = [];
let audioEmotions = [];
const emotionThreshold = 0;

const emotionsMap = config.emotions.emotionsMap;

function getEmotionColorByName(emotionName) {
  if (emotionName in emotionsMap) return emotionsMap[emotionName].color;
  throw new Error('unknown emotion', emotionName);
}

function getVideoEmotionsArray(facesInfo) {
  if (facesInfo.length == 0) return null;

  // for now, only consider first face
  const emotions = facesInfo[0].emotions;
  const emotionsArray = [];

  for (let emotionName in emotions) {
    const emotionVal = parseInt(emotions[emotionName]) / 100;
    if (emotionVal > emotionThreshold) {
      emotionsArray.push({
        name: emotionName,
        val: emotionVal,
        color: getEmotionColorByName(emotionName)
      });
    }
  }

  if (emotionsArray.length === 0) {
    return [
      {
        name: 'neutral',
        val: 0.5,
        color: getEmotionColorByName('neutral')
      }
    ];
  } else {
    return emotionsArray;
  }
}

function processVideoFrame(facesInfo) {
  if (chat.getProcessEmotionsStatus() === true) {
    videoEmotions = getVideoEmotionsArray(facesInfo);
    ui.processVideoEmotions(videoEmotions);
  }
}

function getVideoEmotions() {
  return videoEmotions;
}

function getAudioEmotions() {
  return audioEmotions;
}

// exports.getVideoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml;
exports.getVideoEmotionsArray = getVideoEmotionsArray;
exports.processVideoFrame = processVideoFrame;
exports.getVideoEmotions = getVideoEmotions;
exports.getAudioEmotions = getAudioEmotions;
