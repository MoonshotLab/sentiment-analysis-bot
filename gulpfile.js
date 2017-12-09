const fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').config();
}

var gulp = require('gulp');

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sass = require('gulp-sass');

var browserSync = require('browser-sync').create();
var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var es          = require('event-stream');
var rename      = require('gulp-rename');

// https://gist.github.com/Fishrock123/8ea81dad3197c2f84366
var gutil = require('gulp-util')
var chalk = require('chalk')

function map_error(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description));
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message));
  }

  this.emit('end');
}

gulp.task('sass', function () {
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    cssnano(),
  ];
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  var entries = [
    './src/js/main.js',
  ];

  var tasks = entries.map(function(entry) {
    var splitEntries = entry.split('/');
    var entryFilename = splitEntries[splitEntries.length - 1];

    return browserify({ entries: [entry] })
      .transform("babelify", { presets: ["es2015"] })
      .bundle()
      .on('error', map_error)
      .pipe(source(entryFilename))
      .pipe(rename({
        extname: '.bundle.js'
      }))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('./public/js'))
      .pipe(browserSync.stream());
  });

  return es.merge.apply(null, tasks);
});

gulp.task('watch', ['sass', 'js'], function() {

  var port = process.env.PORT || 3000;
  browserSync.init({
    proxy: "localhost:" + port
  });

  gulp.watch("src/scss/**/*.scss", ['sass']);
  gulp.watch("src/js/**/*.js", ['js']);
  gulp.watch("views/**/*.pug").on('change', browserSync.reload);
});

gulp.task('default', ['watch']);
