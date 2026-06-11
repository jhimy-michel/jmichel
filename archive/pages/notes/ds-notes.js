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
  Badge
} from '@chakra-ui/react'
import NextLink from 'next/link'
import Layout from '../../components/layouts/article'
import Section from '../../components/section'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { DsNotesContent } from '../../libs/content/ds-notes'

const DSNotes = () => {
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
            <Text>DS Basis</Text>
          </BreadcrumbItem>
        </Breadcrumb>
        <Box
          borderBottom="1px solid"
          borderColor={`${borderColor}30`}
          pb={6}
          mb={6}
        >
          <Heading as="h1" variant="page-title" mb={4}>
            Data Structure Basis
          </Heading>

          <Flex gap={4} alignItems="center" flexWrap="wrap">
            <Badge
              colorScheme={useColorModeValue('teal', 'orange')}
              px={3}
              py={1}
              borderRadius="full"
            >
              Data Structure
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
            <DsNotesContent/>
          </Box>
        </Section>
      </Container>
    </Layout>
  )
}

export default DSNotes
