import Head from 'next/head'
import { Box, Container } from '@chakra-ui/react'
import NavBar from '../navbar'
import VoxelDog from '../voxel-dog'
import Footer from '../footer'

const SITE_URL = 'https://jmichel.ch'
const DESCRIPTION =
  "Jhimy Michel's homepage - Software Engineer from Bolivia, based in Switzerland & Spain. Posts about tech, travel, and life."

const Main = ({ children, router }) => {
  const pageUrl = `${SITE_URL}${router.asPath === '/' ? '' : router.asPath}`

  return (
    <Box as="main" pb={8}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={DESCRIPTION} />
        <meta name="author" content="Jhimy Michel" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:site_name" content="Jhimy Michel" />
        <meta property="og:title" content="Jhimy Michel" key="og:title" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${SITE_URL}/jhimy_michel.png`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Jhimy Michel" key="twitter:title" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/jhimy_michel.png`} />
        <title>Jhimy Michel</title>
      </Head>
      <NavBar path={router.asPath}></NavBar>
      <Container maxW={'container.md'} pt={14}>
        <VoxelDog />
        {children}
        <Footer />
      </Container>
    </Box>
  )
}

export default Main
