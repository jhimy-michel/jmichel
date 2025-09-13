import {
  Container,
  Box,
  Heading,
  Image,
  useColorModeValue,
  Link,
  Button,
  List,
  ListItem
} from '@chakra-ui/react'
// import NextLink from 'next/link'
// import { ChevronRightIcon } from '@chakra-ui/icons'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'

import Section from '../components/section'
import Paragraph from '../components/paragraph'
import { BioSection, BioYear } from '../components/bio'
import Layout from '../components/layouts/article'
// import profileImage from '../public/jhimy_michel.png'

const Home = () => {
  return (
    <Layout>
      <Container>
        <Box
          borderRadius="lg"
          bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
          p={3}
          align="center"
          mb={6}
        >
          Hi/ Hola/ Grüezi,
        </Box>
        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Jhimy Michel
            </Heading>
            <p>Tech Aficionado / Innovative Mind / Cultural Explorer </p>
          </Box>

          <Box
            flexShrink={0}
            mt={{ base: 4, md: 0 }}
            ml={{ md: 6 }}
            align="center"
          >
            <Image
              borderColor="whiteAlpha.800"
              borderWidth={2}
              borderStyle="solid"
              maxWidth="100px"
              display="inline-block"
              borderRadius="full"
              placeholder="blur"
              blurDataURL="data:image/png;base64,..." // Replace with a valid base64-encoded image
              alt="profile image"
              src="jhimy_michel.png"
            />
          </Box>
        </Box>
        <Section delay={0.1}>
          <Paragraph>
            <br />
            Welcome to my digital space! I&apos;m Jhimy Michel, a Software
            Engineer from Bolivia, now based in Europe (Switzerland & Spain).
          </Paragraph>
          {/* <Box align="center" my={4}>
            <NextLink href="/my-cv">
              <Button rightIcon={<ChevronRightIcon />} colorScheme="teal">
                My CV
              </Button>
            </NextLink>
          </Box> */}
        </Section>
        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            Bio
          </Heading>
          <BioSection>
            <BioYear>2018</BioYear>
            Software Developer,{' '}
            <Link href="https://newvisiondata.com/" target="_blank">
              New Vision Data
            </Link>
            , Bolivia.
          </BioSection>
          <BioSection>
            <BioYear>2020</BioYear>
            Software Engineer,{' '}
            <Link href="https://kaleidosim.com/" target="_blank">
              Kaleidosim AG
            </Link>
            , Switzerland.
          </BioSection>
          <BioSection>
            <BioYear>2023</BioYear>
            Research Assistant,{' '}
            <Link
              href="https://www.zhaw.ch/en/engineering/institutes-centres/icp-institute-of-computational-physics/"
              target="_blank"
            >
              ZHAW
            </Link>
            , Switzerland.
          </BioSection>
          <BioSection>
            <BioYear>2025</BioYear>
            Software Engineer,{' '}
            <Link
              href="https://www.playnvoice.ai/"
              target="_blank"
            >
              PlaynVoice
            </Link>
            , Switzerland.
          </BioSection>
        </Section>
        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            I love
          </Heading>
          <Paragraph>
            Arts, Sports, Music, <Link href="photography">Photography</Link> and{' '}
            <Link href="/notes">Writing</Link>.{' '}
          </Paragraph>
        </Section>
        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            Let&apos;s connect!
          </Heading>
          <List>
            <ListItem>
              <Link href="https://github.com/jhimy-michel" target="_blank">
                <Button
                  variant="ghost"
                  colorScheme="teal"
                  leftIcon={<IoLogoGithub />}
                >
                  @jhimy-michel
                </Button>
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href="https://www.linkedin.com/in/jhimy-michel/"
                target="_blank"
              >
                <Button
                  variant="ghost"
                  colorScheme="teal"
                  leftIcon={<IoLogoLinkedin />}
                >
                  @jhimy-michel
                </Button>
              </Link>
            </ListItem>
          </List>
        </Section>
      </Container>
    </Layout>
  )
}

export default Home
