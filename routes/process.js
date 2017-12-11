const express = require('express');
const router = express.Router();

const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const upload = require('multer')({ dest: '/tmp/' });
const speech = require('@google-cloud/speech');

const indico = require('indico.io'); // text analysis
indico.apiKey = process.env.INDICO_API_KEY;

const speechClient = new speech.SpeechClient();

const uploadFieldSpec = [
  {
    name: 'data',
    maxCount: 1
  }
];

const googleCloudUploadConfig = {
  encoding: 'FLAC',
  languageCode: 'en-US'
};

function asyncConvertWebmToFlac(inPath, outPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .audioCodec('flac')
      .output(outPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

function asyncGetTranscriptionFromFlac(flacPath) {
  return new Promise((resolve, reject) => {
    const audio = {
      content: fs.readFileSync(flacPath).toString('base64')
    };

    const request = {
      config: googleCloudUploadConfig,
      audio: audio
    };

    speechClient
      .recognize(request)
      .then(data => {
        const response = data[0];
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
        resolve(transcription);
      })
      .catch(err => reject);
  });
}

function removeFlacFile(path) {
  fs
    .remove(path)
    .then(() => {
      console.log('flac file removed');
    })
    .catch(e => {
      console.log('error removing flac file', e);
    });
}

function formatEmotions(emotions) {
  const formattedEmotions = {};

  for (let emotion in emotions) {
    const emotionVal = parseInt(emotions[emotion] * 100) / 100;
    if (emotionVal > 0.1) formattedEmotions[emotion] = emotionVal;
  }

  if (Object.keys(formattedEmotions).length === 0) {
    return {
      neutral: 1
    };
  } else {
    return formattedEmotions;
  }
}

router.post('/', upload.fields(uploadFieldSpec), (req, res) => {
  if (!!req.files && !!req.files.data && req.files.data.length > 0) {
    const blob = req.files.data[0];

    const webmFilename = path.parse(blob.filename).name;
    const webmPath = blob.path;
    const webmDir = blob.destination;

    const flacPath = path.join(webmDir, `${webmFilename}.flac`);

    let transcription = '';

    asyncConvertWebmToFlac(webmPath, flacPath)
      .then(() => {
        return asyncGetTranscriptionFromFlac(flacPath);
      })
      .then(transcription => {
        transcription = transcription.trim();
        if (!!transcription && transcription.length > 0) {
          indico
            .emotion(transcription)
            .then(emotions => {
              // emotions is object
              const formattedEmotions = formatEmotions(emotions);
              res.status(200).send({
                transcription: transcription,
                emotions: formattedEmotions
              });
            })
            .catch(e => {
              console.log('Error getting text emotion analysis', e);
              res.status(200).send({
                transcription: transcription,
                emotions: null
              });
            });
        } else {
          console.log('could not transcribe');
          res.sendStatus(400);
        }
      })
      .catch(e => {
        console.log(e);
        res.sendStatus(500);
      })
      .finally(() => {
        // remove flac file
        removeFlacFile(flacPath);
      });
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
