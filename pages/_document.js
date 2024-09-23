import { ColorModeScript } from '@chakra-ui/react'
import NexDocument, { Html, Head, Main, NextScript } from 'next/document'

import theme from '../libs/theme'

export default class Document extends NexDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" type="image/png" href="/tulip.png" />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
