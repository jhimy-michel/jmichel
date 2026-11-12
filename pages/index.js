import {
  Container,
  Box,
  Flex,
  Heading,
  Image,
  Text,
  useColorModeValue,
  Link,
  Button,
  List,
  ListItem
} from '@chakra-ui/react'
import NextLink from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'

import Section from '../components/section'
import CalendarBadge from '../components/calendar-badge'
import Paragraph from '../components/paragraph'
import { BioSection, BioYear } from '../components/bio'
import Layout from '../components/layouts/article'

const Home = ({ latestPosts }) => {
  const greetingBg = useColorModeValue('white', 'brand.surface')
  const cardBg = useColorModeValue('white', 'brand.surface')
  const cardHoverBg = useColorModeValue('#FFFDF5', 'brand.surfaceHover')
  const dateColor = useColorModeValue('gray.600', 'gray.400')
  const socialColor = useColorModeValue('brand.teal', 'brand.orange')
  const socialHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  return (
    <Layout>
      <Container>
        <Flex gap={3} mb={6} align="stretch">
          <Box
            borderRadius="lg"
            bg={greetingBg}
            p={3}
            align="center"
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
        <Box display={{ md: 'flex' }}>
          <Box flexGrow={1}>
            <Heading as="h2" variant="page-title">
              Jhimy Michel
            </Heading>
            <p>Software engineer, Cloud and AI.</p>
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
              src="/jhimy_michel.png"
            />
          </Box>
        </Box>
        <Section delay={0.1}>
          <Paragraph>
            <br />
            Welcome to my digital space! I&apos;m Jhimy Michel, a Software
            Engineer from Bolivia, now based in Europe (Switzerland & Spain).
          </Paragraph>
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
            <Link href="https://www.playnvoice.ai/" target="_blank">
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
            Arts, Sports, Music, Photography and{' '}
            <Link href="/posts">Writing</Link>.{' '}
          </Paragraph>
        </Section>
        {latestPosts.length > 0 && (
          <Section delay={0.3}>
            <Heading as="h3" variant="section-title">
              Latest posts
            </Heading>
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                as={NextLink}
                href={`/posts/${post.slug}`}
                textDecoration="none"
                _hover={{ textDecoration: 'none' }}
              >
                <Box
                  p={4}
                  mb={4}
                  bg={cardBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  transition="all 0.3s ease"
                  _hover={{
                    bg: cardHoverBg,
                    transform: 'translateY(-2px)',
                    shadow: 'lg'
                  }}
                >
                  <Heading as="h4" size="sm" mb={1}>
                    {post.title}
                  </Heading>
                  {post.date && (
                    <Text fontSize="sm" color={dateColor}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  )}
                </Box>
              </Link>
            ))}
          </Section>
        )}
        <Section delay={0.3}>
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
        </Section>
      </Container>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const postsDirectory = path.join(process.cwd(), 'content/posts')

  let latestPosts = []
  if (fs.existsSync(postsDirectory)) {
    latestPosts = fs
      .readdirSync(postsDirectory)
      .filter((name) => name.endsWith('.mdx'))
      .map((filename) => {
        const fileContents = fs.readFileSync(
          path.join(postsDirectory, filename),
          'utf8'
        )
        const { data } = matter(fileContents)
        return {
          slug: filename.replace(/\.mdx$/, ''),
          title: data.title || filename.replace(/\.mdx$/, ''),
          date: data.date || null
        }
      })
      .sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date) - new Date(a.date)
      })
      .slice(0, 3)
  }

  return {
    props: { latestPosts }
  }
}

export default Home
