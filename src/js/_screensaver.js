const config = require('./_config');

const $body = $('body');
const $videoWrapper = $(`#${config.screensaver.videoWrapperId}`);
const $video = $videoWrapper.find('video');
const video = $video[0];

let activated = false;

const videoPlayingClass = config.screensaver.videoPlayingClass;
let screensaverTimeout = null;

function playVideo() {
  video.play();
}

function pauseVideo() {
  video.pause();
}

function stopVideo() {
  pauseVideo();
  video.currentTime = 0;
}

function start() {
  console.log('starting screensaver');
  playVideo();
  $body.addClass(videoPlayingClass);
  activated = true;
}

function stop() {
  console.log('stopping screensaver');
  stopVideo();
  $body.removeClass(videoPlayingClass);
  activated = false;
}

function isActivated() {
  return activated;
}

function keepAwake(timeoutLength, awakeCb, sleepCb) {
  console.log('keepalive');
  if (isActivated()) {
    stop();
    awakeCb();
  }

  clearTimeout(screensaverTimeout);
  screensaverTimeout = setTimeout(sleepCb, timeoutLength);
}

exports.start = start;
exports.stop = stop;
exports.isActivated = isActivated;
exports.keepAwake = keepAwake;
