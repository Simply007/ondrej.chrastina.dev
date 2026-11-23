const { test } = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const {
  LEGACY_PROJECT_SITES,
  legacyProjectUrl,
  legacyRedirectScript,
} = require('../src/utils/legacy-redirects')
const {
  buildRedirectPage,
  buildRedirectPages,
} = require('../lib/legacy-redirects')

// [pathname, search, hash, expected]
const CASES = [
  [
    '/ckeditor-shadow-showcase/',
    '',
    '',
    'https://chrastina.dev/ckeditor-shadow-showcase/',
  ],
  [
    '/ckeditor-shadow-showcase',
    '',
    '',
    'https://chrastina.dev/ckeditor-shadow-showcase/',
  ],
  [
    '/kontent-custom-element-samples/gallery',
    '?a=1',
    '#top',
    'https://chrastina.dev/kontent-custom-element-samples/gallery?a=1#top',
  ],
  // GitHub Pages matches the repo segment case-insensitively
  ['/home/', '', '', 'https://chrastina.dev/Home/'],
  [
    '/reactiveconfprague2018/slides/',
    '',
    '',
    'https://chrastina.dev/ReactiveConfPrague2018/slides/',
  ],
  // the site's own pages stay put
  ['/', '', '', null],
  ['/talks/', '', '', null],
  ['/journal/some-post/', '', '', null],
  // a prefix of a repo name is not that repo
  ['/smart/', '', '', null],
]

test('maps old project site URLs to chrastina.dev, other paths to null', () => {
  for (const [pathname, search, hash, expected] of CASES) {
    assert.equal(legacyProjectUrl(pathname, search, hash), expected, pathname)
  }
})

test('the 404 page script redirects exactly like legacyProjectUrl', () => {
  const script = legacyRedirectScript()
  for (const [pathname, search, hash, expected] of CASES) {
    let replaced = null
    const location = {
      pathname,
      search,
      hash,
      replace: (url) => {
        replaced = url
      },
    }
    vm.runInNewContext(script, { location })
    assert.equal(replaced, expected, pathname)
  }
})

test('the redirect pages never collide with the site sections', () => {
  const { SECTIONS } = require('../src/utils/paths')
  const sections = Object.values(SECTIONS).map((s) => s.segment)
  for (const repo of LEGACY_PROJECT_SITES) {
    assert.ok(!sections.includes(repo.toLowerCase()), repo)
  }
})

test('writes one redirect page per moved project site', () => {
  const pages = buildRedirectPages()
  assert.equal(pages.length, LEGACY_PROJECT_SITES.length)
  const page = pages.find((p) => p.path === 'public/Home/index.html')
  assert.ok(
    page.html.includes(
      '<link rel="canonical" href="https://chrastina.dev/Home/">'
    )
  )
  assert.ok(
    page.html.includes(
      '<meta http-equiv="refresh" content="0; url=https://chrastina.dev/Home/">'
    )
  )
})

test('escapes the target in the redirect page markup', () => {
  const html = buildRedirectPage('https://chrastina.dev/a"b/')
  assert.ok(html.includes('href="https://chrastina.dev/a&quot;b/"'))
  assert.ok(!html.includes('href="https://chrastina.dev/a"b/"'))
})
