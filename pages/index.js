import {
  Container,
  Box,
  Heading,
  Image,
  useColorModeValue,
  Link
  // Button
} from '@chakra-ui/react'
/* import Link from 'next/link'
import NextLink from 'next/link'
import { ChevronRightIcon } from '@chakra-ui/icons' */

import Section from '../components/section'
import Paragraph from '../components/paragraph'
import { BioSection, BioYear } from '../components/bio'
import Layout from '../components/layouts/article'

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
          Hello, I&apos;m a Software Engineer based in Switzerland 🇨🇭
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
              alt="profile image"
              src="/images/jhimy.jpg"
            />
          </Box>
        </Box>
        <Section delay={0.1}>
          <Paragraph>
            <Heading as="h3" variant="section-title">
              Hi,
            </Heading>
            Welcome to my digital world! I&apos;m Jhimy Michel, a Software
            Engineer originally from Bolivia and now based in Zurich. Passionate
            about crafting innovative digital solutions, I also have a keen
            interest in writing and photography. Drawing from my diverse
            experiences and cultural background, I strive to bring creativity
            and efficiency to every project I undertake.
          </Paragraph>
          {/* <Box align="center" my={4}>
            <NextLink href="/works">
              <Button rightIcon={<ChevronRightIcon />} colorScheme="teal">
                My portfolio
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
            , La Paz - Bolivia.
          </BioSection>
          <BioSection>
            <BioYear>2020</BioYear>
            Systems Information Engineering,{' '}
            <Link href="https://www.univalle.edu/" target="_blank">
              Del Valle University
            </Link>
            , La Paz - Bolivia.
          </BioSection>
          {/* <BioSection>
            <BioYear>2020</BioYear>
            Full stack developer, Kaleidosim AG , Zurich - Switzerland.
          </BioSection> */}
          <BioSection>
            <BioYear>2021 - 2022</BioYear>
            Master in Computer Sciences,{' '}
            <Link href="https://www.zhaw.ch/en/university/" target="_blank">
              Zurich University of Applied Sciences
            </Link>
            , Zurich - Switzerland.
          </BioSection>
          <BioSection>
            <BioYear>2023 - Present</BioYear>
            Assistant Research,{' '}
            <Link
              href="https://www.zhaw.ch/en/engineering/institutes-centres/icp-institute-of-computational-physics/"
              target="_blank"
            >
              Institute of Computational Physics ZHAW
            </Link>
            , Zurich - Switzerland.
          </BioSection>
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            I love
          </Heading>
          <Paragraph>
            Arts, Sports, Music, Photography and Writing{' '}
            {/* <Link href="">Drawing</Link> */}
          </Paragraph>
        </Section>
      </Container>
    </Layout>
  )
}

export default Home
