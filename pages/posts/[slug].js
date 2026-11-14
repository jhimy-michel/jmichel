import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'
import NextLink from 'next/link'
import Head from 'next/head'
import { Box, Heading, Link, Text, useColorModeValue } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { getPost, getPostSlugs } from '../../libs/posts'
import { topicById } from '../../libs/topics'
import mdxComponents from '../../components/mdx-components'

// One post, read in the panel next to the bookshelf
const BlogPost = ({ source, meta }) => {
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  const topic = topicById(meta.topic)
  const title = `${meta.title} - Jhimy Michel`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} key="og:title" />
        <meta name="twitter:title" content={title} key="twitter:title" />
      </Head>
      <Link
        as={NextLink}
        href={topic ? `/posts#${topic.id}` : '/posts'}
        scroll={false}
        fontSize="sm"
        display="inline-flex"
        alignItems="center"
        mb={4}
      >
        <ChevronLeftIcon />
        {topic ? `${topic.emoji} ${topic.label}` : 'All posts'}
      </Link>
      <Heading as="h1" size="xl" mb={2} pr={12}>
        {meta.title}
      </Heading>
      {meta.date && (
        <Text color={mutedColor} mb={6}>
          {new Date(meta.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      )}
      <Box>
        <MDXRemote {...source} components={mdxComponents} />
      </Box>
    </>
  )
}

export const getStaticPaths = async () => ({
  paths: getPostSlugs().map(slug => ({ params: { slug } })),
  fallback: false
})

export const getStaticProps = async ({ params }) => {
  const post = getPost(params.slug)
  if (!post) return { notFound: true }
  const source = await serialize(post.content, {
    mdxOptions: { remarkPlugins: [remarkGfm] }
  })
  return { props: { source, meta: post.meta } }
}

export default BlogPost
