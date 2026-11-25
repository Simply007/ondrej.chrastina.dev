import React from 'react'
import { ImageElement } from '@kontent-ai/gatsby-components'
import { imageAlt } from '../utils/image-alt'

// An image inside rich text content. Kontent's figure markup is dropped by the
// renderer, so the image would sit directly against the next block (a heading
// right under it had no space at all); the figure gives it the same bottom
// margin as a paragraph (see .rich-text-image in _image.scss). An asset without
// a description gets the alt text in `fallbackAlt` (the page title).
const RichTextImage = ({ image, fallbackAlt }) => (
  <figure className="rich-text-image">
    <ImageElement image={image} alt={imageAlt(image, fallbackAlt)} />
  </figure>
)

export default RichTextImage
