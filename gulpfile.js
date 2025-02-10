import gulp from 'gulp'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import plumber from 'gulp-plumber'

import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass)

import childProcess from 'child_process'
import browserSync from 'browser-sync'

import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import sourcemaps from 'gulp-sourcemaps'

const messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build --drafts',
}

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild)
  return childProcess.spawn('rake', ['build'], { stdio: 'inherit' }).on('close', done)
})

/*
 * Rebuild Jekyll & reload page
 */
gulp.task(
  'jekyll-rebuild',
  gulp.series(['jekyll-build'], (done) => {
    browserSync.reload()
    done()
  })
)

/*
 * Compile and minify sass
 */
gulp.task('sass', () => {
  const plugins = [autoprefixer({ browsers: ['last 1 version'] }), cssnano()]
  return gulp
    .src('_sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: ['_scss'],
      })
    )
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/css/'))
})

/*
 * Build the jekyll site and launch browser-sync
 */
gulp.task(
  'browser-sync',
  gulp.series('sass', 'jekyll-build', (done) => {
    browserSync({
      server: {
        baseDir: '_site',
        serveStaticOptions: {
          extensions: ["html"]
        }
      },
      port: 3005,
    })
    done()
  })
)

/*
 * Compile fonts
 */
gulp.task('fonts', () => {
  return gulp.src('src/fonts/**/*.{ttf,woff,woff2}').pipe(plumber()).pipe(gulp.dest('assets/fonts/'))
})

/*
 * Minify images
 */
gulp.task('imagemin', async () => {
  const imagemin = (await import('gulp-imagemin')).default
  return gulp
    .src('src/img/**/*.{jpg,png,gif}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'))
})

/**
 * Compile and minify js
 */
gulp.task('js', () => {
  return gulp.src('src/js/**/*.js').pipe(plumber()).pipe(concat('main.js')).pipe(uglify()).pipe(gulp.dest('assets/js/'))
})

gulp.task('watch',  () => {
  gulp.watch('src/styles/**/*.scss', gulp.series('sass', 'jekyll-rebuild'))
  gulp.watch('src/js/**/*.js', gulp.series('js'))
  // gulp.watch('src/fonts/**/*.{tff,woff,woff2}', gulp.series('fonts'))
  gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series('imagemin'))
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], gulp.series('jekyll-rebuild'))
})

gulp.task('default', gulp.series(['js', 'sass', 'fonts', 'browser-sync', 'watch']))
