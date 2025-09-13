/* eslint-disable react-hooks/rules-of-hooks */
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  Container,
  Heading,
  Text,
  Box,
  useColorModeValue
} from '@chakra-ui/react'
import Layout from '../../components/layouts/article'

const BlogPost = ({ source, frontmatter }) => {
  return (
    <Layout title={frontmatter.title}>
      <Container>
        <Box mb={6}>
          <Heading as="h1" size="xl" mb={4}>
            {frontmatter.title}
          </Heading>
          {frontmatter.date && (
            <Text color={useColorModeValue('gray.600', 'gray.400')} mb={4}>
              {new Date(frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          )}
        </Box>
        
        <Box
          bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.200')}
          p={6}
          borderRadius="lg"
        >
          <MDXRemote {...source} />
        </Box>
      </Container>
    </Layout>
  )
}

export const getStaticPaths = async () => {
  const postsDirectory = path.join(process.cwd(), 'content/posts')
  
  if (!fs.existsSync(postsDirectory)) {
    return { paths: [], fallback: false }
  }

  const filenames = fs.readdirSync(postsDirectory)
  const paths = filenames
    .filter(name => name.endsWith('.mdx'))
    .map(name => ({
      params: { slug: name.replace(/\.mdx$/, '') }
    }))

  return { paths, fallback: false }
}

export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const filePath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`)
  
  if (!fs.existsSync(filePath)) {
    return { notFound: true }
  }

  const source = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(source)
  const mdxSource = await serialize(content)

  return {
    props: {
      source: mdxSource,
      frontmatter: data
    }
  }
}

export default BlogPost