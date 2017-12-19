const emotions = require('./_emotions');
const config = require('./_config');
const ui = require('./_ui');

const chartWidth = config.chart.width;
const chartHeight = config.chart.height;

let videoCanvas = null;
let audioCanvas = null;

let videoP5 = null;
let audioP5 = null;

let updateVideoChart = false;
let updateAudioChart = false;

// let updateCharts = false;

// figure these out?
const emotionsMap = config.emotions.emotionsMap;

function chartFactoryFactory(getData, updateChartFunction) {
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
      sketch.noLoop();
    };

    sketch.draw = () => {
      return;
      if (true === true) {
        // console.log('update');
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
        } else {
          // console.log('not new data');
        }
      } else {
        // console.log('not update');
        sketch.background(255);
      }
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

      // // const newData = getData();
      // if (JSON.stringify(data) !== chartDataStr) {
      //   console.log('new data', newData);
      //
      // } else {
      //   // console.log('not new data');
      // }
    };
  };
}

function setupCharts(videoChartWrapId, audioChartWrapId) {
  const videoChartFactory = chartFactoryFactory(
    emotions.getVideoEmotions,
    getUpdateVideoChartStatus
  );
  videoP5 = new p5(videoChartFactory, videoChartWrapId);

  const audioChartFactory = chartFactoryFactory(
    emotions.getAudioEmotions,
    getUpdateAudioChartStatus
  );
  audioP5 = new p5(audioChartFactory, audioChartWrapId);
}

function getUpdateVideoChartStatus() {
  return updateVideoChart === true;
}

function getUpdateAudioChartStatus() {
  return updateAudioChart === true;
}

function updateVideoData(data = []) {
  ui.showSection('video-analysis-wrap');
  videoP5.update(data);
}

function updateAudioData(data = []) {
  ui.showSection('audio-analysis-wrap');
  audioP5.update(data);
}

function setVideoUpdateStatus(newStatus) {
  updateVideoChart = newStatus === true;
}

function setAudioUpdateStatus(newStatus) {
  updateAudioChart = newStatus === true;
}

exports.setupCharts = setupCharts;
exports.updateVideoData = updateVideoData;
exports.updateAudioData = updateAudioData;
exports.setVideoUpdateStatus = setVideoUpdateStatus;
exports.setAudioUpdateStatus = setAudioUpdateStatus;
