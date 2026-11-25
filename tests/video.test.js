const { test } = require('node:test')
const assert = require('node:assert/strict')
const { youtubeEmbedUrl, videoObject } = require('../src/utils/video')

const EMBED = 'https://www.youtube-nocookie.com/embed/0TcuEyjwlQE'

test('watch, short-link, shorts, live and embed URLs map to the embed URL', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=0TcuEyjwlQE',
    'https://youtube.com/watch?v=0TcuEyjwlQE&t=42s',
    'https://m.youtube.com/watch?v=0TcuEyjwlQE',
    'https://youtu.be/0TcuEyjwlQE?si=abc',
    'https://youtube.com/shorts/0TcuEyjwlQE',
    'https://www.youtube.com/live/0TcuEyjwlQE',
    'https://www.youtube.com/embed/0TcuEyjwlQE',
  ]) {
    assert.equal(youtubeEmbedUrl(url), EMBED, url)
  }
})

test('non-YouTube or malformed recordings get no embed', () => {
  for (const url of [
    '',
    undefined,
    'not a url',
    'https://vimeo.com/123456',
    'https://www.youtube.com/playlist',
    'https://www.youtube.com/playlist?list=x',
    'https://evil.example/playlist?list=PLZ9F0R17Zg3NafacHVuYqghN3ikNMgoMs',
    'https://www.youtube.com/watch?v=short',
    'https://evil.example/watch?v=0TcuEyjwlQE',
  ]) {
    assert.equal(youtubeEmbedUrl(url), null, String(url))
  }
})

test('playlist URLs map to the videoseries embed URL', () => {
  for (const url of [
    'https://youtube.com/playlist?list=PLZ9F0R17Zg3NafacHVuYqghN3ikNMgoMs',
    'https://www.youtube.com/playlist?list=PLZ9F0R17Zg3NafacHVuYqghN3ikNMgoMs&si=abc',
  ]) {
    assert.equal(
      youtubeEmbedUrl(url),
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLZ9F0R17Zg3NafacHVuYqghN3ikNMgoMs',
      url
    )
  }
})

test('a YouTube recording becomes a complete VideoObject', () => {
  assert.deepEqual(
    videoObject({
      name: 'Talk',
      description: 'About the talk',
      url: 'https://youtu.be/0TcuEyjwlQE?si=abc',
      uploadDate: '2026-05-04T00:00:00Z',
    }),
    {
      '@type': 'VideoObject',
      name: 'Talk',
      description: 'About the talk',
      thumbnailUrl: 'https://i.ytimg.com/vi/0TcuEyjwlQE/hqdefault.jpg',
      uploadDate: '2026-05-04T00:00:00Z',
      contentUrl: 'https://www.youtube.com/watch?v=0TcuEyjwlQE',
      embedUrl: 'https://www.youtube.com/embed/0TcuEyjwlQE',
    }
  )
})

test('a VideoObject without a description falls back to the name', () => {
  const video = videoObject({
    name: 'Talk',
    description: '',
    url: 'https://www.youtube.com/watch?v=0TcuEyjwlQE',
    uploadDate: '2026-05-04',
  })
  assert.equal(video.description, 'Talk')
})

test('no VideoObject when Google would reject it as incomplete', () => {
  // playlists and other hosts have no single thumbnail; uploadDate is required
  for (const args of [
    {
      url: 'https://www.youtube.com/playlist?list=PLKzl1AGxt2J3CtQzdUdNRBHS4lw-LIalL',
      uploadDate: '2026-05-04',
    },
    { url: 'https://vimeo.com/123456', uploadDate: '2026-05-04' },
    { url: 'https://youtu.be/0TcuEyjwlQE', uploadDate: '' },
    { url: '', uploadDate: '2026-05-04' },
  ]) {
    assert.equal(
      videoObject({ name: 'Talk', description: 'd', ...args }),
      undefined,
      args.url
    )
  }
})
