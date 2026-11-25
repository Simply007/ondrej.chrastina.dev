// Builders for robots.txt, llms.txt, and llms-full.txt written by
// gatsby-node.js onPostBuild.
const { SITE_URL, stripHtml, pageDescription } = require('../src/utils/seo')
const { richTextToMarkdown } = require('./rich-text-to-markdown')
const { SECTIONS, pathFor } = require('../src/utils/paths')

// The conventional sitemap URL crawlers probe first. gatsby-plugin-sitemap only
// writes sitemap-index.xml and sitemap-0.xml, so onPostBuild adds this one.
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`

const LLMS_SUMMARY = `> ${pageDescription('/')}\n> Based in Brno, Czech Republic. GitHub: Simply007.`

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
]

const buildRobotsTxt = () =>
  [
    `# ${SITE_URL}`,
    '# All crawlers welcome — humans, search engines, and AI/LLM bots alike.',
    `# Machine-readable site summary: ${SITE_URL}/llms.txt`,
    `# Full content in markdown:      ${SITE_URL}/llms-full.txt`,
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# AI crawlers, explicitly welcome',
    ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${SITEMAP_URL}`,
    '',
  ].join('\n')

// llms.txt section order and headings come from src/utils/paths.js
const SECTION_LIST = Object.entries(SECTIONS).map(([type, section]) => ({
  type,
  heading: section.heading,
}))

const itemUrl = (section, item) =>
  `${SITE_URL}${pathFor(section.type, item.elements.url_slug.value)}`

const firstLine = (text) => text.split('\n')[0].trim()

const buildLlmsTxt = ({ siteTitle, itemsByType = {} }) => {
  const lines = [
    `# ${siteTitle}`,
    '',
    LLMS_SUMMARY,
    '',
    `Full article content in markdown: ${SITE_URL}/llms-full.txt`,
    '',
  ]
  SECTION_LIST.forEach((section) => {
    const items = itemsByType[section.type] || []
    if (items.length === 0) {
      return
    }
    lines.push(`## ${section.heading}`, '')
    items.forEach((item) => {
      const summary = firstLine(stripHtml(item.elements.summary.value))
      lines.push(
        `- [${item.elements.title.value}](${itemUrl(section, item)}): ${summary}`
      )
    })
    lines.push('')
  })
  lines.push(
    '## Optional',
    '',
    `- [Sitemap](${SITEMAP_URL})`,
    `- [RSS feed](${SITE_URL}/rss.xml)`,
    ''
  )
  return lines.join('\n')
}

const itemDate = (item) =>
  (
    (item.elements.post_date || item.elements.release_date || {}).value || ''
  ).slice(0, 10)

const EXTRA_LINKS = [
  ['live_url', 'Live'],
  ['source_code_url', 'Source code'],
  ['slides_url', 'Slides'],
  ['recording_url', 'Recording'],
]

const buildItemMarkdown = (section, item) => {
  const lines = [
    `# ${item.elements.title.value}`,
    '',
    `- URL: ${itemUrl(section, item)}`,
    `- Published: ${itemDate(item)}`,
  ]
  const lastModified = ((item.system || {}).last_modified || '').slice(0, 10)
  if (lastModified) {
    lines.push(`- Updated: ${lastModified}`)
  }
  lines.push(`- Section: ${section.heading}`)
  EXTRA_LINKS.forEach(([key, label]) => {
    const element = item.elements[key]
    if (element && element.value) {
      lines.push(`- ${label}: ${element.value}`)
    }
  })
  lines.push('', stripHtml(item.elements.summary.value))
  const body = richTextToMarkdown(item.elements.content)
  if (body) {
    lines.push('', body)
  }
  return lines.join('\n')
}

const buildLlmsFullTxt = ({ siteTitle, itemsByType = {} }) => {
  const documents = [`# ${siteTitle}\n\n${LLMS_SUMMARY}`]
  SECTION_LIST.forEach((section) => {
    const items = itemsByType[section.type] || []
    items.forEach((item) => {
      documents.push(buildItemMarkdown(section, item))
    })
  })
  return documents.join('\n\n---\n\n') + '\n'
}

/**
 * Content of /sitemap.xml: the plugin's URL list itself while it fits in one
 * file (sitemap-0.xml), or the plugin's index once it splits the list.
 * @param {Object} args
 * @param {String} args.index - content of sitemap-index.xml
 * @param {Array<String>} args.parts - contents of sitemap-0.xml, sitemap-1.xml, ...
 * @returns {String}
 */
const buildSitemapXml = ({ index, parts }) =>
  parts.length === 1 ? parts[0] : index

module.exports = {
  SITEMAP_URL,
  buildRobotsTxt,
  buildLlmsTxt,
  buildLlmsFullTxt,
  buildSitemapXml,
}
