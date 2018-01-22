const express = require('express');
const router = express.Router();

const db = require('./../lib/db');

router.get('/', (req, res) => {
  res.redirect('/'); // TODO: implement
});

router.post('/log-joke', (req, res) => {
  console.log(req.body);
  try {
    if (!!req.body.joke && !!req.body.reaction) {
      console.log(req.body.joke, req.body.reaction);

      db.logJokeReaction(req.body.joke, req.body.reaction);
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

module.exports = router;
