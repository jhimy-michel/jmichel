// Generates out/sitemap.xml from the static export. Runs via `postbuild`.
const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://jmichel.ch'
const OUT_DIR = path.join(process.cwd(), 'out')
const EXCLUDED = new Set(['404.html'])

function collectHtmlFiles(dir, base = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(base, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_next') return []
      return collectHtmlFiles(path.join(dir, entry.name), relative)
    }
    if (!entry.name.endsWith('.html') || EXCLUDED.has(relative)) return []
    return [relative]
  })
}

function toUrl(file) {
  const route = file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '')
  return route ? `${SITE_URL}/${route}` : `${SITE_URL}/`
}

const urls = collectHtmlFiles(OUT_DIR).map(toUrl).sort()
const lastmod = new Date().toISOString().split('T')[0]

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(url =>
    [
      '  <url>',
      `    <loc>${url}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      '  </url>'
    ].join('\n')
  ),
  '</urlset>',
  ''
].join('\n')

fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xml)
console.log(`sitemap.xml written with ${urls.length} URLs`)
