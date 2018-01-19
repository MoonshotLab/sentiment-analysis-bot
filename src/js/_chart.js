const emotions = require('./_emotions');
const config = require('./_config');
const ui = require('./_ui');

const _ = require('lodash');

const chartWidth = config.chart.width;
const chartHeight = config.chart.height;

let videoCanvas = null;
let audioCanvas = null;

let videoP5 = null;
let textSentimentP5 = null;

let updateVideoChart = false;
let updateAudioChart = false;

// let updateCharts = false;

// figure these out?
const emotionsMap = config.emotions.emotionsMap;

function visualAnalysisChart(sketch) {
  const emotionsBase = {
    joy: 0,
    sadness: 0,
    anger: 0,
    surprise: 0
  };

  let currentChartData = Object.assign({}, emotionsBase);
  let targetChartData = Object.assign({}, emotionsBase);

  const outerMargin = 10;
  const circleSpacing = outerMargin / 2;

  const lerpAmt = 0.15;

  const [innerWidth, innerHeight] = [
    chartWidth - outerMargin * 2,
    chartHeight - outerMargin * 2
  ];
  const [halfInnerWidth, halfInnerHeight] = [innerWidth / 2, innerHeight / 2];

  // when emotion is not 'neutral', chart is as follows:
  // joy sadness
  // anger surprise
  // when neutral, simply display 'Neutral' text, centered

  let circleMaxRadius = 0;
  if (chartWidth < chartHeight) {
    circleMaxRadius = halfInnerWidth / 2;
  } else {
    circleMaxRadius = halfInnerHeight / 2;
  }
  circleMaxRadius -= circleSpacing * 2;
  const circleOffset = circleSpacing + circleMaxRadius;

  let circleRadius = circleMaxRadius;

  let callunaSansBlack = null;

  sketch.preload = () => {
    callunaSansBlack = sketch.loadFont('/fonts/calluna-sans-black.otf');
  };

  sketch.setup = () => {
    sketch.createCanvas(chartWidth, chartHeight);
    sketch.background(51);
    sketch.textSize(16);
    sketch.textFont(callunaSansBlack);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.rectMode(sketch.CENTER);
    sketch.ellipseMode(sketch.RADIUS);
    sketch.strokeWeight(1);
  };

  sketch.draw = () => {
    let [circleX, circleY] = [null, null];
    sketch.background(51);

    let neutral = true;
    sketch.noStroke();
    Object.keys(emotionsBase).map((emotionName, i) => {
      const currentVal = currentChartData[emotionName] || 0;
      const targetVal = targetChartData[emotionName] || 0;
      const lerpVal =
        parseInt(sketch.lerp(currentVal, targetVal, lerpAmt) * 100) / 100;

      if (lerpVal > 0) {
        neutral = false;
      }

      switch (emotionName) {
        case 'joy':
          sketch.fill('#FFCB05');
          circleX = halfInnerWidth - circleOffset;
          circleY = halfInnerHeight - circleOffset;
          break;
        case 'sadness':
          sketch.fill('#0071BC');
          circleX = halfInnerWidth + circleOffset;
          circleY = halfInnerHeight - circleOffset;
          break;
        case 'anger':
          sketch.fill('#DD431F');
          circleX = halfInnerWidth - circleOffset;
          circleY = halfInnerHeight + circleOffset;
          break;
        case 'surprise':
          sketch.fill('#D7CE2A');
          circleX = halfInnerWidth + circleOffset;
          circleY = halfInnerHeight + circleOffset;
          break;
      }

      circleRadius = circleMaxRadius * lerpVal;
      if (circleRadius > 0) {
        sketch.ellipse(circleX, circleY, circleRadius, circleRadius);
        sketch.fill('white');
        sketch.rectMode(sketch.CENTER);

        sketch.stroke(0);
        sketch.text(_.capitalize(emotionName), circleX, circleY - 2);
      }

      currentChartData[emotionName] = lerpVal;
    });

    sketch.stroke(0);
    if (neutral === true) {
      sketch.background(51);
      sketch.fill('#C7B299');
      circleX = halfInnerWidth;
      circleY = halfInnerHeight;
      circleRadius = circleMaxRadius;
      sketch.ellipse(circleX, circleY, circleRadius, circleRadius);
      sketch.fill('white');
      sketch.rectMode(sketch.CENTER);

      sketch.stroke(0);
      sketch.text(_.capitalize('neutral'), circleX, circleY - 2);
    }
  };

  sketch.update = newData => {
    // console.log('update video data', newData);
    targetChartData = newData;
  };
}

function textAnalysisChart(sketch) {
  const emotionBase = {
    name: null,
    val: 0
  };
  let currentChartData = Object.assign({}, emotionBase);
  let targetChartData = Object.assign({}, emotionBase);

  const outerMargin = 10;

  const lerpAmt = 0.15;

  const [innerWidth, innerHeight] = [
    chartWidth - outerMargin * 2,
    chartHeight - outerMargin * 2
  ];
  const [halfInnerWidth, halfInnerHeight] = [innerWidth / 2, innerHeight / 2];

  // when emotion is not 'neutral', chart is as follows:
  // joy sadness
  // anger surprise
  // when neutral, simply display 'Neutral' text, centered

  let circleMaxRadius = 0;
  if (chartWidth < chartHeight) {
    circleMaxRadius = halfInnerWidth / 2;
  } else {
    circleMaxRadius = halfInnerHeight / 2;
  }

  const [circleX, circleY] = [halfInnerWidth, halfInnerHeight]; // since there's only one circle, this stays constant

  let circleRadius = circleMaxRadius;

  let callunaSansBlack = null;

  sketch.preload = () => {
    callunaSansBlack = sketch.loadFont('/fonts/calluna-sans-black.otf');
  };

  sketch.setup = () => {
    sketch.createCanvas(chartWidth, chartHeight);
    sketch.background(51);
    sketch.textSize(16);
    sketch.textFont(callunaSansBlack);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.rectMode(sketch.CENTER);
    sketch.ellipseMode(sketch.RADIUS);
    sketch.strokeWeight(1);
  };

  sketch.draw = () => {
    sketch.background(51);
    sketch.noStroke();

    if (currentChartData.length === 0) return;

    if (Object.keys(targetChartData).length > 0) {
      currentChartData.name = targetChartData.name;

      const currentVal = currentChartData.val || 0;
      const targetVal = targetChartData.val || 0;
      const lerpVal =
        parseInt(sketch.lerp(currentVal, targetVal, lerpAmt) * 100) / 100;

      switch (currentChartData.name) {
        case 'positive':
          sketch.fill('#93D5D9');
          break;
        case 'neutral':
          sketch.fill('#C7B299');
          break;
        case 'negative':
          sketch.fill('#C83E31');
          break;
      }

      circleRadius = circleMaxRadius * lerpVal;
      if (circleRadius > 0) {
        sketch.ellipse(circleX, circleY, circleRadius, circleRadius);

        sketch.fill('white');
        sketch.rectMode(sketch.CENTER);

        sketch.stroke(0);
        sketch.text(
          _.capitalize(currentChartData.name),
          circleX,
          circleY + 4,
          circleMaxRadius,
          circleMaxRadius
        );
      }

      currentChartData.val = lerpVal;
    }
  };

  sketch.update = newData => {
    console.log('new text sentiment data', newData);
    targetChartData = newData;
  };
}

function setupCharts(videoChartWrapId, textSentimentChartWrapId) {
  videoP5 = new p5(visualAnalysisChart, videoChartWrapId);
  textSentimentP5 = new p5(textAnalysisChart, textSentimentChartWrapId);
}

function updateVideoData(data = []) {
  ui.showSection('video-analysis-wrap');
  videoP5.update(data);
}

function updateTextSentimentData(data = {}) {
  ui.showSection('text-analysis-wrap');

  // invert negative so that high negative values are 1-radius rather than 0 so they're visible
  if ('name' in data && data.name === 'negative') {
    data.val = 1 - data.val;
  }

  textSentimentP5.update(data);
}

function resetCharts(hideSection = true) {
  if (hideSection === true) {
    ui.hideAnalysisSections();
  }

  updateVideoData();
  updateTextSentimentData();
}

exports.setupCharts = setupCharts;
exports.updateVideoData = updateVideoData;
exports.updateTextSentimentData = updateTextSentimentData;
exports.resetCharts = resetCharts;
