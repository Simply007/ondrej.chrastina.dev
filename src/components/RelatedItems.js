import React from 'react'
import { Link } from 'gatsby'

// Links to related talks, projects and journal posts (pageContext.related,
// built by src/utils/related.js)
const RelatedItems = ({ items }) => {
  if (!items || items.length === 0) {
    return null
  }
  return (
    <section className="related-items">
      <div className="inner">
        <h2>Related</h2>
        <ul>
          {items.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>{item.title}</Link>{' '}
              <span>{item.section}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default RelatedItems
