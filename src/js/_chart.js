let videoCanvas = null;
let audioCanvas = null;

let videoP5 = null;
let audioP5 = null;

const chartWidth = 500;
const chartHeight = 225;

// figure these out?
const emotionColorsMap = {
  neutral: 'darkgray',
  anger: 'red',
  joy: 'yellow',
  sadness: 'blue',
  fear: 'black',
  surprise: 'mediumpurple'
};

function chartFactory(sketch) {
  sketch.setup = () => {
    sketch.createCanvas(chartWidth, chartHeight);
    sketch.background(255);
    sketch.noLoop();
  };

  sketch.update = data => {
    for (emotion in data) {
    }
  };
}

function setupCharts(videoChartWrapId, audioChartWrapId) {
  videoP5 = new p5(chartFactory, videoChartWrapId);
  audioP5 = new p5(chartFactory, audioChartWrapId);
}

function updateVideoData(data) {
  console.log(data);
  // videoP5.update(data);
}

function updateAudioData(data) {
  // audioP5.update(data);
}

exports.setupCharts = setupCharts;
exports.updateVideoData = updateVideoData;
exports.updateAudioData = updateAudioData;
