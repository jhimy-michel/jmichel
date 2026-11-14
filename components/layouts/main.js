import Head from 'next/head'
import {
  Box,
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
import { HERO_TEXT_WIDTH, SITE_PADDING, SITE_WIDTH } from '../../libs/layout'

// The 3D room (three.js, the biggest part of the site) loads on its own,
// so page text never waits for it; a spinner holds its place meanwhile
const VoxelDog = dynamic(() => import('../voxel-dog'), {
  ssr: false,
  loading: () => <VoxelDogLoader />
})

const SITE_URL = 'https://jmichel.ch'
const DESCRIPTION =
  "Jhimy Michel's homepage - Software Engineer from Bolivia, based in Switzerland & Spain. Posts about tech, travel, and life."

// Name and the ways in. Wide screens: a column on the left, vertically
// centred, with the room framed to its right. Narrower: under the room.
// Same column as the navbar
const HeroText = () => {
  const muted = useColorModeValue('gray.600', 'gray.400')
  return (
    <Container
      maxW={`${SITE_WIDTH}px`}
      px={`${SITE_PADDING}px`}
      position="absolute"
      top={0}
      bottom={0}
      left={0}
      right={0}
      display="flex"
      flexDirection="column"
      justifyContent={{ base: 'flex-end', lg: 'center' }}
      pb={{ base: 8, lg: 0 }}
      pointerEvents="none"
    >
      <Box maxW={{ lg: `${HERO_TEXT_WIDTH}px` }}>
        <Heading
          as="h1"
          variant="page-title"
          fontSize={['3xl', null, '4xl', '5xl']}
        >
          Jhimy Michel
        </Heading>
        <Text fontSize={{ lg: 'lg' }}>Software engineer, Cloud and AI.</Text>
        {/* About and Posts live in the navbar; here only the profiles */}
        <HStack mt={3} ml={-2} spacing={1} pointerEvents="auto">
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
        <Text mt={2} fontSize="sm" color={muted}>
          Psst, the room is clickable 👀
        </Text>
      </Box>
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
  // Soft lamplight glow behind the room, centred where the room sits
  const glow = useColorModeValue(
    'rgba(203, 96, 64, 0.08)',
    'rgba(253, 139, 81, 0.14)'
  )
  // Reading a post keeps its book pulled out
  const activePost =
    router.pathname === '/posts/[slug]' ? router.query.slug : null
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
      <Box
        position="relative"
        h="100svh"
        overflow="hidden"
        bgImage={{
          base: `radial-gradient(ellipse 80% 45% at 50% 42%, ${glow}, transparent 70%)`,
          lg: `radial-gradient(ellipse 45% 60% at 62% 52%, ${glow}, transparent 70%)`
        }}
      >
        <VoxelDog
          focus={onShelf ? 'shelf' : 'room'}
          panelWidth={panelOpen ? panelWidth : 0}
          activeTopic={activeTopic}
          activePost={activePost}
          hero={!panelOpen}
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
