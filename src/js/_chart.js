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
  const margin = 10;
  const halfMargin = parseInt(margin / 2);
  const barHeight = parseInt(
    chartHeight / Object.keys(emotionColorsMap).length - margin
  );

  sketch.setup = () => {
    sketch.createCanvas(chartWidth, chartHeight);
    sketch.background(255);
    sketch.noLoop();
    sketch.textSize(16);
    sketch.strokeWeight(2);
  };

  sketch.update = data => {
    sketch.background(255);
    const [emotions, emotionVals] = [Object.keys(data), Object.values(data)];

    for (let i = 0; i < emotions.length; i++) {
      const emotion = emotions[i];
      const val = emotionVals[i];
      // console.log(emotion, val);
      const color = emotionColorsMap[emotion];
      // console.log(color);
      sketch.fill(color);
      const barX = halfMargin;
      const barY = halfMargin * (i + 1) + i * barHeight;
      const barWidth = val * (chartWidth - margin);

      sketch.rect(barX, barY, barWidth, barHeight);
      sketch.fill(255);
      sketch.stroke(0);
      sketch.text(emotion, barX, barY, barWidth, barHeight);
      // sketch.rect(
      //   halfMargin,
      //   halfMargin * (i + 1) + barHeight * i,
      //   chartWidth - halfMargin,
      //   barHeight
      // );
    }
  };
}

function setupCharts(videoChartWrapId, audioChartWrapId) {
  videoP5 = new p5(chartFactory, videoChartWrapId);
  audioP5 = new p5(chartFactory, audioChartWrapId);
}

function updateVideoData(data) {
  // console.log(data);
  videoP5.update(data);
}

function updateAudioData(data) {
  // audioP5.update(data);
}

exports.setupCharts = setupCharts;
exports.updateVideoData = updateVideoData;
exports.updateAudioData = updateAudioData;
