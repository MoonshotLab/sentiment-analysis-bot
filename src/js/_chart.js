const emotions = require('./_emotions');
const config = require('./_config');
const ui = require('./_ui');

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

function chartFactory(sketch) {
  let chartData = null;
  let chartDataStr = null;

  const margin = 10;
  const halfMargin = parseInt(margin / 2);
  const barHeight = parseInt(
    chartHeight / Object.keys(emotionsMap).length - margin
  );

  sketch.setup = () => {
    sketch.createCanvas(chartWidth, chartHeight);
    sketch.background(255);
    sketch.textSize(16);
    sketch.strokeWeight(2);
    sketch.noLoop();
  };

  sketch.update = newData => {
    chartData = newData;
    chartDataStr = JSON.stringify(chartData);

    sketch.background(255);
    // data is different, update
    newData.map((emotion, i) => {
      sketch.fill(emotion.color);
      const barX = halfMargin;
      const barY = halfMargin * (i + 1) + i * barHeight;
      const barWidth = emotion.val * (chartWidth - margin);

      sketch.rect(barX, barY, barWidth, barHeight);
      sketch.fill(255);
      sketch.stroke(0);
      sketch.text(emotion.name, barX, barY, barWidth, barHeight);
    });

    chartData = newData;
    chartDataStr = JSON.stringify(chartData);
  };
}

function setupCharts(videoChartWrapId, textSentimentChartWrapId) {
  videoP5 = new p5(chartFactory, videoChartWrapId);
  textSentimentP5 = new p5(chartFactory, textSentimentChartWrapId);
}

function updateVideoData(data = []) {
  ui.showSection('video-analysis-wrap');
  videoP5.update(data);
}

function updateTextSentimentData(data = []) {
  ui.showSection('text-analysis-wrap');
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
