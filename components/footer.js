import { Box, Link, useColorModeValue } from '@chakra-ui/react'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'

const Footer = () => {
  const color = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      as="footer"
      align="center"
      opacity={0.8}
      fontSize="sm"
      color={color}
      pt={10}
      pb={4}
    >
      <Box mb={2} display="flex" justifyContent="center" gap={4}>
        <Link
          href="https://github.com/jhimy-michel"
          target="_blank"
          aria-label="GitHub"
        >
          <IoLogoGithub size={20} />
        </Link>
        <Link
          href="https://www.linkedin.com/in/jhimy-michel/"
          target="_blank"
          aria-label="LinkedIn"
        >
          <IoLogoLinkedin size={20} />
        </Link>
      </Box>
      &copy; {new Date().getFullYear()} Jhimy Michel · Built with{' '}
      <Link href="https://github.com/jhimy-michel/jmichel" target="_blank">
        Next.js
      </Link>
    </Box>
  )
}

export default Footer
