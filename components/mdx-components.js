import {
  Box,
  Code,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList
} from '@chakra-ui/react'

// Chakra resets plain HTML (no list bullets, unstyled tables), so map the
// Markdown elements of posts onto Chakra components
const mdxComponents = {
  h1: props => <Heading as="h2" size="lg" mt={8} mb={4} {...props} />,
  h2: props => <Heading as="h2" size="md" mt={8} mb={3} {...props} />,
  h3: props => <Heading as="h3" size="sm" mt={6} mb={3} {...props} />,
  p: props => <Text mb={4} lineHeight="tall" {...props} />,
  a: props => <Link isExternal={props.href?.startsWith('http')} {...props} />,
  ul: props => <UnorderedList mb={4} pl={2} spacing={1} {...props} />,
  ol: props => <OrderedList mb={4} pl={2} spacing={1} {...props} />,
  li: props => <ListItem lineHeight="tall" {...props} />,
  code: props => <Code fontSize="0.9em" {...props} />,
  table: props => (
    <Box overflowX="auto" mb={6}>
      <Table size="sm" {...props} />
    </Box>
  ),
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: props => <Th textTransform="none" {...props} />,
  td: Td
}

export default mdxComponents
