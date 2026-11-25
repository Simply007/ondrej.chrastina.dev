// Alt text for a Kontent asset: its description, or the fallback (usually the
// title of the page or item it illustrates) when the description is empty.
// Search engines report an empty alt as missing.
const imageAlt = (image, fallback) =>
  ((image && image.description) || '').trim() || (fallback || '').trim()

module.exports = { imageAlt }
