import Link from 'next/link'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

// Pixel Perrito (also the favicon) and, off the home page, the name. On
// home the big name over the room already says it
const Logo = ({ showName = true }) => {
  const color = useColorModeValue('brand.teal', 'brand.orange')
  const gradient = useColorModeValue(
    'linear(to-r, brand.tealDeep, brand.teal)',
    'linear(to-r, brand.orange, brand.rust)'
  )
  return (
    <Link href="/" scroll={false} aria-label="Jhimy Michel, home">
      <MotionBox
        display="inline-flex"
        alignItems="center"
        py={2}
        px={2}
        cursor="pointer"
        position="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <MotionBox
          as="img"
          src="/perrito.svg"
          alt=""
          w="28px"
          h="28px"
          sx={{ imageRendering: 'pixelated' }}
          whileHover={{ rotate: -12 }}
          transition={{ duration: 0.2 }}
        />
        {showName && (
          <Text
            color={color}
            fontFamily='"M PLUS Rounded 1c", sans-serif'
            fontWeight="bold"
            fontSize="18px"
            ml={3}
            bgGradient={gradient}
            bgClip="text"
          >
            Jhimy Michel
          </Text>
        )}
      </MotionBox>
    </Link>
  )
}

export default Logo
