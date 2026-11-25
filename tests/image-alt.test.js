const { test } = require('node:test')
const assert = require('node:assert/strict')
const { imageAlt } = require('../src/utils/image-alt')
const { loadComponent, render } = require('./helpers/render-component')

const RichTextImage = loadComponent('src/components/RichTextImage.js')
const BannerLanding = loadComponent('src/components/BannerLanding.js')

const asset = (description) => ({
  image_id: 'a',
  url: 'https://assets-eu-01.kc-usercontent.com/project/asset/screenshot.jpg',
  width: 1280,
  height: 720,
  description,
})

// The alt attribute of every rendered <img> except gatsby-plugin-image's
// decorative sizer placeholder (aria-hidden)
const alts = (html) =>
  (html.match(/<img[^>]*>/g) || [])
    .filter((tag) => !tag.includes('aria-hidden'))
    .map((tag) => (tag.match(/alt="([^"]*)"/) || [])[1])

test('the asset description is the alt text', () => {
  assert.equal(imageAlt(asset('A screenshot'), 'Page'), 'A screenshot')
})

test('an empty or missing description falls back', () => {
  assert.equal(imageAlt(asset(''), 'Page'), 'Page')
  assert.equal(imageAlt(asset(null), 'Page'), 'Page')
  assert.equal(imageAlt(asset('  '), 'Page'), 'Page')
  assert.equal(imageAlt(undefined, 'Page'), 'Page')
  assert.equal(imageAlt(asset(''), undefined), '')
})

// Bing Webmaster Tools reported "Alt attribute for images is missing": Kontent
// assets without a description rendered with alt=""
test('a rich text image without a description gets the page title as alt', () => {
  const html = render(RichTextImage, {
    image: asset(''),
    fallbackAlt: 'A journal post',
  })
  const found = alts(html)
  assert.ok(found.length > 0)
  found.forEach((alt) => assert.equal(alt, 'A journal post'))
})

test('a hero image without a description gets the page title as alt', () => {
  const html = render(BannerLanding, {
    title: 'A talk',
    content: '<p>Summary</p>',
    heroImage: asset(''),
  })
  const found = alts(html)
  assert.ok(found.length > 0)
  found.forEach((alt) => assert.equal(alt, 'A talk'))
})
