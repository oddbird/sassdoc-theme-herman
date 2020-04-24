/* eslint-disable global-require */

'use strict';

const beeper = require('beeper');
const browserSync = require('browser-sync').create();
const chalk = require('chalk');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const KarmaServer = require('karma').Server;
const log = require('fancy-log');
const mocha = require('gulp-mocha');
const path = require('path');
const PluginError = require('plugin-error');
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

// Try to ensure that all processes are killed on exit
const spawned = [];
process.on('exit', () => {
  spawned.forEach(pcs => {
    pcs.kill();
  });
});

const onError = function(err) {
  log.error(chalk.red(err.message || `Task failed with code: ${err}`));
  beeper();
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
          beeper();
          return cb(err);
        }
        onError(err);
        return cb();
      })
      .on('exit', code => {
        if (code) {
          if (failOnError) {
            beeper();
            return cb(new Error(`Task failed with code ${code}`));
          }
          onError(code);
        }
        return cb();
      })
  );
};

const eslintTask = (src, failOnError, shouldLog) => {
  if (shouldLog) {
    const cmd = `eslint ${src}`;
    log('Running', `'${chalk.cyan(cmd)}'...`);
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

const prettierTask = function(src, shouldLog) {
  if (shouldLog) {
    const cmd = `prettier ${src}`;
    log('Running', `'${chalk.cyan(cmd)}'...`);
  }
  return gulp
    .src(src, { base: './' })
    .pipe(prettier({ singleQuote: true, trailingComma: 'es5' }))
    .pipe(gulp.dest('./'))
    .on('error', onError);
};

const sasslintTask = function(src, failOnError, shouldLog) {
  if (shouldLog) {
    const cmd = `sasslint ${src}`;
    log('Running', `'${chalk.cyan(cmd)}'...`);
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

gulp.task('prettier-js', () => prettierTask(paths.ALL_JS));
gulp.task('prettier-scss', () => prettierTask(paths.SASS));
gulp.task('prettier', gulp.parallel('prettier-js', 'prettier-scss'));

gulp.task(
  'eslint',
  gulp.series('prettier-js', () => eslintTask(paths.ALL_JS, true))
);

gulp.task('eslint-nofail', () => eslintTask(paths.ALL_JS));

gulp.task(
  'sasslint',
  gulp.series('prettier-scss', () => sasslintTask(paths.SASS, true))
);

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

gulp.task('jstest-node6', () =>
  gulp
    .src(`${paths.JS_TESTS_DIR}*.js`, { read: false })
    .pipe(mocha({ fgrep: '[dart-sass]', invert: true }))
);

const karmaOnBuild = done => exitCode => {
  if (exitCode) {
    beeper();
    done(
      new PluginError('karma', {
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
gulp.task('clienttest-watch', cb => {
  new KarmaServer({
    configFile: path.join(__dirname, 'karma.conf.js'),
    autoWatch: true,
    singleRun: false,
    coverageIstanbulReporter: {
      reports: ['html', 'text-summary'],
    },
  }).start();
  cb();
});

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

gulp.task('minify', gulp.parallel('svgmin', 'imagemin'));

const webpackOnBuild = done => (err, stats) => {
  if (err) {
    log.error(chalk.red(err.stack || err));
    if (err.details) {
      log.error(chalk.red(err.details));
    }
  }

  if (err || stats.hasErrors() || stats.hasWarnings()) {
    beeper();
  }

  log(
    stats.toString({
      colors: true,
      chunks: false,
    })
  );

  if (done) {
    done(err);
  }
};

gulp.task(
  'webpack',
  gulp.series('minify', cb => {
    const webpackConfig = require('./webpack.config');
    webpack(webpackConfig).run(webpackOnBuild(cb));
  })
);

gulp.task(
  'webpack-watch',
  gulp.series('minify', cb => {
    const webpackConfig = require('./webpack.config');
    webpack(webpackConfig).watch(300, webpackOnBuild(cb));
  })
);

gulp.task(
  'watch',
  gulp.series(
    'webpack-watch',
    cb => {
      // run webpack to compile static assets
      gulp.watch(
        [
          paths.SVG,
          ...paths.TEMPLATES,
          `${paths.TEMPLATES_DIR}_icon_template.lodash`,
          './README.md',
          './CHANGELOG.md',
          './CONFIGURATION.md',
          './CONTRIBUTING.md',
          './package.json',
        ],
        gulp.parallel('webpack')
      );

      gulp.watch(
        [...paths.JS_TESTS_FILES, ...paths.SRC_JS, ...paths.TEMPLATES],
        gulp.parallel('jstest-nofail')
      );

      // lint scss on changes
      gulp.watch(paths.SASS).on('all', (event, filepath) => {
        if (event === 'add' || event === 'change') {
          sasslintTask(filepath, false, true);
        }
      });

      // run sass tests on changes
      gulp.watch(paths.SASS, gulp.parallel('sasstest'));

      // lint all code when rules change
      gulp.watch('**/.sass-lint.yml', gulp.parallel('sasslint-nofail'));
      gulp.watch('**/.eslintrc.yml', gulp.parallel('eslint-nofail'));

      // lint js on changes
      gulp.watch(paths.ALL_JS).on('all', (event, filepath) => {
        if (event === 'add' || event === 'change') {
          eslintTask(filepath, false, true);
        }
      });

      cb();
    },
    'clienttest-watch'
  )
);

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

gulp.task(
  'test',
  gulp.series(gulp.parallel('jstest', 'sasstest'), 'clienttest')
);
gulp.task('serve', gulp.parallel('watch', 'browser-sync'));
gulp.task('quick-serve', gulp.parallel('webpack', 'browser-sync'));
gulp.task(
  'dev',
  gulp.series(
    gulp.parallel('eslint', 'sasslint', 'sasstest'),
    gulp.parallel('jstest', 'serve')
  )
);
gulp.task(
  'default',
  gulp.parallel(
    'sasslint',
    'sasstest',
    gulp.series('eslint', gulp.parallel('jstest', 'webpack'), 'clienttest')
  )
);
