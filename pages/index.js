import {
  Container,
  Box,
  Heading,
  Image,
  useColorModeValue
} from '@chakra-ui/react'
import Section from '../components/section'

const Home = () => {
  return (
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
            src="/images/takuya.jpg"
          />
        </Box>
      </Box>
      <Section delay={0.1}>
        <Heading as="h3" variant="section-title">
          Work
        </Heading>
        <p>Paragraph</p>
      </Section>
    </Container>
  )
}

export default Home
