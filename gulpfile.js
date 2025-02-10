import gulp from 'gulp';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import plumber from 'gulp-plumber';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import childProcess from 'child_process';
import browserSync from 'browser-sync';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
const messages = {
  jekyllBuild: 'Running: $ jekyll build --drafts',
};
const __dirname = import.meta.dirname
/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
export const jekyllBuild = (done) => {
  browserSync.notify(messages.jekyllBuild);
  // return childProcess.spawn('rake', ['build'], { stdio: 'inherit' }).on('close', done);
  return childProcess.spawn('docker', ['run', '--rm', '-it', '-v', `${__dirname}/vendor/bundle:/usr/local/bundle:Z`, '-v',`${__dirname}:/srv/jekyll:Z`, '-p', '4000:4000', 'jekyll/jekyll:4', 'jekyll', 'build'], { stdio: 'inherit' }).on('close', done);
};
/*
 * Rebuild Jekyll & reload page
 */
export const jekyllRebuild = gulp.series(jekyllBuild, (done) => {
  browserSync.reload();
  done();
});
/*
 * Compile and minify sass
 */
export const compileSass = () => {
  return gulp
    .src('src/css/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss( [autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/assets/css'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/css/'));
};
/**
 * Compile and minify js
 */
export const js = () => {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js/'));
};
/*
 * Build the jekyll site and launch browser-sync
 */
export const browserSyncServe = gulp.series(compileSass, jekyllBuild, (done) => {
  browserSync({
    port: 3005,
    server: {
      baseDir: '_site',
      serveStaticOptions: {
        extensions: ["html"]
      },
    }
  });
  done();
});
/*
 * Compile fonts
 */
export const fonts = () => {
  return gulp.src('src/fonts/**/*.{ttf,woff,woff2}')
    .pipe(plumber())
    .pipe(gulp.dest('assets/fonts/'));
};
/*
 * Minify images
 */
export const imagemin = async () => {
  const imagemin = (await import('gulp-imagemin')).default;
  return gulp
    .src('src/img/**/*.{jpg,png,gif}')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest('assets/img/'));
};

export const watch = () => {
  gulp.watch('src/css/**/*.scss', gulp.series(compileSass));
  gulp.watch('src/js/**/*.js', gulp.series(js));
  gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series(imagemin));
  gulp.watch(['_drafts/*.md', '_posts/*.md', '*html', '_includes/*html', '_layouts/*.html'], gulp.series(jekyllRebuild));
};
export default gulp.series(js, compileSass, fonts, browserSyncServe, watch);

export const build = gulp.series(js, compileSass, fonts, jekyllBuild);
