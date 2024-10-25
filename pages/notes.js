import {
  Container,
  Heading,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'
import Layout from '../components/layouts/article'

/**
 * Notes page
 */
const Notes = () => {
  const borderColor = useColorModeValue('brand.teal', 'brand.orange')

  const categories = [
    {
      title: 'Coding',
      items: [
        {
          id: 'ds-notes',
          title: 'Data Structures Basis',
          description: 'Basic knowledge about data structures',
          thumbnail: null // Add thumbnail later
        }
      ]
    },
    {
      title: 'Management',
      items: []
    },
    {
      title: 'Presentations',
      items: [
        {
          id: 'go-htmx',
          title: 'Go & HTMX',
          description: 'Use GO and HTMX',
          thumbnail: null
        }
      ]
    },
    {
      title: 'Life',
      items: [
        {
          id: 'note-system',
          title: 'Taking notes',
          description: 'How I take notes',
          thumbnail: null
        }
      ]
    }
  ]

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
          Knowledge Base
        </Heading>
        <Text mb={6}>
          A collection of notes, insights, and learnings from my journey through
          coding, management, and life in general.
        </Text>

        <Tabs variant="soft-rounded" colorScheme="teal" isLazy mt={6}>
          <TabList
            mb={6}
            gap={4}
            overflowX="auto"
            css={{
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.title}
                _selected={{
                  color: borderColor,
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textUnderlineOffset: '6px',
                  textDecorationThickness: '2px',
                  textDecorationColor: borderColor,
                  bg: 'transparent'
                }}
                transition="all 0.3s ease-in-out"
                position="relative"
                px={6}
                py={3}
                _hover={{
                  color: borderColor
                }}
              >
                {category.title}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {categories.map((category) => (
              <TabPanel key={category.title} p={0}>
                <SimpleGrid columns={[1, 1, 2]} gap={6}>
                  {category.items.map((item) => (
                    <Section key={item.id}>
                      <WorkGridItem
                        id={item.id}
                        title={item.title}
                        thumbnail={item.thumbnail}
                      >
                        {item.description}
                      </WorkGridItem>
                    </Section>
                  ))}
                </SimpleGrid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  )
}

export default Notes
