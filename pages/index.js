import {
  Container,
  Box,
  Heading,
  Image,
  useColorModeValue,
  Button
} from '@chakra-ui/react'
import Link from 'next/link'
import NextLink from 'next/link'

import Section from '../components/section'
import Paragraph from '../components/paragraph'
import { ChevronRightIcon } from '@chakra-ui/icons'
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
          Hello, I&apos;m a full-stack developer based in Switzerland!
        </Box>
        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Jhimy Michel
            </Heading>
            <p>Digital Cratfzman (Artist / Developer/ )</p>
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
            Welcome to my digital world. I'm Jhimy Michel, a versatile
            full-stack developer living in the vibrant city of Zurich. I have an
            unbridled passion for crafting innovative digital solutions and
            thrive on the art of transforming ideas into reality. I originate
            from the Amazonas region of Bolivia, where I grew up amidst the lush
            rainforests, and my journey has taken me to the towering heights of
            the Andes mountains, enriching my creative palette with diverse
            experiences and perspectives. I'm more than just a developer; I'm a
            creator, problem solver, and an avid explorer of the digital realm.
            When I'm not immersed in the digital world, I find solace in the
            real one, capturing moments through my lens. My love for photography
            adds a unique dimension to my creative process, providing a fresh
            perspective on the world around me. Explore my world of innovation
            and creativity here in Zurich, where my digital expertise and
            passion for the real world converge to shape extraordinary
            solutions, influenced by my diverse cultural heritage and remarkable
            life journey.
          </Paragraph>
          <Box align="center" my={4}>
            <NextLink href="/works">
              <Button rightIcon={<ChevronRightIcon />} colorScheme="teal">
                My portfolio
              </Button>
            </NextLink>
          </Box>
        </Section>
        <Section delay={0.2}>
          <Heading as="h3" variant="section-title">
            Bio
          </Heading>
          <BioSection>
            <BioYear>1996</BioYear>
            Born in La Paz, Bolivia.
          </BioSection>
          <BioSection>
            <BioYear>2019</BioYear>
            Bachelor Degree in Systems Information Engineering, Univalle, La Paz
            Bolivia.
          </BioSection>
        </Section>

        <Section delay={0.3}>
          <Heading as="h3" variant="section-title">
            I love
          </Heading>
          <Paragraph>
            Art, Music, <Link href="">Drawing</Link>
          </Paragraph>
        </Section>
      </Container>
    </Layout>
  )
}

export default Home
