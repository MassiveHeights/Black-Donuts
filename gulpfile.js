const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const browserSync = require('browser-sync');
const plumber = require('gulp-plumber');
const del = require('del');
const gutil = require('gulp-util');
const preprocess = require('gulp-preprocess');
const preprocessify = require('preprocessify');
const compilerPackage = require('google-closure-compiler');
const closureCompiler = compilerPackage.gulp(/* options */);
const runSequence = require('run-sequence').use(gulp);
const stripDebug = require('./__scripts__/strip-debug');
const replace = require('gulp-string-replace');
const rename = require('gulp-rename');

require('babel-polyfill');

const cfgBrowserify = {
  cache: {},
  packageCache: {},
  debug: true,
  fullPaths: false
};

const cfgTransform = {
  'global': true,
  'only': /^(?:.*\/node_modules\/black-engine\/|(?!.*\/node_modules\/)).*$/,
  'presets': ['es2015', 'stage-0'],
  'plugins': [
    ['babel-root-slash-import', {
      'rootPathSuffix': 'js'
    }],
    ['transform-runtime', {
      'polyfill': false,
      'regenerator': true
    }]
  ]
};

let bundler = browserify('./js/main.js', cfgBrowserify).transform(babelify, cfgTransform);
const preprocessCfg = {
  includeExtensions: ['.js'],
  context: { DEBUG: true }
};

bundler = bundler.transform(preprocessify, preprocessCfg);

gulp.task('sheets', function () {
  return gulp.src(['./sheets/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('textures', function () {
  return gulp.src(['./textures/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('spine', function () {
  return gulp.src(['./spine/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function () {
  return gulp.src(['./fonts/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('audio', function () {
  return gulp.src(['./audio/*.*'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
});

gulp.task('index', ['sheets'], function () {
  return gulp.src(['./html/index.html'])
    .pipe(plumber())
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('clean', function () {
  del.sync('./dist/**/*.*');
});

gulp.task('strip-debug', function () {
  return gulp.src(['./node_modules/black-engine/dist/black-engine.module.js'], {})
    .pipe(replace('black-engine~', '', { logs: { enabled: false } }))
    .pipe(replace('Debug,', '', { logs: { enabled: false } })) // TODO: remove stripped Debug export is a not nice way!
    .pipe(preprocess())
    .pipe(stripDebug())
    .pipe(rename('black-engine.gcc.js'))
    .pipe(gulp.dest('./node_modules/black-engine/dist/'));
});

gulp.task('compile-gcc', function () {
  return gulp.src(['./js/**/*.js'], {})
    .pipe(preprocess())
    .pipe(stripDebug())
    .pipe(closureCompiler({
      externs: './externs/w3c_audio.js',
      entry_point: 'main.js',
      compilation_level: 'ADVANCED',
      rewrite_polyfills: false,
      language_in: 'ECMASCRIPT6',
      language_out: 'ECMASCRIPT5_STRICT',
      output_wrapper: '(function(){\n%output%\n}).call(this);',
      js_output_file: 'code.js',
      module_resolution: 'NODE',
      dependency_mode: 'STRICT',
      extra_annotation_name: 'cat',
      package_json_entry_names: 'gcc',
      use_types_for_optimization: true,
      generate_exports: true,
      export_local_property_definitions: true,
      process_common_js_modules: true,
      warning_level: 'DEFAULT',
      js: ['node_modules/black-engine/dist/black-engine.gcc.js', 'node_modules/black-engine/package.json']
    }))
    .pipe(buffer())
    .pipe(gulp.dest('./dist'));
});

function compile_babel() {
  let stream = null;

  stream = bundler.bundle()
    .on('error', function (err) {
      console.log(err.message);
      browserSync.notify(err.message, 3000);
      this.emit('end');
    })
    .on('end', function () { })
    .pipe(plumber())
    .pipe(source('code.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));

  stream.on('end', x => {
    browserSync.reload({ stream: false })
  });

  return stream;
}

function bs() {
  let cfg = {
    server: { baseDir: './dist' },
    reloadDelay: 50,
    open: true,
    port: 4245
  };
  return browserSync(cfg);
}

gulp.task('watchify', function () {
  let cfg = {
    debug: true,
    ignoreWatch: ['**/node_modules/**'],
    poll: true,
    awaitWriteFinish: true
  };

  bundler = watchify(bundler, cfg);

  bundler.on('update', compile_babel);
  bundler.on('time', time => {
    gutil.log(gutil.colors.yellow(`Compiled in ${time / 1000}s`));
  });

  bundler.on('log', function (msg) {
    gutil.log(msg);
  });

  return compile_babel();
});

gulp.task('build:dev', function () {
  return runSequence('clean', ['sheets', 'textures', 'spine', 'index', 'fonts', 'audio'], 'watchify', bs);
});

gulp.task('build:prod', function () {
  return runSequence('clean', ['sheets', 'textures', 'spine', 'index', 'fonts', 'audio'], 'strip-debug', 'compile-gcc');
});

gulp.task('watch-assets', function () {
  var watcher1 = gulp.watch('./sheets/*.*', ['sheets']);
  var watcher2 = gulp.watch('./fonts/*.*', ['fonts']);
  var watcher3 = gulp.watch('./spine/*.*', ['spine']);
  var watcher4 = gulp.watch('./html/*.*', ['index']);
  var watcher5 = gulp.watch('./audio/*.*', ['audio']);
  var watcher6 = gulp.watch('./textures/*.*', ['textures']);

  watcher1.on('change', function (event) {
    console.log('Texture Atlas file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher2.on('change', function (event) {
    console.log('Font file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher3.on('change', function (event) {
    console.log('Spine file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher4.on('change', function (event) {
    console.log('HTML file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher5.on('change', function (event) {
    console.log('Audio file ' + event.path + ' was ' + event.type + ', running tasks...');
  });

  watcher6.on('change', function (event) {
    console.log('Texture file ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('default', ['build:dev']);