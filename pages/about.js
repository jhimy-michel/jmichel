import {
  Container,
  Heading,
  Text,
  // Box,
  VStack,
  // Button,
  useColorModeValue,
  Divider
} from '@chakra-ui/react'
// import { ChevronRightIcon } from '@chakra-ui/icons'
// import NextLink from 'next/link'
import Layout from '../components/layouts/article'

const About = () => {
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900')
  const dividerColor = useColorModeValue('brand.teal', 'brand.orange')

  return (
    <Layout>
      <Container maxW="4xl" pt={14}>
        <VStack spacing={8}>
          {/* Header Section */}
          <VStack spacing={6} textAlign="center" w="full">
            <Heading as="h1" variant="page-title">
              About Me
            </Heading>
            <Text
              fontSize="xl"
              color={useColorModeValue('brand.rust', 'brand.sand')}
              fontWeight="medium"
            >
              Hello • Grüezi • Hola
            </Text>
          </VStack>

          <VStack spacing={8} align="stretch">
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" lineHeight="tall" color={textColor}>
                I&apos;m Jhimy Michel, a passionate Software Engineer with a
                deep love for creativity, technology, and continuous learning.
                My journey in coding began in Bolivia during my high school
                years, when my father gifted me my first computer—a luxury at
                the time—and placed it in my room.
              </Text>
              <Text fontSize="lg" lineHeight="tall" color={textColor}>
                From that moment, I was captivated by the endless possibilities,
                constantly exploring and learning. This early curiosity laid the
                foundation for a lifelong commitment to technology. Years later,
                life brought me to Switzerland, where I pursued a Master&apos;s
                degree in Computer Science.
              </Text>
              <Text fontSize="lg" lineHeight="tall" color={textColor}>
                Now, after completing my studies, I&apos;m excited to explore new
                opportunities globally and look forward to connecting with each
                of you.
              </Text>
            </VStack>

            <Divider borderColor={dividerColor} opacity={0.3} />
          </VStack>

          {/* <Box textAlign="center" pt={4}>
            <NextLink href="/my-cv" passHref>
              <Button
                variant="primary"
                rightIcon={<ChevronRightIcon />}
                size="lg"
                px={8}
              >
                View My CV
              </Button>
            </NextLink>
          </Box> */}
        </VStack>
      </Container>
    </Layout>
  )
}

export default About
