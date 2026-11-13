import { ColorModeScript } from '@chakra-ui/react'
import NexDocument, { Html, Head, Main, NextScript } from 'next/document'

import theme from '../libs/theme'

export default class Document extends NexDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Pixel Perrito: SVG where supported, PNG/ICO for Safari & older */}
          <link rel="icon" type="image/svg+xml" href="/perrito.svg" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32.png"
          />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
