// CJS so gatsby-node.js and the node test runner can require it
const { SECTIONS, pathFor } = require('./paths')

/**
 * Related items for a detail page: items of any type, in the same language,
 * that share the most listing categories with it, newest first on a tie.
 * Computed at build time (gatsby-node.js) and passed in pageContext.
 * @param {Array<Object>} items - { type, codename, language, title, slug, date, categories }
 * @param {Object} current - the item the page renders, one of items
 * @param {Number} [limit=3]
 * @returns {Array<{title: String, path: String, section: String}>}
 */
const relatedItems = (items, current, limit = 3) => {
  const categories = new Set(current.categories)
  return items
    .filter(
      (item) =>
        item.codename !== current.codename &&
        item.language === current.language &&
        item.slug
    )
    .map((item) => ({
      item,
      shared: item.categories.filter((c) => categories.has(c)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        String(b.item.date || '').localeCompare(String(a.item.date || ''))
    )
    .slice(0, limit)
    .map(({ item }) => ({
      title: item.title,
      path: pathFor(item.type, item.slug),
      section: SECTIONS[item.type].heading,
    }))
}

module.exports = { relatedItems }
