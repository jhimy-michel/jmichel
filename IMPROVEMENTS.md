# Website Improvements

Findings from a code review on 2026-06-11. Grouped by priority. Check items off as they get done.

## 🐛 Bugs (high priority)

- [x] **Broken `/photography` links (404)** — The navbar (desktop + mobile menu in `components/navbar.js`) and the home page "I love" section (`pages/index.js`) link to `/photography`, but no such page exists. Either build the photography page (there's an empty `content/photos/` folder waiting) or remove the links until it exists.
- [x] **Color mode init bug** — `pages/_document.js` passes the whole config object: `<ColorModeScript initialColorMode={theme.config} />`. Should be `theme.config.initialColorMode`. As-is, the initial color mode isn't applied correctly (flash of wrong theme on load).
- [x] **`robots.txt` never deployed** — It lives at the repo root, but static export (`output: 'export'`) only copies files from `public/`. Confirmed missing from `out/`. Move it to `public/robots.txt`. Also: it disallows `/sensitive-page`, which doesn't exist — replace with a real policy (e.g. allow all).
- [x] **Profile image relative path** — `pages/index.js` uses `src="jhimy_michel.png"` (no leading slash). Works on `/` but would break on any nested route. Use `/jhimy_michel.png`. Also remove `placeholder="blur"` and the placeholder `blurDataURL` — those are `next/image` props; Chakra's `Image` ignores them.

## 🔗 Unreachable content

> Resolved by archiving, not deleting: unreachable pages moved to `archive/pages/` so they're kept in the repo but excluded from the build. To restore one, move it back into `pages/` and add a nav link.

- [x] **`/about` page is orphaned** — Real, written content but no link anywhere on the site. Moved to `archive/pages/about.js`; restore + add to navbar when wanted.
- [x] **Notes pages are orphaned** — `/notes/ds-notes`, `/notes/go-htmx`, `/notes/host-llms` had content but nothing linked to them. Moved to `archive/pages/notes/` (their data files remain in `libs/content/`).
- [x] **`works.js` is template leftover** — Fake "Inkdrop" demo entries linking to a nonexistent `/works/inkdrop` page. Moved to `archive/pages/works.js`; replace with real projects if a works page is ever wanted.

## 🚀 Performance / cleanup

- [x] **Dead 3D assets shipped to production** — Only `perrito.glb` is loaded by the voxel dog. `perritoMatecito.glb` (340 KB) and `perrito jhimy.fbx` (148 KB) moved to `archive/assets/` — kept in the repo, no longer copied into the deploy.
- [x] **Dead commented-out code** — Commented imports and the disabled "My CV" button in `pages/index.js`, commented imports in `pages/about.js` and `pages/works.js`. Remove.
- [x] **`useColorModeValue` called inside `.map()` / conditionals** — In `pages/posts.js` and `pages/posts/[slug].js`, hidden behind `eslint-disable react-hooks/rules-of-hooks`. Works today but fragile; hoist the calls to the top of the component.
- [x] **Dependency mismatch** — `@next/mdx@^15.5.3` alongside `next@^14.2.16`. Builds, but versions should match (`@next/mdx@^14`).

## 🔍 SEO

- [x] **No meta description** — Add one in the main layout (`components/layouts/main.js`).
- [x] **No Open Graph / Twitter card tags** — Add `og:title`, `og:description`, `og:image`, `og:url` so links shared on social media render a preview card.
- [x] **No sitemap** — Generate a `sitemap.xml` at build time (e.g. with `next-sitemap`) and reference it from `robots.txt`.
- [x] **Generic page titles** — Every page shows just "Jhimy Michel"; per-page titles only appear when `title` is passed to the article layout, which most pages don't do.

## 🎨 Design assessment

Honest take: the site is clean and functional, but it reads as "the Takuya Matsuyama template with a different color palette" — a look thousands of developer homepages share. Nothing is broken visually, but nothing is memorable either except the voxel dog. To make it attractive, the goal should be: keep the charm (dog, tulip, warm palette), kill the template tells, and give the first screen a reason to stay.

**What works**

- The voxel dog reading in an armchair is genuinely charming and unique — it's the best asset on the site. Same for the tulip logo.
- The warm palette (teal / sand / orange / rust) is distinctive and already defined in the theme — but it's barely used. The dark mode page is 95% gray with orange links.
- Content width and overall spacing are comfortable to read.

**What hurts**

- [x] **First screen is mostly empty.** The dog takes ~350px of vertical space before any content; name and intro sit below the fold on smaller screens. Shrink the dog or place it beside the hero text so name + tagline + photo are visible immediately.
- [x] **Tagline is buzzword soup.** "Tech Aficionado / Innovative Mind / Cultural Explorer" says nothing concrete. One specific line lands better, e.g. "Software engineer in Switzerland — cloud simulation, LLMs, and the web." Three slashes is also a template tell.
- [x] **Justified + indented paragraphs.** `components/paragraph.js` sets `text-align: justify; text-indent: 1em` — on a narrow column this creates ugly word-spacing rivers and a dated, word-processor look. Use left-aligned, no indent.
- [x] **The greeting box is weak.** "Hi/ Hola/ Grüezi," in a gray pill is the template's greeting slot, literally with slashes. Either style it as a real multilingual greeting ("Hi · Hola · Grüezi") with some personality, or drop it — the page already says welcome in the intro.
- [x] **No visual rhythm below the hero.** Every section is the same: underlined heading + plain text on flat dark gray. The brand colors, the Card style already defined in `libs/theme.js`, and imagery (you do photography!) are all unused. Featured posts as cards, a photo strip, or colored section accents would break the monotony.
- [x] **Profile photo is tiny (100px)** and competes with the dog. Either make it a proper hero portrait or let the dog be the hero and move the photo to /about.
- [x] **Dark mode contrast is muddy.** Background `#202023` with `whiteAlpha.200` boxes is low-contrast gray-on-gray; the warm sand light mode has more character. Consider letting brand colors tint the dark surfaces (e.g. a very dark teal) instead of pure neutral gray.

**Direction to make it attractive**

1. Redesign the hero: dog + name + concrete tagline + social links in one above-the-fold block.
2. Use the brand palette and Card styles for content: featured posts and notes as cards on the home page.
3. Add a photography teaser row on the home page (3–4 thumbnails) linking to the gallery — instant visual interest and it showcases your hobby.
4. Fix typography: left-align, slightly larger body size, more line-height contrast between headings and text.
5. Add a footer (copyright, source link, socials) — the page currently just ends.

## 🌍 Translations (English / Spanish / German)

Wanted: the site in English, Spanish, and German (standard German, not Swiss German — easier to write and maintain, and readable by a much larger audience; the "Grüezi" greeting can stay as a personal touch).

**Constraint:** the site is a static export (`output: 'export'` for GitHub Pages). Next.js built-in i18n routing (`i18n` key in `next.config.js`) is **incompatible with static export** — the build fails. So the standard next-i18next setup is out. Two workable approaches:

**Option A — Client-side language switcher (recommended for this site)**

- JSON dictionary per language (`locales/en.json`, `locales/es.json`, `locales/de.json`) + a small React context with a `t('key')` helper.
- Language toggle in the navbar (EN / ES / DE), choice persisted in `localStorage`, initial value from `navigator.language`.
- Pros: simple, no routing changes, works perfectly with static export, one URL per page.
- Cons: no per-language URLs, so search engines only index the default language. For a personal site this is usually acceptable.
- Effort: small. Translate UI strings + home/about content; blog posts and notes stay in their original language.

**Option B — Locale sub-paths (`/es/...`, `/de/...`)**

- Restructure pages under a `[locale]` dynamic segment and generate every page per locale with `getStaticPaths` (e.g. `/about`, `/es/about`, `/gsw/about`).
- Pros: real per-language URLs, SEO per language, shareable links keep the language.
- Cons: significant restructuring of `pages/`, every page must be locale-aware, redirect logic for the bare root.
- Effort: medium-large.

**Notes regardless of option**

- Translating UI chrome + home + about is cheap; translating MDX blog posts triples writing effort — recommend keeping posts single-language with an optional "this post is in English" note.
- Update the `<html lang>` attribute when the language switches (accessibility + SEO).

## 💡 Ideas (your call)

- [ ] **Photography page** — `content/photos/` folder already exists. Build a gallery page and restore the nav link.
- [ ] **Notes index** — A `/notes` listing page, same pattern as `/posts`.
- [ ] **Real works/projects page** — Replace the template Inkdrop entries with actual projects.
- [ ] **Restore the CV button** — Currently commented out on the home page.
- [ ] **RSS feed for posts** — Cheap to generate at build time for a static site.
- [x] **Upgrade Next.js** — Upgraded to Next 16.2 (kept React 18 + Pages Router; React 19 would force a Chakra UI v2 → v3 migration, skipped). ESLint moved to v9 flat config (`eslint.config.mjs`) because Next 16 removed `next lint`. App Router migration remains optional / not planned.
