'use strict';

const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const jade = require('gulp-jade');
const rename = require('gulp-rename');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');
const utils = require('./utils');

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');

const destDir = jetpack.cwd('./app');
const uiDestDir = jetpack.cwd('./app/ui');
const botDestDir = jetpack.cwd('./app/bot');

gulp.task('bundle', () => {
  return Promise.all([
    bundle(srcDir.path('background.js'), destDir.path('background.js')),
    bundle(srcDir.path('ui', 'app.js'), uiDestDir.path('ui.js'))
  ]);
});

gulp.task('less', () => {
  return gulp.src(srcDir.path('ui', 'app.less'))
    .pipe(plumber())
    .pipe(less())
    .pipe(rename('ui.css'))
    .pipe(gulp.dest(uiDestDir.cwd()));
});

gulp.task('jade', () => {
  return gulp.src('./src/ui/**/*.jade')
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest((file) => {
      file.path = file.path.split(path.sep)
        .filter((item) => item !== 'partials')
        .join(path.sep);

      return uiDestDir.path('views');
    }));
});

gulp.task('copyData', () => {
  return gulp.src('./src/userData/**/*')
    .pipe(gulp.dest(destDir.path('userData')));
});

gulp.task('environment', () => {
  var configFile = 'config/env_' + utils.getEnvName() + '.json';
  projectDir.copy(configFile, destDir.path('env.json'), { overwrite: true });
});

gulp.task('watch', () => {
  var beepOnError = function (done) {
    return function (err) {
      if (err) {
        utils.beepSound();
      }
      done(err);
    };
  };

  watch('src/**/*.js', batch((events, done) => {
    gulp.start('bundle', beepOnError(done));
  }));

  watch('src/**/*.less', batch((events, done) => {
    gulp.start('less', beepOnError(done));
  }));

  watch('src/**/*.jade', batch((events, done) => {
    gulp.start('jade', beepOnError(done));
  }));
});

gulp.task('build', [ 'bundle', 'less', 'jade', 'copyData', 'environment' ]);
