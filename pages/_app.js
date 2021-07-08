import '@/styles/globals.css'
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'

import Footer from '@/components/Footer'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS>
      <ColorModeProvider
        options={{
          useSystemColorMode: false,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
      <Footer />
    </ChakraProvider>
  )
}

export default MyApp
