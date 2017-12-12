const express = require('express');
const router = express.Router();

const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');
const fs = require('fs-extra');
const moment = require('moment');

const db = require('./../lib/db');
const config = require('./../lib/config');

const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET_ACCESS
});

const polly = new AWS.Polly();
const pollyVoiceId = 'Joanna';
const pollyOutputFormat = 'mp3';

function asyncSaveRecording(inputText, data) {
  return new Promise((resolve, reject) => {
    // data = {
    //   AudioStream: <Binary String>,
    //   ContentType: 'audio/mpeg',
    //   RequestCharacters: 37
    // };

    const filePath = `./${path.join(
      config.recordingsPath,
      _.truncate(_.kebabCase(inputText), { length: 200 })
    )}.${pollyOutputFormat}`;

    fs
      .outputFile(filePath, data.AudioStream)
      .then(() => {
        resolve(filePath);
      })
      .catch(e => {
        console.log('error saving recording', e);
        reject(e);
      });
  });
}

function handleGeneratedRecording(inputText, voice, data) {
  return new Promise((resolve, reject) => {
    asyncSaveRecording(inputText, data)
      .then(filePath => {
        const recordingObj = {
          text: inputText,
          voice: voice,
          timestamp: moment(),
          recordingPath: filePath
        };

        db.addPhrase(recordingObj);
        resolve(recordingObj);
      })
      .catch(e => {
        console.log('error generating recording', e);
        reject(e);
      });
  });
}

function asyncGenerateRecording(inputText) {
  return new Promise((resolve, reject) => {
    // phrase is novel, generate via polly
    const params = {
      OutputFormat: pollyOutputFormat,
      Text: inputText,
      TextType: 'text',
      VoiceId: pollyVoiceId
    };
    polly.synthesizeSpeech(params, function(err, data) {
      if (err) {
        console.log('error generating text', err);
        reject(err);
      } else {
        handleGeneratedRecording(inputText, pollyVoiceId, data)
          .then(recordingObj => {
            resolve(recordingObj);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  });
}

router.post('/', (req, res) => {
  console.log(req.body);
  if (!!req.body.text && req.body.text.length > 0) {
    const inputText = req.body.text;

    const dbPhrase = db.findPhrase({
      text: inputText,
      voice: pollyVoiceId
    });

    if (!!dbPhrase) {
      // phrase in db, pull it
      res.status(200).send(dbPhrase);
    } else {
      asyncGenerateRecording(inputText)
        .then(recordingObj => {
          res.status(200).send(recordingObj);
        })
        .catch(err => {
          res.status(500).send(err);
        });
    }
  } else {
    res.status(400).send('Must include an input');
  }
});

module.exports = router;
