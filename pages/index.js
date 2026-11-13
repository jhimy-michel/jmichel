import {
  Box,
  Flex,
  Heading,
  useColorModeValue,
  Link,
  Button,
  List,
  ListItem
} from '@chakra-ui/react'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'

import Footer from '../components/footer'
import CalendarBadge from '../components/calendar-badge'
import Paragraph from '../components/paragraph'
import { BioSection, BioYear } from '../components/bio'

// The home page is the room (in the main layout). This is the About
// content, shown in the panel that slides over it at /#about
const Home = () => {
  const greetingBg = useColorModeValue('white', 'brand.night')
  const socialColor = useColorModeValue('brand.teal', 'brand.orange')
  const socialHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  return (
    <>
      <Heading as="h2" size="lg" mb={6} pr={12}>
        About me
      </Heading>
      <Flex gap={3} mb={6} align="stretch">
        <Box
          borderRadius="lg"
          bg={greetingBg}
          p={3}
          fontWeight="medium"
          boxShadow="sm"
          flexGrow={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          Hi · Hola · Grüezi 👋
        </Box>
        <CalendarBadge />
      </Flex>
      <Box mb={6}>
        <Paragraph>
          I&apos;m Jhimy Michel, a Software Engineer from Bolivia, now based in
          Europe (Switzerland & Spain).
        </Paragraph>
      </Box>
      <Box mb={6}>
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
          <Link href="https://www.playnvoice.ai/" target="_blank">
            PlaynVoice
          </Link>
          , Switzerland.
        </BioSection>
      </Box>
      <Box mb={6}>
        <Heading as="h3" variant="section-title">
          I love
        </Heading>
        <Paragraph>
          Arts, Sports, Music, Photography and{' '}
          <Link href="/posts">Writing</Link>.
        </Paragraph>
      </Box>
      <Box>
        <Heading as="h3" variant="section-title">
          Let&apos;s connect!
        </Heading>
        <List>
          <ListItem>
            <Link href="https://github.com/jhimy-michel" target="_blank">
              <Button
                variant="ghost"
                color={socialColor}
                _hover={{ bg: socialHoverBg }}
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
                color={socialColor}
                _hover={{ bg: socialHoverBg }}
                leftIcon={<IoLogoLinkedin />}
              >
                @jhimy-michel
              </Button>
            </Link>
          </ListItem>
        </List>
      </Box>
      <Footer />
    </>
  )
}

export default Home
