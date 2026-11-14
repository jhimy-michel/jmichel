import { Box, Link, useColorModeValue } from '@chakra-ui/react'
import { IoLogoGithub, IoLogoLinkedin } from 'react-icons/io5'
import { GITHUB_URL, LINKEDIN_URL, REPO_URL } from '../libs/links'

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
        <Link href={GITHUB_URL} target="_blank" aria-label="GitHub">
          <IoLogoGithub size={20} />
        </Link>
        <Link href={LINKEDIN_URL} target="_blank" aria-label="LinkedIn">
          <IoLogoLinkedin size={20} />
        </Link>
      </Box>
      &copy; {new Date().getFullYear()} Jhimy Michel · Built with{' '}
      <Link href={REPO_URL} target="_blank">
        Next.js
      </Link>
    </Box>
  )
}

export default Footer
