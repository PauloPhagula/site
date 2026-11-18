# paulophagula.com

![Build](https://github.com/PauloPhagula/site/workflows/Build/badge.svg)

![Blog screenshot](/screenshot.jpg)

[paulophagula.com](https://paulophagula.com)

## How to build and run

Requirements: Ruby, Node.js, [pnpm](https://pnpm.io), and Docker (only for the gulp workflow).

Styles use [Tailwind CSS v4](https://tailwindcss.com). The source is `src/css/main.css`. The compiled output is `assets/css/main.css`, and it is committed.

### With gulp (Docker)

Builds the CSS and JS, runs Jekyll in Docker, and serves the site at <http://localhost:3005> with live reload.

```sh
pnpm install
pnpm exec gulp
```

### Without Docker

```sh
pnpm install
bundle install
pnpm run css:build
bundle exec jekyll serve --drafts
```

The site is at <http://localhost:4000>.

### Editing styles

The gulp watcher only rebuilds the CSS when files in `src/css/` change. After you add new utility classes to a layout, include, or post, rebuild the CSS:

```sh
pnpm run css:build   # one-off build
pnpm run css:dev     # watch mode
```
