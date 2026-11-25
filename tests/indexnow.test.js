const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {
  INDEXNOW_KEY,
  KEY_LOCATION,
  parseSitemap,
  changedUrls,
  indexNowPayload,
} = require('../lib/indexnow')

const sitemap = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
    .map(
      ([loc, lastmod]) =>
        `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    .join('')}</urlset>`

const A = 'https://ondrej.chrastina.dev/'
const B = 'https://ondrej.chrastina.dev/talks/b/'
const C = 'https://ondrej.chrastina.dev/talks/c/'

test('the key file the engines verify is served from static/', () => {
  const file = path.join(__dirname, '..', 'static', `${INDEXNOW_KEY}.txt`)
  assert.equal(fs.readFileSync(file, 'utf8').trim(), INDEXNOW_KEY)
  assert.equal(KEY_LOCATION, `https://ondrej.chrastina.dev/${INDEXNOW_KEY}.txt`)
})

test('a sitemap parses to loc -> lastmod', () => {
  assert.deepEqual(
    parseSitemap(sitemap([[A, '2026-11-23'], [B]])),
    new Map([
      [A, '2026-11-23'],
      [B, ''],
    ])
  )
})

test('only new URLs and URLs with a new lastmod are submitted', () => {
  const before = sitemap([
    [A, '2026-11-01'],
    [B, '2026-11-01'],
  ])
  const after = sitemap([
    [A, '2026-11-25'],
    [B, '2026-11-01'],
    [C, '2026-11-25'],
  ])
  assert.deepEqual(changedUrls(before, after), [A, C])
})

test('nothing changed, nothing to submit', () => {
  const same = sitemap([[A, '2026-11-01']])
  assert.deepEqual(changedUrls(same, same), [])
})

test('without a previous sitemap (first run or fetch failed), every URL is new', () => {
  assert.deepEqual(changedUrls('', sitemap([[A, '2026-11-01'], [B]])), [A, B])
})

test('the payload follows the IndexNow protocol', () => {
  assert.deepEqual(indexNowPayload([A]), {
    host: 'ondrej.chrastina.dev',
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: [A],
  })
})
