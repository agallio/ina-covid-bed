import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import Footer from '@/components/Footer'
import { DefaultSeo } from 'next-seo'
import SEO from 'next-seo.config'
import Navbar from '@/components/Navbar'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS>
      <Navbar />
      <DefaultSeo {...SEO()} />
      <Component {...pageProps} />
      <Footer />
    </ChakraProvider>
  )
}

export default MyApp
