import gulp from "gulp";
import childProcess from "child_process";
import { promisify } from "node:util";
import browserSync from "browser-sync";

const execAsync = promisify(childProcess.exec);
const messages = {
  jekyllBuild: "Running: $ jekyll build --drafts",
};
const __dirname = import.meta.dirname;

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
export const jekyllBuild = (done) => {
  browserSync.notify(messages.jekyllBuild);
  const environment = process.env.JEKYLL_ENV || "development";
  return childProcess
    .spawn(
      "docker",
      [
        "run",
        "--rm",
        "-e",
        "JEKYLL_ROOTLESS=1",
        "-e",
        `JEKYLL_ENV=${environment}`,
        "-v",
        `${__dirname}/vendor/bundle:/usr/local/bundle:Z`,
        "-v",
        `${__dirname}:/srv/jekyll:Z`,
        "-p",
        "4000:4000",
        "jekyll/jekyll:4",
        "sh",
        "-c",
        "bundle install --quiet && jekyll build",
      ],
      { stdio: "inherit" },
    )
    .on("close", done);
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
  await execAsync(
    "./node_modules/.bin/tailwindcss -i src/css/main.css -o assets/css/main.css --minify",
  );
  browserSync.reload("assets/css/main.css");
  return execAsync("cp assets/css/main.css _site/assets/css/main.css").catch(() => {});
};

/*
 * Build the jekyll site and launch browser-sync
 */
export const browserSyncServe = gulp.series(tailwindCss, jekyllBuild, (done) => {
  browserSync({
    port: 3005,
    /* Ghost mode replays clicks in every connected tab, which double-fires stateful buttons
       such as the theme toggle and cancels them out. */
    ghostMode: false,
    server: {
      baseDir: "_site",
      serveStaticOptions: {
        extensions: ["html"],
      },
    },
  });
  done();
});

export const watch = () => {
  gulp.watch("src/css/**/*.css", tailwindCss);
  /* Tailwind scans these files for class names, so rebuild the CSS before Jekyll copies it. */
  gulp.watch(
    [
      "*.html",
      "_config.yml",
      "_data/**/*",
      "_drafts/**/*",
      "_includes/**/*",
      "_layouts/**/*",
      "_pages/**/*",
      "_posts/**/*",
      "_talks/**/*",
    ],
    gulp.series(tailwindCss, jekyllRebuild),
  );
};

export default gulp.series(tailwindCss, browserSyncServe, watch);

export const build = gulp.series(tailwindCss, jekyllBuild);
