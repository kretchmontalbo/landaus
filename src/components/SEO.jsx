import { Helmet } from 'react-helmet-async'

/**
 * Drop-in SEO component. Writes <title>, <meta description>, canonical,
 * and Open Graph / Twitter tags for the current route.
 *
 * Usage: <SEO title="Page title" description="Page description" path="/path" />
 */
export default function SEO({
  title,
  description,
  path = '',
  image = 'https://landaus.com.au/favicon.svg'
}) {
  const fullTitle = title ? `${title} · LandAus` : 'LandAus — Australia\'s rental portal for newcomers'
  const canonical = `https://landaus.com.au${path}`
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  )
}
