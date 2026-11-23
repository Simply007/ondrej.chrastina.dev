// CJS so gatsby-node.js, lib/ and the node test runner can require it

// GitHub Pages project sites used to live under this site's domain
// (ondrej.chrastina.dev/<repo>/) while this repo was the user site. They moved
// to chrastina.dev/<repo>/ when Simply007.github.io became the chrastina.dev
// landing page. GitHub Pages cannot send a 301, so the old URLs are kept alive
// by redirect pages (lib/legacy-redirects.js) and the 404 page.
const PROJECT_SITES_ORIGIN = 'https://chrastina.dev'

// Repos with GitHub Pages and no custom domain of their own, as of 2026-11-23
const LEGACY_PROJECT_SITES = [
  'auction-gallery',
  'ckeditor-shadow-showcase',
  'ckeditor5-code-block-syntax-highlight',
  'gatsby-preview-custom-element',
  'hacktoberfest-event-brno-2018',
  'Home',
  'kc-custom-element-setup',
  'kk_youtube',
  'kontent-custom-element-samples',
  'kontent-custom-element-toast-ui-editor',
  'kontent-custom-preview-url',
  'kontent-environments-comparer',
  'kontent-sample-app-total-content-items',
  'kontent-statiq-benchmark',
  'os-guidelines',
  'ReactiveConfPrague2018',
  'SimplyUpForGrabs',
  'smart-link',
  'statiq-starter-kontent-lumen',
]

/**
 * The new URL of an old project site URL on this domain, or null when the
 * path does not belong to a moved project site. The repo segment matches
 * case-insensitively (GitHub Pages does too) and comes out with the repo's
 * own casing; the rest of the path, the query and the hash are kept.
 * @param {String} pathname - for example /kontent-custom-element-samples/gallery
 * @param {String} [search] - location.search, with its leading ?
 * @param {String} [hash] - location.hash, with its leading #
 * @param {Array<String>} [repos]
 * @returns {String|null}
 */
const legacyProjectUrl = (
  pathname,
  search = '',
  hash = '',
  repos = LEGACY_PROJECT_SITES
) => {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname || '')
  if (!match) return null
  const repo = repos.find((r) => r.toLowerCase() === match[1].toLowerCase())
  if (!repo) return null
  return `${PROJECT_SITES_ORIGIN}/${repo}${match[2] || '/'}${search}${hash}`
}

// Inline script for the 404 page: runs before React loads, so a deep link
// such as /<repo>/some/page redirects without a flash of the 404 content.
// Plain ES5 in a string, so no bundler or minifier touches it; the tests run
// this exact string against the same cases as legacyProjectUrl.
const legacyRedirectScript = () =>
  '(function(){' +
  `var o=${JSON.stringify(PROJECT_SITES_ORIGIN)},` +
  `r=${JSON.stringify(LEGACY_PROJECT_SITES)},` +
  'm=/^\\/([^/]+)(\\/.*)?$/.exec(location.pathname);' +
  'if(!m)return;' +
  'for(var i=0;i<r.length;i++)' +
  'if(r[i].toLowerCase()===m[1].toLowerCase())' +
  "return location.replace(o+'/'+r[i]+(m[2]||'/')+location.search+location.hash)" +
  '})()'

module.exports = {
  PROJECT_SITES_ORIGIN,
  LEGACY_PROJECT_SITES,
  legacyProjectUrl,
  legacyRedirectScript,
}
