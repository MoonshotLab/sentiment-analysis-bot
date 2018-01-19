require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').Server(app);

const bodyParser = require('body-parser');
const autoReap = require('multer-autoreap');
const path = require('path');

// set ffmpeg path
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
process.env.FFMPEG_PATH = ffmpegPath;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(autoReap);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

require('./lib/db').initializeDb();

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('Server running on port ' + port);
});

app.use('/', require('./routes/index'));
app.use('/process', require('./routes/process'));
app.use('/generate', require('./routes/generate'));
app.use('*', (req, res) => {
  res.redirect('/');
});

module.exports = app;
