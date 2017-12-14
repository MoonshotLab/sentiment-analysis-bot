const Promise = require('bluebird');

const chat = require('./_chat');
const ui = require('./_ui');

let videoEmotions = {};
let textEmotions = {};
const emotionThreshold = 0;

function formatVideoEmotions(facesInfo) {
  if (facesInfo.length == 0) return null;

  // for now, only consider first face
  const emotions = facesInfo[0].emotions;
  const formattedEmotions = {};

  for (let emotion in emotions) {
    const emotionVal = parseInt(emotions[emotion]) / 100;
    if (emotionVal > emotionThreshold) formattedEmotions[emotion] = emotionVal;
  }

  // return formattedEmotions;

  if (Object.keys(formattedEmotions).length === 0) {
    return {
      neutral: 0.5
    };
  } else {
    return formattedEmotions;
  }
}

function processVideoFrame(facesInfo) {
  if (chat.getProcessEmotionsStatus() === true) {
    const emotions = formatVideoEmotions(facesInfo);
    ui.processVideoEmotions(emotions);
  }
}

// exports.getVideoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml;
exports.formatVideoEmotions = formatVideoEmotions;
exports.processVideoFrame = processVideoFrame;
