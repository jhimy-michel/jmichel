import NextLink from 'next/link'
import Head from 'next/head'
import {
  Box,
  Flex,
  Heading,
  Link,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react'
import { getAllPosts } from '../libs/posts'
import { TOPICS, topicById } from '../libs/topics'
import { useHash } from '../libs/use-hash'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

// Perrito's bookshelf: one book per topic. /posts lists everything,
// /posts#tech only the Tech book (also what clicking that book opens)
const Posts = ({ posts }) => {
  const hash = useHash()
  const topic = topicById(hash.slice(1))
  const shown = topic ? posts.filter((p) => p.topic === topic.id) : posts

  const cardBg = useColorModeValue('white', 'brand.night')
  const hoverBg = useColorModeValue('#FFFDF5', 'brand.surfaceHover')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  const textColor = useColorModeValue('#2A2F3A', '#D8DCE6')
  const chipBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const chipActiveColor = useColorModeValue('white', 'brand.night')

  const chip = (href, label, active, color) => (
    <Link
      as={NextLink}
      href={href}
      scroll={false}
      px={3}
      py={1}
      borderRadius="full"
      fontSize="sm"
      fontWeight="semibold"
      bg={active ? color || 'brand.orange' : chipBg}
      color={active ? chipActiveColor : undefined}
      _hover={{ textDecoration: 'none', opacity: 0.85 }}
    >
      {label}
    </Link>
  )

  return (
    <>
      <Head>
        <title>Posts - Jhimy Michel</title>
        <meta
          property="og:title"
          content="Posts - Jhimy Michel"
          key="og:title"
        />
      </Head>
      <Heading as="h2" size="lg" mb={2} pr={12}>
        {topic ? `${topic.emoji} ${topic.label}` : 'Bookshelf'}
      </Heading>
      <Text mb={5} color={mutedColor}>
        {topic
          ? `Posts about ${topic.label.toLowerCase()}.`
          : 'Thoughts and learnings from tech, travel and life. Each book on the shelf is a topic.'}
      </Text>

      <Wrap spacing={2} mb={6}>
        <WrapItem>{chip('/posts', 'All', !topic)}</WrapItem>
        {TOPICS.map((t) => (
          <WrapItem key={t.id}>
            {chip(
              `/posts#${t.id}`,
              `${t.emoji} ${t.label}`,
              topic?.id === t.id,
              t.color
            )}
          </WrapItem>
        ))}
      </Wrap>

      {shown.map((post) => {
        const postTopic = topicById(post.topic)
        return (
          <Link
            key={post.slug}
            as={NextLink}
            href={`/posts/${post.slug}`}
            display="block"
            mb={4}
            _hover={{ textDecoration: 'none' }}
          >
            <Box
              p={5}
              bg={cardBg}
              borderRadius="lg"
              borderLeftWidth="4px"
              borderLeftColor={postTopic?.color || 'transparent'}
              boxShadow="sm"
              transition="all 0.2s ease"
              _hover={{ bg: hoverBg, transform: 'translateY(-2px)' }}
            >
              <Heading as="h3" size="sm" mb={1}>
                {post.title}
              </Heading>
              <Flex gap={2} fontSize="sm" color={mutedColor} mb={2}>
                {post.date && <Text>{formatDate(post.date)}</Text>}
                {postTopic && <Text>· {postTopic.label}</Text>}
              </Flex>
              {post.description && (
                <Text fontSize="sm" color={textColor}>
                  {post.description}
                </Text>
              )}
            </Box>
          </Link>
        )
      })}

      {shown.length === 0 && (
        <Text color={mutedColor} py={6} textAlign="center">
          No {topic ? topic.label.toLowerCase() : ''} posts yet. This book is
          still being written ✍️
        </Text>
      )}
    </>
  )
}

export const getStaticProps = async () => ({
  props: { posts: getAllPosts() }
})

export default Posts
