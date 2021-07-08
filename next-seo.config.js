const WEB_DEFAULT_TITLE = 'Kasur IGD COVID-19 Tersedia | 🇮🇩 INA COVID BED';
const WEB_DEFAULT_DESCRIPTION = 'Informasi ketersediaan tempat tidur di Rumah Sakit di seluruh Provinsi di Indonesia.';
const WEB_DEFAULT_URL = 'https://ina-covid-bed-tau.vercel.app/';

export default ({
  pageTitle = '',
  pageDescription = '',
  pageURL = WEB_DEFAULT_URL
} = {}) => {
  const title = `${pageTitle ? `${pageTitle} - ` : ''}${WEB_DEFAULT_TITLE}`;
  const description = `${pageDescription ? `${pageDescription} - ` : ''}${WEB_DEFAULT_DESCRIPTION}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [],
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
    ]
  };
};
