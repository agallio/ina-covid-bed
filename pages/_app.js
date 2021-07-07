import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS>
      <Component {...pageProps} />
      <Footer />
    </ChakraProvider>
  )
}

export default MyApp
