import '@/styles/globals.css'
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import Footer from '@/components/Footer'
import { DefaultSeo } from 'next-seo'
import SEO from 'next-seo.config'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS>
      <ColorModeProvider
        options={{
          useSystemColorMode: false,
        }}
      >
        <DefaultSeo {...SEO()} />
        <Component {...pageProps} />
      </ColorModeProvider>
      <Footer />
    </ChakraProvider>
  )
}

export default MyApp
