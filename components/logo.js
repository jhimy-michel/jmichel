import Link from 'next/link'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import TulipIcon from './icons/tulip'

const MotionBox = motion(Box)

const Logo = () => {

  return (
    <Link href="/" scroll={false}>
      <MotionBox
        display="inline-flex"
        alignItems="center"
        py={2}
        px={4}
        cursor="pointer"
        position="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={bgColor}
          borderRadius="full"
          backdropFilter="blur(8px)"
          transition="all 0.3s ease-in-out"
          _hover={{ bg: hoverBgColor }}
        /> */}
        
        <MotionBox
          position="relative"
          whileHover={{ rotate: 20 }}
          transition={{ duration: 0.2 }}
        >
          <TulipIcon />
        </MotionBox>
        <Text
          position="relative"
          color={useColorModeValue('brand.teal', 'brand.orange')}
          fontFamily='"M PLUS Rounded 1c", sans-serif'
          fontWeight="bold"
          fontSize="18px"
          ml={3}
          bgGradient={useColorModeValue(
            'linear(to-r, brand.teal, brand.rust)',
            'linear(to-r, brand.orange, brand.rust)'
          )}
          bgClip="text"
          _hover={{
            bgGradient: useColorModeValue(
              'linear(to-r, brand.rust, brand.teal)',
              'linear(to-r, brand.rust, brand.orange)'
            )
          }}
          transition="all 0.3s ease-in-out"
        >
          Jhimy Michel
        </Text>
      </MotionBox>
    </Link>
  )
}

export default Logo