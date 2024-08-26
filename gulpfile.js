const gulp = require('gulp')
const csso = require('gulp-csso')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sass = require('gulp-sass')(require('sass'))
const plumber = require('gulp-plumber')
const childProcess = require('child_process')
const imagemin = require('gulp-imagemin')
const browserSync = require('browser-sync')
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');

const jekyllCommand = /^win/.test(process.platform) ? 'jekyll.bat' : 'bundle'
const messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build --drafts',
};

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return childProcess.spawn(jekyllCommand, ['exec', 'jekyll', 'build'], { stdio: 'inherit' }).on('close', done)
})

/*
 * Rebuild Jekyll & reload page
 */
gulp.task(
  'jekyll-rebuild',
  gulp.series(['jekyll-build'], function (done) {
    browserSync.reload()
    done()
  })
)

/*
 * Compile and minify sass
 */
gulp.task('sass', () => {
  return gulp
  .src('src/css/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(
    sass({
      includePaths: ['_scss'],
    })
  )
  .pipe(csso())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('_site/assets/css'))
  .pipe(browserSync.reload({stream: true}))
  .pipe(gulp.dest('assets/css/'))
})

/*
 * Build the jekyll site and launch browser-sync
 */
gulp.task(
  'browser-sync',
  gulp.series('sass', 'jekyll-build', function (done) {
    browserSync({
      server: {
        baseDir: '_site',
      },
      port: 3005,
    })
    done()
  })
)

/*
 * Compile fonts
 */
gulp.task('fonts', function () {
  gulp.src('src/fonts/**/*.{ttf,woff,woff2}').pipe(plumber()).pipe(gulp.dest('assets/fonts/'))
})

/*
 * Minify images
 */
gulp.task('imagemin', function () {
  return gulp
    .src('src/img/**/*.{jpg,png,gif}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'))
})

/**
 * Compile and minify js
 */
gulp.task('js', function () {
  return gulp.src('src/js/**/*.js').pipe(plumber()).pipe(concat('main.js')).pipe(uglify()).pipe(gulp.dest('assets/js/'))
})

gulp.task('watch', function () {
  gulp.watch('src/styles/**/*.scss', gulp.series('sass', 'jekyll-rebuild'))
  gulp.watch('src/js/**/*.js', gulp.series('js'))
  gulp.watch('src/fonts/**/*.{tff,woff,woff2}', gulp.series('fonts'))
  gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series('imagemin'))
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], gulp.series('jekyll-rebuild'))
})

gulp.task('default', gulp.series(['js', 'sass', 'fonts', 'browser-sync', 'watch']))
