const emotions = require('./_emotions');
const config = require('./_config');

const chartWidth = config.chart.width;
const chartHeight = config.chart.height;

let videoCanvas = null;
let audioCanvas = null;

let videoP5 = null;
let audioP5 = null;

let drawVideoChart = false;
let drawAudioChart = false;

// figure these out?
const emotionsMap = config.emotions.emotionsMap;

function chartFactoryFactory(getData, drawChartFunction) {
  // lol
  return sketch => {
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
    };

    sketch.draw = () => {
      if (drawChartFunction() === true) {
        const newData = getData();
        if (JSON.stringify(newData) !== chartDataStr) {
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
        }
      } else {
        sketch.background(255);
      }
    };
  };
}

function setupCharts(videoChartWrapId, audioChartWrapId) {
  const videoChartFactory = chartFactoryFactory(
    emotions.getVideoEmotions,
    getDrawVideoChartStatus
  );
  videoP5 = new p5(videoChartFactory, videoChartWrapId);

  const audioChartFactory = chartFactoryFactory(
    emotions.getAudioEmotions,
    getDrawAudioChartStatus
  );
  audioP5 = new p5(audioChartFactory, audioChartWrapId);
}

function getDrawVideoChartStatus() {
  return drawVideoChart === true;
}

function getDrawAudioChartStatus() {
  return drawAudioChart === true;
}

function updateVideoData(data) {
  // console.log(data);
  // videoP5.update(data);
}

function updateAudioData(data) {
  // audioP5.update(data);
}

function startVideoChart() {
  drawVideoChart = true;
}

function startAudioChart() {
  drawAudioChart = true;
}

exports.setupCharts = setupCharts;
exports.updateVideoData = updateVideoData;
exports.updateAudioData = updateAudioData;
exports.startVideoChart = startVideoChart;
exports.startAudioChart = startAudioChart;
