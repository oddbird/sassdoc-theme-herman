/* eslint-disable global-require */

'use strict';

const browserSync = require('browser-sync').create();
const chalk = require('chalk');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const gutil = require('gulp-util');
const imagemin = require('gulp-imagemin');
const KarmaServer = require('karma').Server;
const mocha = require('gulp-mocha');
const path = require('path');
const prettier = require('gulp-prettier-plugin');
const rename = require('gulp-rename');
const sasslint = require('gulp-sass-lint');
const svg = require('gulp-svg-symbols');
const webpack = require('webpack');
const { spawn } = require('child_process');

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
    this.SASS = [`${this.SASS_DIR}**/*.scss`].concat(this.IGNORE);
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

// Try to ensure that all processes are killed on exit
const spawned = [];
process.on('exit', () => {
  spawned.forEach(pcs => {
    pcs.kill();
  });
});

const onError = function(err) {
  gutil.log(chalk.red(err.message || `Task failed with code: ${err}`));
  gutil.beep();
  if (this && this.emit) {
    this.emit('end');
  }
};

// Execute a command, logging output live while process runs
const spawnTask = function(command, args, cb, failOnError = true) {
  spawned.push(
    spawn(command, args, { stdio: 'inherit' })
      .on('error', err => {
        if (failOnError) {
          gutil.beep();
          return cb(err);
        }
        onError(err);
        return cb();
      })
      .on('exit', code => {
        if (code) {
          if (failOnError) {
            gutil.beep();
            return cb(new Error(`Task failed with code ${code}`));
          }
          onError(code);
        }
        return cb();
      })
  );
};

const eslintTask = (src, failOnError, log) => {
  if (log) {
    const cmd = `eslint ${src}`;
    gutil.log('Running', `'${chalk.cyan(cmd)}'...`);
  }
  const stream = gulp
    .src(src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  if (!failOnError) {
    stream.on('error', onError);
  }
  return stream;
};

const prettierTask = function(src, log) {
  if (log) {
    const cmd = `prettier ${src}`;
    gutil.log('Running', `'${chalk.cyan(cmd)}'...`);
  }
  return gulp
    .src(src, { base: './' })
    .pipe(prettier({ singleQuote: true, trailingComma: 'es5' }))
    .pipe(gulp.dest('./'))
    .on('error', onError);
};

const sasslintTask = function(src, failOnError, log) {
  if (log) {
    const cmd = `sasslint ${src}`;
    gutil.log('Running', `'${chalk.cyan(cmd)}'...`);
  }
  const stream = gulp
    .src(src)
    .pipe(sasslint())
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError());
  if (!failOnError) {
    stream.on('error', onError);
  }
  return stream;
};

gulp.task('prettier', () => prettierTask(paths.ALL_JS));

gulp.task('eslint', ['prettier'], () => eslintTask(paths.ALL_JS, true));

gulp.task('eslint-nofail', () => eslintTask(paths.ALL_JS));

gulp.task('sasslint', () => sasslintTask(paths.SASS, true));

gulp.task('sasslint-nofail', () => sasslintTask(paths.SASS));

gulp.task('sasstest', () =>
  gulp.src(`${paths.SASS_TESTS_DIR}test_sass.js`, { read: false }).pipe(mocha())
);

const getJsTestArgs = verbose => {
  const mochaReporter = verbose ? 'spec' : 'dot';
  const covReporters = verbose
    ? ['text', 'html', 'lcovonly']
    : ['text-summary', 'html', 'lcovonly'];
  const obj = {
    include: paths.SRC_JS,
    reporter: covReporters,
    cache: true,
    all: true,
    'report-dir': './jscov/src/',
  };
  const args = [
    './node_modules/.bin/mocha',
    '--reporter',
    mochaReporter,
    `${paths.JS_TESTS_DIR}*.js`,
  ];
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) {
      for (const val of obj[key]) {
        args.unshift(`--${key}=${val}`);
      }
    } else {
      args.unshift(`--${key}=${obj[key]}`);
    }
  }
  return args;
};

gulp.task('jstest', cb => {
  spawnTask('./node_modules/.bin/nyc', getJsTestArgs(true), cb);
});

gulp.task('jstest-nofail', cb => {
  spawnTask('./node_modules/.bin/nyc', getJsTestArgs(), cb, false);
});

const karmaOnBuild = done => exitCode => {
  if (exitCode) {
    gutil.beep();
    done(
      new gutil.PluginError('karma', {
        name: 'KarmaError',
        message: `Failed with exit code: ${exitCode}`,
      })
    );
  } else {
    done();
  }
  process.exit(exitCode); // eslint-disable-line no-process-exit
};

gulp.task('clienttest', cb => {
  new KarmaServer(
    { configFile: path.join(__dirname, 'karma.conf.js') },
    karmaOnBuild(cb)
  ).start();
});

// Use karma watcher instead of gulp watcher for tests
gulp.task('clienttest-watch', () => {
  new KarmaServer({
    configFile: path.join(__dirname, 'karma.conf.js'),
    autoWatch: true,
    singleRun: false,
    coverageReporter: {
      reporters: [{ type: 'html', subdir: '.' }, { type: 'text-summary' }],
    },
  }).start();
});

gulp.task('test', ['sasstest', 'jstest']);

gulp.task('browser-sync', cb => {
  browserSync.init(
    {
      open: false,
      server: {
        baseDir: paths.DOCS_DIR,
      },
      logLevel: 'info',
      logPrefix: 'herman',
      notify: false,
      ghostMode: false,
      files: [`${paths.DOCS_DIR}**/*`],
      reloadDelay: 300,
      reloadThrottle: 500,
      // Because we're debouncing, we always want to reload the page to prevent
      // a case where the CSS change is detected first (and injected), and
      // subsequent JS/HTML changes are ignored.
      injectChanges: false,
    },
    cb
  );
});

gulp.task('default', ['webpack', 'eslint', 'sasslint', 'test']);

gulp.task('compile', ['webpack']);

gulp.task('serve', ['watch', 'browser-sync']);
gulp.task('quick-serve', ['webpack', 'browser-sync']);

// Development task.
// While working on a theme.
gulp.task('dev', [
  'prettier',
  'eslint-nofail',
  'sasslint-nofail',
  'test',
  'watch',
]);

gulp.task('watch', ['clienttest-watch', 'webpack-watch'], () => {
  // run webpack to compile static assets
  gulp.watch(
    [
      paths.SVG,
      paths.TEMPLATES,
      `${paths.TEMPLATES_DIR}_icon_template.lodash`,
      './README.md',
      './CHANGELOG.md',
      './CONFIGURATION.md',
      './CONTRIBUTING.md',
      './package.json',
    ],
    ['webpack']
  );

  gulp.watch([paths.JS_TESTS_FILES, paths.SRC_JS], ['jstest-nofail']);

  gulp.watch(paths.SASS, ev => {
    if (ev.type === 'added' || ev.type === 'changed') {
      sasslintTask(ev.path, false, true);
    }
  });

  gulp.watch(paths.SASS, ['sasstest']);

  gulp.watch('**/.sass-lint.yml', ['sasslint-nofail']);
  gulp.watch('**/.eslintrc.yml', ['eslint-nofail']);
});

gulp.task('svg-clean', cb => {
  del(`${paths.TEMPLATES_DIR}_icons.svg`).then(() => {
    cb();
  });
});

gulp.task('svgmin', () =>
  gulp
    .src(paths.SVG)
    .pipe(imagemin([imagemin.svgo()]))
    .pipe(
      svg({
        id: 'icon-%f',
        title: '%f icon',
        templates: [
          path.join(__dirname, paths.TEMPLATES_DIR, '_icon_template.lodash'),
        ],
      })
    )
    .pipe(rename('_icons.svg'))
    .pipe(gulp.dest(paths.TEMPLATES_DIR))
);

gulp.task('imagemin', () => {
  const dest = `${paths.DIST_DIR}img/`;

  return gulp
    .src(paths.IMG)
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.jpegtran(),
        imagemin.optipng(),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest(dest));
});

gulp.task('minify', ['svgmin', 'imagemin']);

const webpackOnBuild = done => (err, stats) => {
  if (err) {
    gutil.log(chalk.red(err.stack || err));
    if (err.details) {
      gutil.log(chalk.red(err.details));
    }
  }

  if (err || stats.hasErrors() || stats.hasWarnings()) {
    gutil.beep();
  }

  gutil.log(
    stats.toString({
      colors: true,
      chunks: false,
    })
  );

  if (done) {
    done(err);
  }
};

gulp.task('webpack', ['minify'], cb => {
  const webpackConfig = require('./webpack.config');
  webpack(webpackConfig).run(webpackOnBuild(cb));
});

gulp.task('webpack-watch', ['minify'], () => {
  const webpackConfig = require('./webpack.config');
  webpack(webpackConfig).watch(300, webpackOnBuild());
});
