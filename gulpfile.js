var gulp = require('gulp'),
    concat = require('gulp-concat'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    replace = require('gulp-replace'),
    insert = require('gulp-insert'),
    inquirer = require('inquirer'),
    semver = require('semver'),
    exec = require('child_process').exec,
    fs = require('fs'),
    package = require('./package.json'),
    browserify = require('browserify'),
    streamify = require('gulp-streamify'),
    source = require('vinyl-source-stream'),
    merge = require('merge-stream'),
    karma = require('karma'),
    path = require('path'),
    yargs = require('yargs');

var argv = yargs
  .option('force-output', {default: false})
  .option('silent-errors', {default: false})
  .option('verbose', {default: false})
  .argv;

var srcDir = './src/';
var srcFiles = srcDir + '**.js';
var outDir = './';

var header = "/*!\n\
 * chartjs-plugin-layoutsync\n\
 * https://github.com/HendrikRoehm/chartjs-plugin-layoutsync/\n\
 * Version: {{ version }}\n\
 *\n\
 * Copyright 2019 Hendrik Roehm\n\
 * Released under the MIT license\n\
 * https://github.com/HendrikRoehm/chartjs-plugin-layoutsync/blob/master/LICENSE.md\n\
 */\n";

gulp.task('default', ['lint', 'build', 'watch']);
gulp.task('build', buildTask);
gulp.task('bump', bumpTask);
gulp.task('lint', lintTask);
gulp.task('watch', watchTask);
gulp.task('unittest', unittestTask);

function buildTask() {
  var nonBundled = browserify('./src/chart.layoutsync.js')
    .ignore('chart.js')
    .ignore('hammerjs')
    .bundle()
    .pipe(source('chartjs-plugin-layoutsync.js'))
    .pipe(insert.prepend(header))
    .pipe(streamify(replace('{{ version }}', package.version)))
    .pipe(gulp.dest(outDir))
    .pipe(streamify(uglify({
      preserveComments: 'some'
    })))
    .pipe(streamify(concat('chartjs-plugin-layoutsync.min.js')))
    .pipe(gulp.dest(outDir));

  return nonBundled;

}

/*
 *  Usage : gulp bump
 *  Prompts: Version increment to bump
 *  Output: - New version number written into package.json
 */
function bumpTask(complete) {
  util.log('Current version:', util.colors.cyan(package.version));
  var choices = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'].map(function(versionType) {
    return versionType + ' (v' + semver.inc(package.version, versionType) + ')';
  });
  inquirer.prompt({
    type: 'list',
    name: 'version',
    message: 'What version update would you like?',
    choices: choices
  }).then(function(res) {
    var increment = res.version.split(' ')[0],
      newVersion = semver.inc(package.version, increment);

    // Set the new versions into the package object
    package.version = newVersion;

    // Write these to their own files, then build the output
    fs.writeFileSync('package.json', JSON.stringify(package, null, 2));

    complete();
  });
}

function lintTask() {
  var files = [
    'samples/**/*.js',
    'src/**/*.js'
  ];

  return gulp.src(files)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function watchTask() {
  return gulp.watch(srcFiles, ['lint', 'build']);
}

function startTest() {
  return [
    './node_modules/moment/min/moment.min.js',
    './test/jasmine.index.js',
    './src/**/*.js',
  ].concat(
    argv.inputs ?
      argv.inputs.split(';') :
      ['./test/specs/**/*.js']
  );
}

function unittestTask(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: !argv.watch,
    files: startTest(),
    args: {
      coverage: !!argv.coverage
    }
  },
  // https://github.com/karma-runner/gulp-karma/issues/18
  function(error) {
    error = error ? new Error('Karma returned with the error code: ' + error) : undefined;
    done(error);
  }).start();
}
