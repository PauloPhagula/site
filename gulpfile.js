import gulp from 'gulp';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import plumber from 'gulp-plumber';
import childProcess from 'child_process';
import { promisify } from 'node:util';
import browserSync from 'browser-sync';

const execAsync = promisify(childProcess.exec);
const messages = {
  jekyllBuild: 'Running: $ jekyll build --drafts',
};
const __dirname = import.meta.dirname;

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
export const jekyllBuild = (done) => {
  browserSync.notify(messages.jekyllBuild);
  const environment = process.env.JEKYLL_ENV || 'development';
  return childProcess.spawn('docker', ['run', '--rm', '-e', 'JEKYLL_ROOTLESS=1', '-e', `JEKYLL_ENV=${environment}`, '-v', `${__dirname}/vendor/bundle:/usr/local/bundle:Z`, '-v', `${__dirname}:/srv/jekyll:Z`, '-p', '4000:4000', 'jekyll/jekyll:4', 'jekyll', 'build'], { stdio: 'inherit' }).on('close', done);
};

/*
 * Rebuild Jekyll & reload page
 */
export const jekyllRebuild = gulp.series(jekyllBuild, (done) => {
  browserSync.reload();
  done();
});

/*
 * Build Tailwind CSS
 */
export const tailwindCss = async () => {
  await execAsync('./node_modules/.bin/tailwindcss -i src/css/main.css -o assets/css/main.css --minify');
  browserSync.reload('assets/css/main.css');
  return execAsync('cp assets/css/main.css _site/assets/css/main.css').catch(() => {});
};

/*
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
export const browserSyncServe = gulp.series(tailwindCss, jekyllBuild, (done) => {
  browserSync({
    port: 3005,
    server: {
      baseDir: '_site',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
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
  gulp.watch('src/css/**/*.css', tailwindCss);
  gulp.watch('src/js/**/*.js', gulp.series(js));
  gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series(imagemin));
  gulp.watch(
    ['_drafts/*.md', '_posts/*.md', '_posts/*.adoc', '*html', '_includes/*html', '_layouts/*.html'],
    gulp.series(jekyllRebuild)
  );
};

export default gulp.series(js, tailwindCss, fonts, browserSyncServe, watch);

export const build = gulp.series(js, tailwindCss, fonts, jekyllBuild);
