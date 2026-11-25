// IndexNow: tells Bing, Seznam, Yandex and Naver which URLs changed, so they
// crawl them within minutes (Bing's index also feeds ChatGPT search and
// Copilot). Google doesn't support it. Runs in CI after the deploy:
//   node lib/indexnow.js <previous sitemap.xml> <new sitemap.xml>
// The key is public by design: engines fetch KEY_LOCATION to check that the
// submitter controls the host.
const fs = require('fs')
const { SITE_URL } = require('../src/utils/seo')

const INDEXNOW_KEY = 'da3825e1b5fd650d1a8980aeea2ca145'
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'

const tag = (xml, name) => {
  const match = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))
  return match ? match[1].trim() : ''
}

/**
 * @param {String} xml - a sitemap urlset
 * @returns {Map<String, String>} loc -> lastmod ('' when missing)
 */
const parseSitemap = (xml) =>
  new Map(
    (xml.match(/<url>[\s\S]*?<\/url>/g) || []).map((entry) => [
      tag(entry, 'loc'),
      tag(entry, 'lastmod'),
    ])
  )

/**
 * URLs that are new in the sitemap or have a different lastmod, in sitemap
 * order. An empty previous sitemap makes every URL new.
 * @returns {Array<String>}
 */
const changedUrls = (previousXml, nextXml) => {
  const previous = parseSitemap(previousXml || '')
  return [...parseSitemap(nextXml)]
    .filter(([loc, lastmod]) => previous.get(loc) !== lastmod)
    .map(([loc]) => loc)
}

const indexNowPayload = (urlList) => ({
  host: new URL(SITE_URL).host,
  key: INDEXNOW_KEY,
  keyLocation: KEY_LOCATION,
  urlList,
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// The engines fetch the URLs (and the key) right away, so wait until GitHub
// Pages serves the new sitemap
const waitUntilLive = async (
  expected,
  { attempts = 60, delay = 15000 } = {}
) => {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(`${SITE_URL}/sitemap.xml`, {
      cache: 'no-store',
    }).catch(() => null)
    if (response && response.ok && (await response.text()) === expected) {
      return true
    }
    await sleep(delay)
  }
  return false
}

const main = async ([previousFile, nextFile]) => {
  const previousXml = fs.existsSync(previousFile)
    ? fs.readFileSync(previousFile, 'utf8')
    : ''
  const nextXml = fs.readFileSync(nextFile, 'utf8')
  const urls = changedUrls(previousXml, nextXml)
  if (urls.length === 0) {
    console.log('IndexNow: no changed URLs')
    return
  }
  if (!(await waitUntilLive(nextXml))) {
    throw new Error('IndexNow: the new sitemap is not live after 15 minutes')
  }
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(indexNowPayload(urls)),
  })
  console.log(
    `IndexNow: submitted ${urls.length} URLs, HTTP ${response.status}`
  )
  urls.forEach((url) => console.log(`  ${url}`))
  // 200 OK and 202 Accepted (key check pending) both mean received
  if (!response.ok) {
    throw new Error(`IndexNow: ${response.status} ${await response.text()}`)
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}

module.exports = {
  INDEXNOW_KEY,
  KEY_LOCATION,
  parseSitemap,
  changedUrls,
  indexNowPayload,
}
