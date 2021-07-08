import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <ColorModeScript initialColorMode="system" />
        <script
          async
          defer
          data-website-id="e8912acb-bea1-484d-a8e1-f737d0494742"
          src="https://analytics.agallio.xyz/umami.js"
        ></script>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
