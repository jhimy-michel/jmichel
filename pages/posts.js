/* eslint-disable react-hooks/rules-of-hooks */
import {
  Container,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  Box,
  Link
} from '@chakra-ui/react'
import NextLink from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Section from '../components/section'
import Layout from '../components/layouts/article'

const Posts = ({ blogPosts }) => {
  const cardBg = useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')
  const hoverBg = useColorModeValue('whiteAlpha.700', 'whiteAlpha.300')

  return (
    <Layout>
      <Container maxW="container.md">
        <Heading
          as="h3"
          variant="page-title"
          mb={6}
          display="flex"
          alignItems="center"
          gap={2}
        >
          Posts
        </Heading>
        <Text mb={6}>
          My thoughts, experiences, and learnings from tech, travel, and life.
        </Text>

        <SimpleGrid columns={[1, 1, 1]} gap={6}>
          {blogPosts.map((post, index) => (
            <Section key={post.slug} delay={index * 0.1}>
              <NextLink href={`/posts/${post.slug}`} passHref>
                <Link textDecoration="none" _hover={{ textDecoration: 'none' }}>
                  <Box
                    p={6}
                    bg={cardBg}
                    borderRadius="lg"
                    transition="all 0.3s ease"
                    _hover={{
                      bg: hoverBg,
                      transform: 'translateY(-2px)',
                      shadow: 'lg'
                    }}
                  >
                    <Heading as="h4" size="md" mb={2}>
                      {post.title}
                    </Heading>
                    {post.date && (
                      <Text
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.400')}
                        mb={2}
                      >
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    )}
                    {post.description && (
                      <Text color={useColorModeValue('gray.700', 'gray.300')}>
                        {post.description}
                      </Text>
                    )}
                  </Box>
                </Link>
              </NextLink>
            </Section>
          ))}
        </SimpleGrid>

        {blogPosts.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              No posts yet. Create your first post by adding an MDX file to{' '}
              <code>content/posts/</code>
            </Text>
          </Box>
        )}
      </Container>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const postsDirectory = path.join(process.cwd(), 'content/posts')
  
  let blogPosts = []
  if (fs.existsSync(postsDirectory)) {
    const filenames = fs.readdirSync(postsDirectory)
    blogPosts = filenames
      .filter(name => name.endsWith('.mdx'))
      .map(filename => {
        const filePath = path.join(postsDirectory, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data } = matter(fileContents)
        
        return {
          slug: filename.replace(/\.mdx$/, ''),
          title: data.title || filename.replace(/\.mdx$/, ''),
          date: data.date || null,
          description: data.description || null,
          ...data
        }
      })
      .sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date) - new Date(a.date)
      })
  }

  return {
    props: { blogPosts }
  }
}

export default Posts