const { src, dest, watch, parallel, series } = require('gulp');

const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const fileinclude = require('gulp-file-include');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  });
}

const html = () => {
  return src('app/html/*.html')
    .pipe(fileinclude())
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

function delDist() {
  return del('dist')
}

function images() {
  return src('app/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

function scripts() {
  return src('app/js/components/*.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/stylus/*.styl')
    .pipe(stylus({ compress: true }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function build() {
  return src([
    'app/css/style.min.css',
    'app/fonts/**/*',
    'app/js/main.min.js',
    'app/*.html'
  ], { base: 'app' })
    .pipe(dest('dist'))
}

function watching() {
  watch(['app/stylus/**/*.styl'], styles);
  watch(['app/js/components/*.js'], scripts);
  watch(['app/html/**/*.html'], html);
}

exports.html = html;
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.delDist = delDist;

exports.build = series(delDist, images, build);
exports.default = parallel(html, styles, scripts, browsersync, watching);
