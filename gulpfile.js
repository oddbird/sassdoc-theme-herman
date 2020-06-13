'use strict';

const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const path = require('path');
const rename = require('gulp-rename');
const svg = require('gulp-svg-symbols');

// Theme and project specific paths.
const paths = {
  DIST_DIR: 'dist/',
  SASS_DIR: 'scss/',
  SASS_TESTS_DIR: 'test/sass/',
  IMG: 'assets/img/**/*',
  SVG: 'assets/svg/**/*.svg',
  ASSETS_JS_DIR: 'assets/js/',
  DOCS_DIR: 'docs/',
  JS_TESTS_DIR: 'test/js/',
  CLIENT_JS_TESTS_DIR: 'test/clientjs/',
  TEMPLATES_DIR: 'templates/',
  IGNORE: ['!**/.#*', '!**/flycheck_*'],
  init() {
    this.TEMPLATES = [
      `${this.TEMPLATES_DIR}**/*.njk`,
      `!${this.TEMPLATES_DIR}client/*.njk`,
    ].concat(this.IGNORE);
    this.SASS = [
      `${this.SASS_DIR}**/*.scss`,
      `${this.SASS_TESTS_DIR}**/*.scss`,
    ].concat(this.IGNORE);
    this.SRC_JS = ['lib/**/*.js', 'index.js'].concat(this.IGNORE);
    this.ALL_JS = [
      `${this.ASSETS_JS_DIR}*.js`,
      'lib/**/*.js',
      `${this.JS_TESTS_DIR}*.js`,
      `${this.CLIENT_JS_TESTS_DIR}**/*.js`,
      'gulpfile.js',
      'index.js',
      '*.js',
      '.*.js',
    ].concat(this.IGNORE);
    this.JS_TESTS_FILES = [
      `${this.JS_TESTS_DIR}**/*`,
      `!${this.JS_TESTS_DIR}dest/**`,
    ].concat(this.IGNORE);
    return this;
  },
}.init();

gulp.task('svgmin', () =>
  gulp
    .src(paths.SVG)
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(
      svg({
        id: 'icon-%f',
        templates: [
          path.join(__dirname, paths.TEMPLATES_DIR, '_icon_template.lodash'),
        ],
      }),
    )
    .pipe(rename('_icons.svg'))
    .pipe(gulp.dest(paths.TEMPLATES_DIR)),
);

gulp.task('imagemin', () => {
  const dest = `${paths.DIST_DIR}img/`;

  return gulp
    .src(paths.IMG)
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.mozjpeg(),
        imagemin.optipng(),
        imagemin.svgo(),
      ]),
    )
    .pipe(gulp.dest(dest));
});

gulp.task('minify', gulp.parallel('svgmin', 'imagemin'));
