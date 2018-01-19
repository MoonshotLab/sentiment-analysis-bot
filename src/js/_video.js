const Promise = require('bluebird');

const config = require('./_config');
const ui = require('./_ui');
const audio = require('./_audio');
const chat = require('./_chat');
const emotions = require('./_emotions');
const chart = require('./_chart');

let detector;
let detectorRunning = false;
let frames = 0;

function hookUpDetectorEvents(detector) {
  detector.addEventListener('onInitializeSuccess', e => {
    ui.setVideoStatus('Watching');
    chat.setConversationStage('start');
  });

  detector.addEventListener('onInitializeFailure', e => {
    console.log('initialize failure');
    console.log(e);
    ui.setVideoStatus('Initialization Error');
  });

  /*
  onImageResults success is called when a frame is processed successfully and receives 3 parameters:
  - Faces: Dictionary of faces in the frame keyed by the face id.
           For each face id, the values of detected emotions, expressions, appearane metrics
           and coordinates of the feature points
  - image: An imageData object containing the pixel values for the processed frame.
  - timestamp: The timestamp of the captured image in seconds.
  */
  detector.addEventListener('onImageResultsSuccess', function(
    faces,
    image,
    timestamp
  ) {
    frames++;
    if (frames % 2 === 0) chat.processVideoFrame(faces);
    if (frames > 100) frames = 0;
  });

  /*
  onImageResults success receives 3 parameters:
  - image: An imageData object containing the pixel values for the processed frame.
  - timestamp: An imageData object contain the pixel values for the processed frame.
  - err_detail: A string contains the encountered exception.
  */
  detector.addEventListener('onImageResultsFailure', function(
    image,
    timestamp,
    err_detail
  ) {
    console.log('image result failure');
    ui.setVideoStatus('Error watching');
    console.log(image, timestamp, err_detail);
  });

  detector.addEventListener('onResetSuccess', e => {
    console.log('reset success');
    console.log(e);
    ui.setVideoStatus('Successfully reset');
  });

  detector.addEventListener('onResetFailure', e => {
    console.log('reset failure');
    console.log(e);
    ui.setVideoStatus('Reset error');
  });

  detector.addEventListener('onStopSuccess', e => {
    console.log('stop success');
    console.log(e);
    ui.setVideoStatus('Stopped');
  });

  detector.addEventListener('onStopFailure', e => {
    console.log('stop failure');
    console.log(e);
    ui.setVideoStatus('Error stopping');
  });

  detector.addEventListener('onWebcamConnectSuccess', () => {
    ui.setVideoStatus('Connected');
  });

  detector.addEventListener('onWebcamConnectFailure', () => {
    ui.setVideoStatus('Error connecting');
  });
}

function configureDetector(detector) {
  // detector.detectAllExpressions();
  // detector.detectAllEmotions();
  // detector.detectAllEmojis();
  // detector.detectAllAppearance();

  detector.detectEmotions.anger = true;
  detector.detectEmotions.joy = true;
  detector.detectEmotions.fear = false;
  detector.detectEmotions.sadness = true;
  detector.detectEmotions.surprise = true;
}

function asyncSetupCamera($cameraRoot) {
  return new Promise((resolve, reject) => {
    // ui.setVideoStatus('Initializing');
    try {
      const faceMode = affdex.FaceDetectorMode.LARGE_FACES;

      // check camera size with https://webrtchacks.github.io/WebRTC-Camera-Resolution/
      const [width, height] = [1920, 1080];
      detector = new affdex.CameraDetector(
        $cameraRoot[0],
        width,
        height,
        faceMode
      );

      configureDetector(detector);
      hookUpDetectorEvents(detector);
      resolve();
    } catch (e) {
      ui.setVideoStatus('Error initializing camera');
      reject(e);
    }
  });
}

function startWatching() {
  if (detectorRunning !== true) {
    detectorRunning = true;
    detector.start();
  }
}

function stopWatching() {
  if (detectorRunning === true) {
    detectorRunning = false;
    detector.stop();
  }
}

exports.asyncSetupCamera = asyncSetupCamera;
exports.startWatching = startWatching;
exports.stopWatching = stopWatching;
