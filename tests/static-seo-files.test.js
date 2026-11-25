const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {
  SITEMAP_URL,
  buildRobotsTxt,
  buildLlmsTxt,
  buildSitemapXml,
} = require('../lib/static-seo-files')

const urlset =
  '<urlset><url><loc>https://ondrej.chrastina.dev/</loc></url></urlset>'
const index =
  '<sitemapindex><sitemap><loc>https://ondrej.chrastina.dev/sitemap-0.xml</loc></sitemap></sitemapindex>'

test('the sitemap lives at the conventional /sitemap.xml', () => {
  assert.equal(SITEMAP_URL, 'https://ondrej.chrastina.dev/sitemap.xml')
})

test('/sitemap.xml is the URL list itself while it fits in one file', () => {
  assert.equal(buildSitemapXml({ index, parts: [urlset] }), urlset)
})

test('/sitemap.xml falls back to the index when the plugin splits the list', () => {
  assert.equal(buildSitemapXml({ index, parts: [urlset, urlset] }), index)
})

test('robots.txt and llms.txt point to /sitemap.xml', () => {
  assert.match(
    buildRobotsTxt(),
    /^Sitemap: https:\/\/ondrej\.chrastina\.dev\/sitemap\.xml$/m
  )
  assert.ok(!buildRobotsTxt().includes('sitemap-index.xml'))
  const llms = buildLlmsTxt({ siteTitle: 'Site', itemsByType: {} })
  assert.ok(llms.includes(`(${SITEMAP_URL})`))
})

test('the Netlify copy of the site is never indexed', () => {
  // chrastina.netlify.app serves every page; only GitHub Pages should rank
  const toml = fs.readFileSync(
    path.join(__dirname, '..', 'netlify.toml'),
    'utf8'
  )
  assert.match(
    toml,
    /\[\[headers\]\]\s*for = "\/\*"\s*\[headers\.values\]\s*X-Robots-Tag = "noindex"/
  )
})
