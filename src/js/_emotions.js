const Promise = require('bluebird');

const chat = require('./_chat');
const ui = require('./_ui');
const config = require('./_config');
const chart = require('./_chart');

let videoEmotions = [];
// let audioEmotions = [];
const emotionThreshold = 0;

let videoEmotionsHistory = [];

const emotionsMap = config.emotions.emotionsMap;

function getEmotionColorByName(emotionName) {
  if (emotionName in emotionsMap) return emotionsMap[emotionName].color;
  throw new Error('unknown emotion', emotionName);
}

function getFormattedTextSentiment(sentimentScore) {
  sentimentScore = parseInt(sentimentScore * 100) / 100;

  const formattedScore = [];
  let sentimentRating = null;

  if (sentimentScore < 0.4) {
    sentimentRating = 'negative';
  } else if (sentimentScore < 0.6) {
    sentimentRating = 'neutral';
  } else {
    sentimentRating = 'positive';
  }

  return [
    {
      name: sentimentRating,
      val: sentimentScore,
      color: getEmotionColorByName(sentimentRating)
    }
  ];
}

// function getAudioEmotionsArray(emotionsObj) {
//   const emotionsArray = [];
//
//   for (let emotionName in emotionsObj) {
//     const emotionVal = parseInt(emotionsObj[emotionName] * 100) / 100;
//     if (emotionVal > emotionThreshold) {
//       emotionsArray.push({
//         name: emotionName,
//         val: emotionVal,
//         color: getEmotionColorByName(emotionName)
//       });
//     }
//   }
//
//   if (emotionsArray.length === 0) {
//     return [
//       {
//         name: 'neutral',
//         val: 0.5,
//         color: getEmotionColorByName('neutral')
//       }
//     ];
//   } else {
//     return emotionsArray;
//   }
// }

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

function clearVideoEmotions() {
  videoEmotions = [];
}

// function getAudioEmotions() {
//   return audioEmotions;
// }

function getSumEmotionsFromEmotionsHistory(emotionsHistory) {
  const sumEmotions = {};
  const historyLength = emotionsHistory.length;

  emotionsHistory.map(datum => {
    datum.map(emotion => {
      if (emotion.name in sumEmotions !== true) {
        sumEmotions[emotion.name] = 0;
      }

      sumEmotions[emotion.name] += emotion.val;
    });
  });

  return sumEmotions;
}

function getRawAvgEmotionsFromSumEmotions(sumEmotions) {
  const rawAvgEmotions = [];

  for (let emotionName in sumEmotions) {
    const avgEmotionVal =
      parseInt(sumEmotions[emotionName] / videoEmotionsHistory.length * 100) /
      100;
    rawAvgEmotions.push({
      name: emotionName,
      val: avgEmotionVal,
      color: getEmotionColorByName(emotionName)
    });
  }

  return rawAvgEmotions;
}

function getNormalizedAverageEmotions(emotions) {
  const totalEmotionsVal = emotions.reduce(
    (sum, current) => sum + current.val,
    0
  );

  const normalizedEmotions = [];
  emotions.map(emotion => {
    const normalizedEmotionVal =
      parseInt(emotion.val / totalEmotionsVal * 100) / 100;
    normalizedEmotions.push({
      name: emotion.name,
      val: normalizedEmotionVal,
      color: emotion.color
    });
  });

  return normalizedEmotions;
}

function getAverageEmotionsFromVideoHistory() {
  if (videoEmotionsHistory.length === 0) return null;
  const sumEmotions = getSumEmotionsFromEmotionsHistory(videoEmotionsHistory);
  const rawAvgEmotions = getRawAvgEmotionsFromSumEmotions(sumEmotions);
  const normalizedEmotions = getNormalizedAverageEmotions(rawAvgEmotions);
  return normalizedEmotions;
}

function rememberVideoEmotions(emotions) {
  videoEmotionsHistory.push(emotions);
}

function resetVideoEmotionsHistory() {
  videoEmotionsHistory = [];
}

function getDominantSentimentFromNormalizedVals(normalizedVal) {
  const threshold = 0.25;
  if (normalizedVal < -1 * threshold) {
    return 'negative';
  } else if (normalizedVal < threshold) {
    return 'neutral';
  } else {
    return 'positive';
  }
}

// exports.getVideoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml;
exports.getVideoEmotionsArray = getVideoEmotionsArray;
exports.getFormattedTextSentiment = getFormattedTextSentiment;
// exports.getAudioEmotionsArray = getAudioEmotionsArray
exports.clearVideoEmotions = clearVideoEmotions;
exports.getAverageEmotionsFromVideoHistory = getAverageEmotionsFromVideoHistory;
exports.rememberVideoEmotions = rememberVideoEmotions;
exports.resetVideoEmotionsHistory = resetVideoEmotionsHistory;
exports.getDominantSentimentFromNormalizedVals = getDominantSentimentFromNormalizedVals;
