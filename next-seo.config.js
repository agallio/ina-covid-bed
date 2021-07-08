const WEB_DEFAULT_TITLE = '🇮🇩 INA COVID BED'
const WEB_DEFAULT_DESCRIPTION = 'Ketersediaan Tempat Tidur Rumah Sakit (COVID)'
const WEB_DEFAULT_URL = 'https://bed.ina-covid.com/'
const WEB_DEFAULT_IMAGES = [
  {
    url: 'http://bed.ina-covid.com/images/og-image-bed.png',
    width: 1000,
    height: 500,
    alt: 'ina-covid-bed-image',
  },
]

export default function SEO({
  pageTitle = '',
  pageDescription = '',
  pageURL = WEB_DEFAULT_URL,
  images = WEB_DEFAULT_IMAGES,
} = {}) {
  const title = `${pageTitle ? `${pageTitle} - ` : ''}${WEB_DEFAULT_TITLE}`
  const description = pageDescription || WEB_DEFAULT_DESCRIPTION

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
      locale: 'id_ID',
      url: pageURL,
      site_name: title,
    },
    additionalLinkTags: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }
}
