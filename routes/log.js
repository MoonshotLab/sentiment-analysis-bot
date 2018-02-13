const express = require('express');
const router = express.Router();

const log = require('./../lib/log');

router.post('/feeling', (req, res) => {
  log
    .asyncSaveReaction(Object.assign(req.body, { type: 'feeling' }))
    .then(() => {
      console.log('Successfully logged');
      res.sendStatus(200);
    })
    .catch(e => {
      console.log('Error logging', e);
      res.status(500).send(e);
    });
});

router.post('/joke', (req, res) => {
  log
    .asyncSaveReaction(Object.assign(req.body, { type: 'joke' }))
    .then(() => {
      console.log('Successfully logged');
      res.sendStatus(200);
    })
    .catch(e => {
      console.log('Error logging', e);
      res.status(500).send(e);
    });
});

module.exports = router;
