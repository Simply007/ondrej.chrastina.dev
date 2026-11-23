// CJS so gatsby-node.js, lib/ and the node test runner can require it

// GitHub Pages project sites used to live under this site's domain
// (ondrej.chrastina.dev/<repo>/) while this repo was the user site. They moved
// to chrastina.dev/<repo>/ when Simply007.github.io became the chrastina.dev
// landing page. The old URLs redirect via createRedirect in gatsby-node.js.
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

// Deeper old URLs that site content links to; each needs its own redirect
const LEGACY_DEEP_LINKS = ['/kontent-custom-element-samples/gallery/']

/**
 * Redirects for createRedirect: the root of every moved project site plus
 * the known deep links. gatsby-plugin-meta-redirect writes each one as a
 * meta refresh page, since GitHub Pages cannot send a 301.
 * @returns {Array<{fromPath: String, toPath: String, isPermanent: Boolean}>}
 */
const legacyRedirects = (
  repos = LEGACY_PROJECT_SITES,
  deepLinks = LEGACY_DEEP_LINKS
) =>
  [...repos.map((repo) => `/${repo}/`), ...deepLinks].map((fromPath) => ({
    fromPath,
    toPath: `${PROJECT_SITES_ORIGIN}${fromPath}`,
    isPermanent: true,
  }))

module.exports = {
  PROJECT_SITES_ORIGIN,
  LEGACY_PROJECT_SITES,
  LEGACY_DEEP_LINKS,
  legacyRedirects,
}
