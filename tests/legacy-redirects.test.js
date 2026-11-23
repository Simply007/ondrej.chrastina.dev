const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  LEGACY_PROJECT_SITES,
  LEGACY_DEEP_LINKS,
  legacyRedirects,
} = require('../src/utils/legacy-redirects')
const { SECTIONS } = require('../src/utils/paths')

test('redirects every moved project site root to chrastina.dev', () => {
  const redirects = legacyRedirects()
  assert.equal(
    redirects.length,
    LEGACY_PROJECT_SITES.length + LEGACY_DEEP_LINKS.length
  )
  assert.deepEqual(
    redirects.find((r) => r.fromPath === '/ckeditor-shadow-showcase/'),
    {
      fromPath: '/ckeditor-shadow-showcase/',
      toPath: 'https://chrastina.dev/ckeditor-shadow-showcase/',
      isPermanent: true,
    }
  )
})

test('keeps the path of a deep link', () => {
  assert.ok(
    legacyRedirects().some(
      (r) =>
        r.fromPath === '/kontent-custom-element-samples/gallery/' &&
        r.toPath ===
          'https://chrastina.dev/kontent-custom-element-samples/gallery/'
    )
  )
})

test('every path has a trailing slash, as GitHub Pages serves them', () => {
  // the plugin writes <fromPath>/index.html, reached at the slashed URL
  for (const { fromPath } of legacyRedirects()) {
    assert.match(fromPath, /^\/.+\/$/, fromPath)
  }
})

test('the redirects never collide with the site sections', () => {
  const sections = Object.values(SECTIONS).map((s) => s.segment)
  for (const repo of LEGACY_PROJECT_SITES) {
    assert.ok(!sections.includes(repo.toLowerCase()), repo)
  }
})
