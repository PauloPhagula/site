# Tailwind v4 Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ~2000 lines of hand-written SCSS with a Tailwind v4 + `@tailwindcss/typography` setup that gives the blog a consistent design language, swaps the `filter: invert()` dark-mode hack for proper `dark:` variants, and shrinks the JS toolchain footprint.

**Architecture:** Tailwind v4 CSS-first via `@tailwindcss/cli` (no PostCSS chain, no gulp-sass). Theme tokens live in a CSS `@theme {}` block. Markdown posts get styled by `prose`. AsciiDoctor + syntax-highlighting CSS are imported as plain CSS after Tailwind — utilities can't be sprinkled on plugin-emitted markup. Jekyll/Ruby/Docker side untouched; only the CSS pipeline, `_layouts/`, and `_includes/` change.

**Tech Stack:** Tailwind v4 (`@tailwindcss/cli`, `@tailwindcss/typography`), pnpm, gulp 5 (kept for JS/image pipeline + browser-sync only), Jekyll 4 in Docker.

---

## Context

The blog at `/Users/paulo.phagula/Developer/site` is a Jekyll site whose SCSS has grown unwieldy:

- **Pain confirmed by owner**: CSS is hard to edit; dark mode (a `filter: invert(100%) hue-rotate(180deg)` hack on `body` at `src/css/_styles.scss:814-861`) is fragile; design feels dated; no framework enforces consistency.
- **Authoring inventory**: 22 Markdown posts + 4 AsciiDoctor posts (`_posts/*.adoc`, last edit recent on `2018-05-04-mysql-subtleties.adoc`). 11 pages under `_pages/`. AsciiDoctor stays — it's actively used.
- **Toolchain inventory**: pnpm + gulp 5; current SCSS pipeline is `gulp-sass` → `postcss(autoprefixer, cssnano)` → output to both `_site/assets/css/` and `assets/css/`. Jekyll runs via `jekyll/jekyll:4` Docker image.
- **CDN clutter**: Prism JS at `_layouts/base.html:65-69` and Prism CSS at `_includes/head.html:126-127` are loaded from cdnjs — and the CSS (1.28.0) is on a different version than the JS (1.29.0). Rouge already syntax-highlights Markdown posts server-side; Coderay handles AsciiDoctor server-side. Prism is doing nothing useful and can be removed.

Budget: one focused weekend (~10 hours). Visual drift is permitted; pixel-perfect preservation is not required.

---

## File Structure

**New files** (under `src/css/`):
- `main.css` — Tailwind entry. Imports `tailwindcss`, loads typography plugin, declares `@source` globs for class extraction, defines `@theme` tokens, imports `asciidoctor.css` and `code-highlight.css`, adds a small `@layer base` block.
- `asciidoctor.css` — Port of `_asciidoctor.scss` (~120 lines). Plain CSS using `var(--color-*)` tokens. Covers `.admonitionblock`, `.conum`, `.colist`, `.hdlist`.
- `code-highlight.css` — Port of `_coderay-asciidoctor.scss` (~88 lines). Pygments-style token classes (`.k`, `.s`, `.c1`, etc.) — covers both Coderay and Rouge output.

**Modified files**:
- `package.json` — add `@tailwindcss/cli` + `@tailwindcss/typography`; drop `sass`, `gulp-sass`, `gulp-postcss`, `gulp-sourcemaps`, `postcss`, `autoprefixer`, `cssnano`; add `css:dev` / `css:build` scripts.
- `gulpfile.js` — delete `compileSass`; add `tailwindCss` task that shells out to the CLI; update `watch` and `build` chains.
- `_layouts/base.html` — Tailwind utilities for header/nav/footer/main; inline dark-mode init script; drop Prism `<script>` tags.
- `_layouts/post.html` — wrap `{{ content }}` in `<article class="prose ...">`; convert article chrome (title, meta, pagination, related, comments wrappers) to utilities.
- `_layouts/page.html` — `prose` wrapper for page content.
- `_layouts/search.html` — small utility-class pass.
- `_includes/head.html` — drop Prism CSS + Font Awesome CDN links; drop FOUC `display:none` hack (no longer needed without filter-invert).
- `_includes/{addsense,disqus,google_tag_manager,https_redirect,image,search}.html` — minor utility-class touch-ups; mostly script tags.

**Deleted files**:
- `src/css/main.scss`
- `src/css/_variables.scss`, `_mixins.scss`, `_helpers.scss`, `_styles.scss`, `_asciidoctor.scss`, `_coderay-asciidoctor.scss`, `_normalize.scss`, `_reset.scss` (already unimported), `_syntax-highlighting.scss` (already commented out), `_shame.scss` (empty), `_browser_upgrade.scss`, `_print.scss` (port to `@media print` in `main.css` if still desired).

**Untouched**:
- `Gemfile`, `_config.yml`, Jekyll/Ruby side
- `src/js/`, `gulp-uglify`/`gulp-concat` pipeline
- All `_posts/` and `_pages/` content
- `.github/workflows/` (no CSS-toolchain-specific job today)
- `.github/dependabot.yml` — uses catch-all `*-minor-patch` groups; the dropped packages will simply disappear from the `npm` ecosystem with no config change required.

---

### Task 1: Toolchain swap in `package.json`

**Files:**
- Modify: `/Users/paulo.phagula/Developer/site/package.json`

- [ ] **Step 1: Edit `package.json`** — remove SCSS/PostCSS deps, add Tailwind v4 deps, add scripts.

Replace `devDependencies`/`dependencies` so the file looks like this (preserve `"preinstall"`, `"prepare"`, `"lint-staged"` blocks as-is):

```jsonc
{
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "prepare": "husky",
    "css:dev": "tailwindcss -i src/css/main.css -o assets/css/main.css --watch",
    "css:build": "tailwindcss -i src/css/main.css -o assets/css/main.css --minify"
  },
  "devDependencies": {
    "@tailwindcss/cli": "^4.1.0",
    "@tailwindcss/typography": "^0.5.16",
    "browser-sync": "^3.0.4",
    "gulp": "^5.0.1",
    "gulp-cli": "^3.1.0",
    "husky": "^9.1.7",
    "lint-staged": "^16.2.7"
  },
  "dependencies": {
    "gulp-concat": "^2.6.1",
    "gulp-imagemin": "^9.1.0",
    "gulp-plumber": "^1.2.1",
    "gulp-uglify": "^3.0.2"
  }
}
```

Removed packages: `sass`, `gulp-sass`, `gulp-postcss`, `gulp-sourcemaps`, `postcss`, `autoprefixer`, `cssnano`.

- [ ] **Step 2: Install**

Run: `pnpm install`
Expected: no errors; lockfile updated; `node_modules/@tailwindcss/cli/dist/index.mjs` exists.

- [ ] **Step 3: Smoke-test the CLI**

Run: `pnpm exec tailwindcss --help`
Expected: usage output with `-i`, `-o`, `--watch`, `--minify` flags.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build: swap sass/postcss for @tailwindcss/cli"
```

---

### Task 2: Create the Tailwind entry point

**Files:**
- Create: `/Users/paulo.phagula/Developer/site/src/css/main.css`

- [ ] **Step 1: Write `src/css/main.css`** with the structure below.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@source "../../_layouts/**/*.html";
@source "../../_includes/**/*.html";
@source "../../_pages/**/*";
@source "../../_posts/**/*";
@source "../../_drafts/**/*";
@source "../../_talks/**/*";

@theme {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --font-serif: Georgia, "Times New Roman", Times, serif;
  --font-mono: Menlo, Monaco, Consolas, "Liberation Mono", "Roboto Mono",
    "Courier New", Courier, monospace;

  --text-base: 18px;
  --leading-base: 1.5;

  --color-brand: #2a7ae2;
  --color-text: #111;
  --color-background: #fdfdfd;
  --color-link: #000;
  --color-link-hover: #09c;
  --color-grey: #828282;
  --color-grey-light: color-mix(in srgb, #828282 60%, #fff);
  --color-grey-dark: color-mix(in srgb, #828282 75%, #000);
}

@layer base {
  html {
    color: var(--color-text);
    background-color: var(--color-background);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-base);
  }

  html.dark {
    --color-text: #e8e8e8;
    --color-background: #111;
    --color-link: #e8e8e8;
    --color-link-hover: #4492ff;
  }

  code,
  pre {
    font-family: var(--font-mono);
  }

  pre {
    overflow-x: auto;
  }
}

@media print {
  .no-print,
  .header,
  .footer,
  .sharing,
  .comments {
    display: none !important;
  }
}
```

The token values mirror `src/css/_variables.scss` exactly (verified). `color-mix()` replaces Sass `lighten()`/`darken()`. `_print.scss` is folded into the `@media print` block at the bottom — extend it later if more print rules are needed.

- [ ] **Step 2: Build once and verify output exists**

Run: `pnpm run css:build`
Expected: `assets/css/main.css` written, 0 errors. File size in the 15–40 KB range.

```bash
ls -la assets/css/main.css
wc -c assets/css/main.css
```

- [ ] **Step 3: Commit**

```bash
git add src/css/main.css assets/css/main.css
git commit -m "feat(css): add Tailwind v4 entry with theme tokens"
```

---

### Task 3: Port `_asciidoctor.scss` → `asciidoctor.css`

**Files:**
- Create: `/Users/paulo.phagula/Developer/site/src/css/asciidoctor.css`
- Reference: `/Users/paulo.phagula/Developer/site/src/css/_asciidoctor.scss` (120 lines, to be deleted in Task 11)

- [ ] **Step 1: Open the source for reference**

Run: `cat src/css/_asciidoctor.scss`

Note the selectors: `.admonitionblock` (table layout with `td.icon` + `td.content`), `.icon-note:before`/`.icon-tip:before`/`.icon-warning:before`/`.icon-caution:before`/`.icon-important:before` (Font Awesome unicodes or emoji), `.conum[data-value]`, `.hdlist > table`, `.colist > table`.

- [ ] **Step 2: Write `src/css/asciidoctor.css`**

Translate every `$variable` to `var(--…)` from the theme. Drop Sass nesting in favor of flat selectors. Replace any `lighten()`/`darken()` with `color-mix()`. Preserve the Font Awesome unicode strategy (icons rendered via `content: "\fXXX"` if currently used) **unless** Font Awesome CSS is being removed (see Task 7 head.html clean-up) — in that case, swap to emoji glyphs (📝 ℹ️ ⚠️ ❗) which AsciiDoctor's `icons=font` flag tolerates.

Exact rules: replicate `_asciidoctor.scss:1-120` line-by-line, substituting tokens. Example shape:

```css
.admonitionblock > table {
  border: 0;
  background: none;
  width: 100%;
}

.admonitionblock td.icon {
  text-align: center;
  width: 80px;
}

.admonitionblock td.icon [class^="icon-"]:before {
  font-style: normal;
  font-weight: bold;
  text-transform: uppercase;
  color: var(--color-grey-dark);
}

.admonitionblock td.icon .icon-note:before {
  content: "📝";
}
/* … same shape for tip/warning/caution/important … */

.conum[data-value] {
  display: inline-block;
  color: #fff;
  background-color: var(--color-grey-dark);
  border-radius: 100px;
  text-align: center;
  font-size: 0.75em;
  width: 1.67em;
  height: 1.67em;
  line-height: 1.67em;
  font-family: var(--font-sans);
  font-style: normal;
  font-weight: bold;
}

.conum[data-value]:after {
  content: attr(data-value);
}

/* … and the rest of _asciidoctor.scss … */
```

**Important:** do not use `@apply` in this file. Tailwind v4 restricts `@apply` across layers and the AsciiDoctor markup needs plain CSS.

- [ ] **Step 3: Import from `main.css`**

Add this line in `src/css/main.css` after the `@layer base` block (and before the `@media print` block):

```css
@import "./asciidoctor.css";
```

- [ ] **Step 4: Rebuild and verify**

Run: `pnpm run css:build`
Expected: still compiles cleanly; output includes the new selectors. Grep to confirm:

```bash
grep -c admonitionblock assets/css/main.css
```
Expected: ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add src/css/asciidoctor.css src/css/main.css assets/css/main.css
git commit -m "feat(css): port _asciidoctor.scss to plain CSS"
```

---

### Task 4: Port `_coderay-asciidoctor.scss` → `code-highlight.css`

**Files:**
- Create: `/Users/paulo.phagula/Developer/site/src/css/code-highlight.css`
- Reference: `/Users/paulo.phagula/Developer/site/src/css/_coderay-asciidoctor.scss` (88 lines)

- [ ] **Step 1: Open the source for reference**

Run: `cat src/css/_coderay-asciidoctor.scss`

Selectors include: `.CodeRay`, `.CodeRay .line-numbers`, `table.CodeRay`, and Pygments-style token classes `.comment, .string, .keyword, .class, .function, .constant, .integer, .symbol, .tag, .regexp, .insert, .delete, .change, .error, …`.

- [ ] **Step 2: Write `src/css/code-highlight.css`**

Translate to plain CSS using theme tokens for any color shared with the broader palette. Keep token-specific hex colors inline (e.g. `.keyword { color: #a626a4; }`). Important: the same token classes are emitted by **Rouge** (Markdown server-side highlighter, configured via `_config.yml`) and **Coderay** (AsciiDoctor highlighter, declared in `Gemfile`), so one stylesheet covers both content types.

Shape:

```css
.highlight,
.CodeRay {
  font-family: var(--font-mono);
  font-size: 0.85em;
  line-height: 1.45;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 0.75em 1em;
  overflow-x: auto;
}

.highlight .c,
.highlight .c1,
.CodeRay .comment {
  color: #969896;
  font-style: italic;
}

.highlight .k,
.CodeRay .keyword {
  color: #a626a4;
}

/* … remaining token classes from _coderay-asciidoctor.scss … */
```

Add a dark-mode block at the bottom:

```css
html.dark .highlight,
html.dark .CodeRay {
  background: #1d1f21;
  color: #c5c8c6;
}
```

- [ ] **Step 3: Import from `main.css`**

Add to `src/css/main.css` after the `asciidoctor.css` import:

```css
@import "./code-highlight.css";
```

- [ ] **Step 4: Rebuild and verify**

Run: `pnpm run css:build`
Then:

```bash
grep -c "\.CodeRay\|\.highlight" assets/css/main.css
```
Expected: ≥ 2.

- [ ] **Step 5: Commit**

```bash
git add src/css/code-highlight.css src/css/main.css assets/css/main.css
git commit -m "feat(css): port coderay tokens to shared code-highlight.css"
```

---

### Task 5: Replace `compileSass` in `gulpfile.js`

**Files:**
- Modify: `/Users/paulo.phagula/Developer/site/gulpfile.js`

- [ ] **Step 1: Read current state**

Run: `cat gulpfile.js`

Note: `compileSass` is at roughly lines 38-48; it's referenced in `watch` (line ~88), `default` (line ~98), and `build` (line ~102). Imports at the top include `gulp-sass`, `sass`, `gulp-postcss`, `autoprefixer`, `cssnano`, `gulp-sourcemaps`.

- [ ] **Step 2: Replace the SCSS task with a Tailwind CLI task**

In `gulpfile.js`:

1. Delete the imports for `gulp-sass`, `sass`, `gulp-postcss`, `autoprefixer`, `cssnano`, `gulp-sourcemaps`.
2. Delete the `compileSass` function.
3. Add `import { exec } from "node:child_process";` and `import { promisify } from "node:util";` near the other imports. Then add `const execAsync = promisify(exec);`.
4. Add a new task:

```js
async function tailwindCss() {
  await execAsync("pnpm exec tailwindcss -i src/css/main.css -o assets/css/main.css --minify");
  browserSync.reload("assets/css/main.css");
  return execAsync("cp assets/css/main.css _site/assets/css/main.css").catch(() => {});
}
```

5. Update `watch` — replace the SCSS watch glob:

```js
function watch() {
  gulp.watch("src/css/**/*.css", tailwindCss);
  gulp.watch("src/js/**/*.js", js);
  gulp.watch(
    ["**/*.html", "**/*.md", "**/*.adoc", "_config.yml", "!_site/**/*"],
    jekyllRebuild
  );
}
```

6. Update task chains:

```js
export const build = gulp.series(js, tailwindCss, fonts, jekyllBuild);
export default gulp.series(
  js,
  tailwindCss,
  fonts,
  browserSyncServe,
  watch
);
```

- [ ] **Step 3: Verify the gulp pipeline runs**

Run: `pnpm exec gulp build`
Expected: no errors. Output includes `Starting 'tailwindCss'…` then Jekyll Docker build. `assets/css/main.css` is regenerated; `_site/assets/css/main.css` is present.

- [ ] **Step 4: Commit**

```bash
git add gulpfile.js
git commit -m "build: replace compileSass task with tailwind CLI invocation"
```

---

### Task 6: Convert `_layouts/base.html`

**Files:**
- Modify: `/Users/paulo.phagula/Developer/site/_layouts/base.html`

- [ ] **Step 1: Read current state**

Run: `cat _layouts/base.html`

Confirm Prism `<script>` block at lines 65–69 (five script tags to `cdnjs.cloudflare.com/.../prism/1.29.0/…`) and the structural classes `.header`, `.header__navigation`, `.home-link`, `.navigation`, `.page-link`, `.footer`, `.social`, `.copyright`, `.browserupgrade`.

- [ ] **Step 2: Delete the Prism script block**

Delete lines 65–69 of `_layouts/base.html` (the five `<script src=".../prism/1.29.0/…"></script>` tags). Rouge already highlights Markdown server-side and Coderay handles AsciiDoctor server-side; no client-side highlighter is needed.

- [ ] **Step 3: Add a dark-mode init script in `<head>` (early, before stylesheets)**

Add this inside `_includes/head.html` near the top of `<head>` (covered fully in Task 7; the snippet below is what gets inserted):

```html
<script>
  (function () {
    var stored = localStorage.getItem("theme");
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

(This step is logically attached to base.html because base.html includes head.html; the actual edit happens to head.html in Task 7.)

- [ ] **Step 4: Convert structural classes to Tailwind utilities**

Apply utility classes to the existing markup. Keep the BEM class names alongside for posts/pages that reference them via collecttags etc. Example pattern — replace:

```html
<header class="header">
  <nav class="header__navigation">
    …
  </nav>
</header>
```

with:

```html
<header class="header border-b border-zinc-200 dark:border-zinc-800">
  <nav class="header__navigation mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
    …
  </nav>
</header>
```

Do the same for `.footer` (centered, smaller text, top border), `.social` (flex with gap), `<main>` (centered max-w-3xl + padding). Drop `.browserupgrade` block entirely — it's an obsolete IE notice.

- [ ] **Step 5: Build and visually check**

Run: `pnpm exec gulp build`
Then: `pnpm exec gulp` (default starts browser-sync on port 3005)
Open: http://localhost:3005/

Expected: home page renders without Prism scripts, header/footer use new spacing, no console errors.

- [ ] **Step 6: Commit**

```bash
git add _layouts/base.html
git commit -m "refactor(layout): convert base shell to Tailwind utilities; drop Prism"
```

---

### Task 7: Clean up `_includes/head.html`

**Files:**
- Modify: `/Users/paulo.phagula/Developer/site/_includes/head.html`

- [ ] **Step 1: Read current state**

Run: `cat _includes/head.html`

Confirm: Prism CSS links at lines 126–127 (versions 1.28.0 — note skew vs JS 1.29.0), Font Awesome CDN at line 128, `main.css` link at line 129, FOUC `display:none` style at lines 134–137, reference to non-existent `collecttags.html` at line 155.

- [ ] **Step 2: Remove obsolete `<link>` and inline-style blocks**

Delete:
- Lines 126–127: both Prism CSS links.
- Line 128: Font Awesome CDN link (the ported `asciidoctor.css` uses emoji fallbacks; if you kept Font Awesome unicodes, leave this line in and adjust).
- Lines 134–137: the `<style> html { display: none; } </style>` FOUC hack. With dark-mode handled by a class on `<html>` (not body filter), there's no flash.

- [ ] **Step 3: Add the dark-mode init script**

Insert at the top of `<head>`, before any stylesheets (the snippet from Task 6 Step 3).

- [ ] **Step 4: Fix or remove the broken `collecttags.html` include**

Line 155 references `{% include collecttags.html %}` but the file doesn't exist in `_includes/`. Either:
- (a) restore it from git history if there's a real need (`git log --all -- _includes/collecttags.html`), or
- (b) delete the include line.

Default: delete the line. Jekyll currently logs a warning on every build; cleaning this up is in-scope for the migration.

- [ ] **Step 5: Build and verify no Jekyll warnings about missing includes**

Run: `pnpm exec gulp build 2>&1 | grep -i include`
Expected: no "Included file '...' not found" warnings.

- [ ] **Step 6: Commit**

```bash
git add _includes/head.html
git commit -m "chore(head): remove Prism/Font Awesome CDN, add dark-mode init"
```

---

### Task 8: Convert `_layouts/post.html` and `_layouts/page.html`

**Files:**
- Modify: `/Users/paulo.phagula/Developer/site/_layouts/post.html`
- Modify: `/Users/paulo.phagula/Developer/site/_layouts/page.html`

- [ ] **Step 1: Wrap `{{ content }}` in `post.html` with a `prose` article**

In `_layouts/post.html`, locate the existing `{{ content }}` block (currently surrounded by `.article__title`/`.article__excerpt`/etc.) and wrap content like this:

```html
<article class="prose prose-lg dark:prose-invert mx-auto max-w-[70ch]
                prose-headings:font-sans
                prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900
                prose-a:text-[var(--color-link)] hover:prose-a:text-[var(--color-link-hover)]">
  <header class="not-prose mb-8">
    <h1 class="article__title text-3xl font-bold">{{ page.title }}</h1>
    <p class="article__meta text-sm text-zinc-500">
      <time class="article__post-date" datetime="{{ page.date | date_to_xmlschema }}">
        {{ page.date | date: "%B %-d, %Y" }}
      </time>
      {% if page.tags %}
        <span class="article__tags">
          {% for tag in page.tags %}<a href="/tags/#{{ tag }}">#{{ tag }}</a> {% endfor %}
        </span>
      {% endif %}
    </p>
  </header>

  {{ content }}
</article>
```

The `not-prose` class on the header escapes from `prose`'s typography styles so the post title and meta keep their own treatment.

- [ ] **Step 2: Convert pagination / related-posts / comments wrappers**

Below `</article>`, convert the existing `.pagination`, `.related-posts`, `.sharing`, `.comments` blocks to utility-based layouts. Example for pagination:

```html
<nav class="pagination mx-auto mt-12 flex max-w-[70ch] justify-between gap-4 text-sm">
  {% if page.previous %}
    <a class="pagination__previous-url block" href="{{ page.previous.url }}">
      <span class="pagination__previous-arrow block text-zinc-500">← Previous</span>
      <span class="pagination__previous-title block">{{ page.previous.title }}</span>
    </a>
  {% endif %}
  {% if page.next %}
    <a class="pagination__next-url block text-right" href="{{ page.next.url }}">
      <span class="pagination__next-arrow block text-zinc-500">Next →</span>
      <span class="pagination__next-title block">{{ page.next.title }}</span>
    </a>
  {% endif %}
</nav>
```

Keep `.related-posts`, `.sharing`, `.comments` BEM names — add Tailwind utility classes beside them. Disqus block stays gated on `{% if jekyll.environment == "production" %}`.

- [ ] **Step 3: Wrap `_layouts/page.html` similarly**

```html
---
layout: base
---
<article class="prose prose-lg dark:prose-invert mx-auto max-w-[70ch]">
  <h1 class="not-prose mb-6 text-3xl font-bold">{{ page.title }}</h1>
  {{ content }}
</article>
```

- [ ] **Step 4: Build and inspect a Markdown post**

Run: `pnpm exec gulp build`
Then `pnpm exec gulp` and open: http://localhost:3005/blog/2024/07/16/git-log-between-dates/

Expected: headings render in sans-serif; paragraphs have generous line-height; inline `code` is monospace without backticks; `<pre>` blocks have padding and the Rouge token colors from `code-highlight.css`; max width ~70ch.

- [ ] **Step 5: Commit**

```bash
git add _layouts/post.html _layouts/page.html
git commit -m "feat(layout): wrap content in prose; convert post chrome to utilities"
```

---

### Task 9: Verify AsciiDoctor rendering on `mysql-subtleties.adoc`

**Files:**
- Test: `/Users/paulo.phagula/Developer/site/_posts/2018-05-04-mysql-subtleties.adoc`
- Likely-modified: `/Users/paulo.phagula/Developer/site/src/css/asciidoctor.css`

- [ ] **Step 1: Open the AsciiDoctor post in browser-sync**

Open: http://localhost:3005/blog/2018/05/04/mysql-subtleties/

- [ ] **Step 2: Walk through each AsciiDoctor feature**

Confirm visually:
- Title and section headings — should render via `prose` defaults
- Admonition blocks (NOTE/TIP/WARNING) — confirm the icon + label render via `asciidoctor.css`
- Code blocks — Coderay token colors visible
- Conums (callout numbers, `<i class="conum" data-value="1"></i>`) — should appear as small circular badges
- TOC, if present — should render via prose list defaults
- Tables — `prose` styles `<table>` reasonably; AsciiDoctor's `.tableblock` wrappers may need a `.tableblock { margin: 1.5rem 0; }` rule in `asciidoctor.css`

- [ ] **Step 3: Iterate on `src/css/asciidoctor.css` as needed**

Common adjustments:
- If admonition icons look misaligned: tighten `.admonitionblock td.icon` width and vertical alignment.
- If `prose` styles double-apply margins to AsciiDoctor blocks: wrap problem selectors in `:where(.prose) .admonitionblock { margin: ... }` to keep specificity low.
- If `<pre>` from Coderay has a different background than `<pre>` from Rouge: unify in `code-highlight.css`.

- [ ] **Step 4: Rebuild and re-verify after each tweak**

Run: `pnpm run css:build`
(Browser-sync auto-reloads.)

- [ ] **Step 5: Commit fixes**

```bash
git add src/css/asciidoctor.css src/css/code-highlight.css assets/css/main.css
git commit -m "fix(asciidoctor): align admonition/conum styling under prose"
```

---

### Task 10: Wire a dark-mode toggle and verify

**Files:**
- Modify: `/Users/paulo.phagula/Developer/site/_layouts/base.html` (toggle button)
- Possibly modify: `/Users/paulo.phagula/Developer/site/src/css/asciidoctor.css` (dark-mode overrides)
- Possibly modify: `/Users/paulo.phagula/Developer/site/src/css/code-highlight.css` (already added in Task 4)

- [ ] **Step 1: Add a toggle button in the header**

In `_layouts/base.html`, inside the existing `<nav class="header__navigation …">`, add:

```html
<button id="theme-toggle"
        class="ml-4 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
        aria-label="Toggle dark mode">
  <span class="dark:hidden">🌙</span>
  <span class="hidden dark:inline">☀️</span>
</button>
<script>
  document.getElementById("theme-toggle").addEventListener("click", function () {
    var root = document.documentElement;
    var nowDark = root.classList.toggle("dark");
    localStorage.setItem("theme", nowDark ? "dark" : "light");
  });
</script>
```

- [ ] **Step 2: Audit `asciidoctor.css` for hard-coded colors**

Run: `grep -nE "#[0-9a-fA-F]{3,6}" src/css/asciidoctor.css`

For each match, decide: replace with `var(--color-…)` or wrap in a `html.dark .selector { … }` override block. Admonition icon colors, conum background, and any borders are the typical offenders.

- [ ] **Step 3: Test the toggle**

In the browser:
1. Click toggle — page flips to dark mode.
2. Reload — preference persists via `localStorage`.
3. Walk through a Markdown post and `mysql-subtleties.adoc` again — confirm code blocks, admonitions, links remain legible.

- [ ] **Step 4: Commit**

```bash
git add _layouts/base.html src/css/asciidoctor.css assets/css/main.css
git commit -m "feat(theme): add dark-mode toggle with localStorage persistence"
```

---

### Task 11: Delete obsolete SCSS partials

**Files:**
- Delete: every `.scss` file under `/Users/paulo.phagula/Developer/site/src/css/`

- [ ] **Step 1: Confirm nothing in the repo references the partials**

```bash
grep -rn --include="*.html" --include="*.md" --include="*.adoc" --include="*.yml" --include="*.js" \
  -E "_variables\.scss|_mixins\.scss|_helpers\.scss|_styles\.scss|_asciidoctor\.scss|_coderay-asciidoctor\.scss|_normalize\.scss|_reset\.scss|_syntax-highlighting\.scss|_shame\.scss|_browser_upgrade\.scss|_print\.scss|main\.scss" \
  .
```

Expected: no matches (gulp's `compileSass` is gone, `main.scss` is no longer imported anywhere).

- [ ] **Step 2: Delete the partials**

```bash
trash src/css/_variables.scss src/css/_mixins.scss src/css/_helpers.scss \
      src/css/_styles.scss src/css/_asciidoctor.scss src/css/_coderay-asciidoctor.scss \
      src/css/_normalize.scss src/css/_reset.scss src/css/_syntax-highlighting.scss \
      src/css/_shame.scss src/css/_browser_upgrade.scss src/css/_print.scss \
      src/css/main.scss
```

- [ ] **Step 3: Rebuild end-to-end**

```bash
pnpm exec gulp build
```

Expected: clean build; `assets/css/main.css` regenerated.

- [ ] **Step 4: Commit**

```bash
git add -u src/css/
git commit -m "chore(css): delete SCSS partials replaced by Tailwind setup"
```

---

### Task 12: Final verification pass

**Files:** none modified (verification only).

- [ ] **Step 1: Check output bundle size**

```bash
ls -la assets/css/main.css
wc -c assets/css/main.css
```

Expected: < 60 KB minified. (Current SCSS-compiled CSS is ~17 KB; Tailwind utilities + `prose` push this up but the `@source` purge keeps it bounded.)

- [ ] **Step 2: Manual walkthrough — light + dark + mobile**

With `pnpm exec gulp` running, open each in the browser and toggle dark mode on each:
- http://localhost:3005/  (home/index)
- http://localhost:3005/blog/2024/07/16/git-log-between-dates/  (Markdown post)
- http://localhost:3005/blog/2018/05/04/mysql-subtleties/  (AsciiDoctor post — admonitions/conums/code)
- http://localhost:3005/blog/  (blog index from `_pages/blog.md`)
- http://localhost:3005/uses/  (from `_pages/uses.md`)
- http://localhost:3005/about/  (from `_pages/about.adoc`)
- http://localhost:3005/talks/  (from `_pages/talks.md`)

Resize to 375px width (mobile) and 768px (tablet) for each. Flag broken layouts and patch in `main.css` `@layer base`.

- [ ] **Step 3: Confirm `jekyll-compress-html` still minifies output**

```bash
grep -c "^$" _site/index.html
```
Expected: very few blank lines (compress-html is working). Optionally `wc -c _site/index.html` and compare to git history.

- [ ] **Step 4: Run HTMLProofer (optional)**

The `Rakefile :test` task is currently broken — typo `HTMPProofer` instead of `HTMLProofer` (`Rakefile:~15`). Either:
- Fix the typo: edit `Rakefile` to read `HTMLProofer.check_directory(...)` and run `rake test`.
- Or invoke directly: `bundle exec htmlproofer ./_site --no-check-external-hash --no-check-internal-hash`.

- [ ] **Step 5: Commit any final touch-ups and tag**

```bash
git add -u
git commit -m "chore: final visual fixes after Tailwind migration"
```

---

## Verification Summary

End-to-end smoke test the migration is complete when **all** of these pass:

1. `pnpm install` runs clean with the new `package.json`.
2. `pnpm exec gulp build` exits 0 and writes `assets/css/main.css` + `_site/`.
3. `assets/css/main.css` is minified, < 60 KB.
4. No SCSS files remain under `src/css/`.
5. No `<link rel="stylesheet" …prism…>` or `<script …prism…>` tags remain in `_site/**/*.html` (`grep -rn prism _site/`).
6. Home page, a representative Markdown post, and `mysql-subtleties.adoc` all render correctly in light + dark modes at mobile, tablet, and desktop widths.
7. Dark-mode toggle persists across reload.
8. AsciiDoctor admonitions show icon + label; conums show as circular badges; Coderay token colors are visible on code blocks.
9. `jekyll-compress-html` output in `_site/index.html` is still minified.

## Out of Scope

- No Jekyll/Ruby/Docker changes (config, plugins, build container).
- No content edits — posts are not touched; `prose` carries them.
- No search, comments, or analytics rework.
- No new design language beyond what `prose` + a small `@theme` block provide.
- Org-mode authoring: not currently in use; defer until needed.
- Fixing the `_notes/` collection declared in `_config.yml` without a directory — separate cleanup.
- Restoring or removing the missing `_includes/collecttags.html` permanently — Task 7 just removes the broken include.

## Risks / Known Sharp Edges

- **`prose` + AsciiDoctor extra wrappers**: AsciiDoctor wraps content in `.sect1 > .sectionbody > .paragraph > p` etc. `prose` will apply margins to nested elements, which may compound. Budget 1–2h of fiddling in Task 9; use `:where(.prose) .selector` to keep overrides specificity-flat.
- **Rouge vs Coderay class overlap**: both use Pygments-style token classes (`.k`, `.s`, `.c1`). One stylesheet should cover both. If a post mixes styles unexpectedly, check whether Rouge wraps in `.highlight` while Coderay wraps in `.CodeRay` — `code-highlight.css` selects on both.
- **Tailwind v4 `@apply` constraints**: do not use `@apply` inside `asciidoctor.css` or `code-highlight.css`. v4 restricts cross-layer `@apply`. Write plain CSS rules; reach into theme tokens via `var(--…)`.
- **Disqus / AdSense / GTM**: third-party iframes — styling is out of reach either way. No change.
- **Docker Jekyll build**: gulp's `jekyllBuild` task shells out to `jekyll/jekyll:4` Docker image. If Docker isn't running, the build will hang. Use `rake build` (Ruby-native via the Gemfile) as an alternative — or run `bundle exec jekyll build` directly.
- **Prism CSS/JS version skew**: removing Prism entirely sidesteps this; if a future change reintroduces a client-side highlighter, pin both CSS and JS to the same version.
