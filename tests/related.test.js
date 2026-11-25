const { test } = require('node:test')
const assert = require('node:assert/strict')
const { relatedItems } = require('../src/utils/related')
const { loadComponent, render } = require('./helpers/render-component')

const item = (
  type,
  slug,
  categories,
  date = '2026-01-01',
  language = 'en-US'
) => ({
  type,
  codename: `${type}_${slug}`,
  language,
  title: slug,
  slug,
  date,
  categories,
})

const current = item('talk', 'ckeditor-ai', ['ckeditor', 'ai', 'webinar'])

test('related items share the most categories, of any type', () => {
  const items = [
    current,
    item('project', 'ai-playground', ['ckeditor', 'ai']),
    item('gotcha', 'paragraph-plugin', ['ckeditor']),
    item('talk', 'other-webinar', ['webinar']),
    item('project', 'kontent', ['kontent_ai']),
  ]
  const related = relatedItems(items, current)
  assert.deepEqual(
    related.map((r) => r.path),
    [
      '/projects/ai-playground/',
      '/journal/paragraph-plugin/',
      '/talks/other-webinar/',
    ]
  )
  assert.deepEqual(related[0], {
    title: 'ai-playground',
    path: '/projects/ai-playground/',
    section: 'Projects',
  })
})

test('a tie goes to the newer item, and the list stops at the limit', () => {
  const items = [
    current,
    item('talk', 'older', ['ai'], '2025-01-01'),
    item('talk', 'newer', ['ai'], '2026-06-01'),
    item('talk', 'newest', ['ai'], '2026-09-01'),
    item('talk', 'oldest', ['ai'], '2024-01-01'),
  ]
  assert.deepEqual(
    relatedItems(items, current).map((r) => r.slug || r.title),
    ['newest', 'newer', 'older']
  )
})

test('never the item itself, another language, an item without a slug or without a shared category', () => {
  const items = [
    current,
    item('talk', 'ckeditor-ai', ['ckeditor', 'ai'], '2026-01-01', 'cs-CZ'),
    { ...item('project', 'no-slug', ['ai']), slug: '' },
    item('project', 'unrelated', ['jamstack']),
  ]
  assert.deepEqual(relatedItems(items, current), [])
})

test('an item without categories has no related items', () => {
  const lonely = item('project', 'lonely', [])
  assert.deepEqual(relatedItems([lonely, item('talk', 'x', [])], lonely), [])
})

const RelatedItems = loadComponent('src/components/RelatedItems.js')

test('the related block links each item with its section', () => {
  const html = render(RelatedItems, {
    items: [
      {
        title: 'AI playground',
        path: '/projects/ai-playground/',
        section: 'Projects',
      },
    ],
  })
  assert.match(html, /<h2[^>]*>Related<\/h2>/)
  assert.match(html, /<a href="\/projects\/ai-playground\/">AI playground<\/a>/)
  assert.match(html, /Projects/)
})

test('no related items, no block', () => {
  assert.equal(render(RelatedItems, { items: [] }), '')
  assert.equal(render(RelatedItems, {}), '')
})
