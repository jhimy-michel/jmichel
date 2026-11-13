import Head from 'next/head'
import NextLink from 'next/link'
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  IconButton,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'
import NavBar from '../navbar'
import dynamic from 'next/dynamic'
import VoxelDogLoader from '../voxel-dog-loader'
import Panel, { PANEL_WIDTH } from '../panel'
import { useHash } from '../../libs/use-hash'
import { topicById } from '../../libs/topics'

// The 3D room (three.js, the biggest part of the site) loads on its own,
// so page text never waits for it; a spinner holds its place meanwhile
const VoxelDog = dynamic(() => import('../voxel-dog'), {
  ssr: false,
  loading: () => <VoxelDogLoader />
})

const SITE_URL = 'https://jmichel.ch'
const DESCRIPTION =
  "Jhimy Michel's homepage - Software Engineer from Bolivia, based in Switzerland & Spain. Posts about tech, travel, and life."

// Name and the ways in, over the bottom of the full-screen room
const HeroText = () => {
  const accent = useColorModeValue('brand.teal', 'brand.orange')
  return (
    <Container
      maxW="container.md"
      position="absolute"
      bottom={[6, 10]}
      left={0}
      right={0}
      pointerEvents="none"
    >
      <Heading as="h1" variant="page-title">
        Jhimy Michel
      </Heading>
      <Text>Software engineer, Cloud and AI.</Text>
      <HStack mt={4} spacing={2} pointerEvents="auto">
        <Button
          as={NextLink}
          href="/#about"
          scroll={false}
          variant="solid"
          bg={accent}
          color={useColorModeValue('white', 'brand.night')}
          _hover={{ opacity: 0.85 }}
          size="sm"
        >
          About me
        </Button>
        <Button as={NextLink} href="/posts" variant="outline" size="sm">
          Posts
        </Button>
        <IconButton
          as="a"
          href="https://github.com/jhimy-michel"
          target="_blank"
          aria-label="GitHub"
          icon={<IoLogoGithub />}
          variant="ghost"
          size="sm"
          fontSize="lg"
        />
        <IconButton
          as="a"
          href="https://www.linkedin.com/in/jhimy-michel/"
          target="_blank"
          aria-label="LinkedIn"
          icon={<IoLogoLinkedin />}
          variant="ghost"
          size="sm"
          fontSize="lg"
        />
      </HStack>
    </Container>
  )
}

// The room fills the screen on every page. Pages open in a panel over it:
// About on home (/#about), Posts and each post on the bookshelf
const Main = ({ children, router }) => {
  const hash = useHash()
  const isHome = router.pathname === '/'
  const onShelf = router.pathname.startsWith('/posts')
  const panelOpen = onShelf || (isHome && hash === '#about')
  const panelWidth = onShelf ? PANEL_WIDTH.posts : PANEL_WIDTH.about
  // /posts#tech pulls the Tech book out of the shelf
  const activeTopic =
    router.pathname === '/posts' && topicById(hash.slice(1))
      ? hash.slice(1)
      : null
  const pagePath = router.asPath.split('#')[0]
  const pageUrl = `${SITE_URL}${pagePath === '/' ? '' : pagePath}`

  return (
    <Box as="main">
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
      <Box position="relative" h="100svh" overflow="hidden">
        <VoxelDog
          focus={onShelf ? 'shelf' : 'room'}
          panelWidth={panelOpen ? panelWidth : 0}
          activeTopic={activeTopic}
        />
        {!panelOpen && <HeroText />}
      </Box>
      <Panel
        open={panelOpen}
        width={panelWidth}
        resetKey={router.asPath.split('#')[0]}
      >
        {children}
      </Panel>
    </Box>
  )
}

export default Main
