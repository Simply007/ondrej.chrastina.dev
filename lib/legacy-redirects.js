// Redirect pages for the project sites that moved from this domain to
// chrastina.dev, written by gatsby-node.js onPostBuild as
// public/<repo>/index.html. GitHub Pages cannot send a 301, so each page uses
// an immediate meta refresh (which Google treats as a permanent redirect), a
// canonical link to the new URL, and a script that keeps the query and hash.
// Deep links below /<repo>/ are handled by the 404 page.
const {
  LEGACY_PROJECT_SITES,
  legacyProjectUrl,
} = require('../src/utils/legacy-redirects')

const escapeHtml = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  )

const buildRedirectPage = (target) => {
  const url = escapeHtml(target)
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>Moved to ${url}</title>`,
    `<link rel="canonical" href="${url}">`,
    `<meta http-equiv="refresh" content="0; url=${url}">`,
    `<script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script>`,
    '</head>',
    '<body>',
    `<p>This page has moved to <a href="${url}">${url}</a>.</p>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

// [{ path: 'public/<repo>/index.html', html }] for every moved project site
const buildRedirectPages = (repos = LEGACY_PROJECT_SITES) =>
  repos.map((repo) => ({
    path: `public/${repo}/index.html`,
    html: buildRedirectPage(legacyProjectUrl(`/${repo}/`, '', '', repos)),
  }))

module.exports = { buildRedirectPage, buildRedirectPages }
