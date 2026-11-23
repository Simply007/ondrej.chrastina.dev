import React from 'react'
import Layout from '../components/layout'
import { legacyRedirectScript } from '../utils/legacy-redirects'

const NotFoundPage = () => (
  <Layout>
    <div id="main" className="alt">
      <section id="one">
        <div className="inner">
          <h1>NOT FOUND</h1>
          <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
        </div>
      </section>
    </div>
  </Layout>
)

// Old project site links (ondrej.chrastina.dev/<repo>/...) land here once the
// path is below a redirect page, see src/utils/legacy-redirects.js
export const Head = () => (
  <script dangerouslySetInnerHTML={{ __html: legacyRedirectScript() }} />
)

export default NotFoundPage
