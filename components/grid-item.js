import NextLink from 'next/link'
import Image from 'next/image'
import { Box, Text, LinkBox, LinkOverlay, useColorModeValue } from '@chakra-ui/react'
import { Global } from '@emotion/react'

export const GridItem = ({ children, href, title }) => (
  <Box w="100%" align="center">
    <LinkBox cursor="pointer">
      <Image
        alt={title}
        className="grid-item-tumbnail"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
        src=""
      />
      <LinkOverlay href={href} target="_blank">
        <Text fontSize={2}>{title}</Text>
      </LinkOverlay>
      <Text fontSize={14}>{children}</Text>
    </LinkBox>
  </Box>
)

export const WorkGridItem = ({ children, id, title }) => {
  const borderColor = useColorModeValue('brand.teal', 'brand.orange')
  const bgColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.100')
  const titleColor = useColorModeValue('brand.teal', 'brand.orange')
  
  return (
    <Box
      w="100%"
      position="relative"
      role="group"
    >
      <NextLink href={`/notes/${id}`} passHref>
        <LinkBox
          cursor="pointer"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={`${borderColor}30`}
          bg={bgColor}
          transition="all 0.2s ease-in-out"
          position="relative"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: 'lg',
            borderColor: borderColor,
            '& > div > p:first-of-type': {
              color: borderColor
            }
          }}
        >
          <Box>
            <LinkOverlay href={`/notes/${id}`}>
              <Text
                fontSize={20}
                fontWeight="bold"
                mb={3}
                transition="color 0.2s ease-in-out"
                color={titleColor}
              >
                {title}
              </Text>
            </LinkOverlay>
            <Text
              fontSize={14}
              lineHeight={1.6}
              opacity={0.8}
            >
              {children}
            </Text>
          </Box>

          {/* Decorative element for visual interest */}
          <Box
            position="absolute"
            top={0}
            left={0}
            width="40px"
            height="2px"
            bg={borderColor}
            borderTopLeftRadius="lg"
          />
        </LinkBox>
      </NextLink>
    </Box>
  )
}

export const GridItemStyle = () => (
  <Global
    styles={`
    .grid-item-thumbnail {
      border-radius: 12px
    }
 `}
  />
)
