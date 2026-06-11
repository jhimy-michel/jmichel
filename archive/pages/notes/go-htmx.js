import {
  Container,
  Heading,
  Box,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Flex,
  Badge,
  Link
} from '@chakra-ui/react'
import NextLink from 'next/link'
import Layout from '../../components/layouts/article'
import Section from '../../components/section'
import { ChevronRightIcon } from '@chakra-ui/icons'
// import { DsNotesContent } from '../../libs/content/ds-notes'

const GoHtmx = () => {
  const borderColor = useColorModeValue('brand.teal', 'brand.orange')
  const bgColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.100')
  // const dateColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Layout>
      <Container maxW="container.md">
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color={borderColor} />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/notes">
              Notes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text>Go + HTMX</Text>
          </BreadcrumbItem>
        </Breadcrumb>
        <Box
          borderBottom="1px solid"
          borderColor={`${borderColor}30`}
          pb={6}
          mb={6}
        >
          <Heading as="h1" variant="page-title" mb={4}>
            Use GO to serve HTMX files
          </Heading>

          <Text fontSize="sm" color="gray.500" fontStyle="italic">
            March 25, 2025
          </Text>
          <Flex gap={4} alignItems="center" flexWrap="wrap">
            <Badge
              colorScheme={useColorModeValue('teal', 'orange')}
              px={3}
              py={1}
              borderRadius="full"
            >
              go
            </Badge>
            <Badge
              colorScheme={useColorModeValue('teal', 'orange')}
              px={3}
              py={1}
              borderRadius="full"
            >
              htmx
            </Badge>
          </Flex>
        </Box>

        <Section delay={0.1}>
          <Box
            borderRadius="lg"
            bg={bgColor}
            p={6}
            borderWidth="1px"
            borderColor={`${borderColor}30`}
          >
            <Text fontSize="lg" lineHeight="tall">
              I had the opportunity to present HTMX to a group of senior Go
              developers. To my surprise, I learned afterward that one of the
              language maintainers was present, which made the experience even
              more exciting. It was a fantastic event with a warm, welcoming
              community—and the free pizza afterward was a nice bonus! Link to
              the event:{' '}
              <Link
                href="https://www.meetup.com/zurich-gophers/events/299526834/?eventOrigin=group_events_list"
                color="teal.500"
                isExternal
              >
                here
              </Link>
            </Text>
            <Text fontSize="lg" lineHeight="tall" mt={4}>
              You can view the presentation here:{' '}
              <Link
                href="https://docs.google.com/presentation/d/137kIYMEJbgPtIbKI65YrKmrjIiK_Pc9oNOrRM7QYXzQ/edit?usp=sharing"
                color="teal.500"
                isExternal
              >
                HTMX Presentation
              </Link>
            </Text>
          </Box>
        </Section>
      </Container>
    </Layout>
  )
}

export default GoHtmx
