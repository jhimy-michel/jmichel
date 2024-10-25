import NextLink from 'next/link'
import { Link, useColorModeValue } from '@chakra-ui/react'

/**
 * LinkItem component with underline decoration for active state
 * @param {string} href - The destination URL
 * @param {string} path - The current path for comparison
 * @param {React.ReactNode} children - Child elements to render
 * @returns {JSX.Element} Styled link component
 */
const LinkItem = ({ href, path, children }) => {
    const active = path === href
    const activeColor = useColorModeValue('brand.teal', 'brand.orange')
    const inactiveColor = useColorModeValue('brand.teal', 'brand.orange')
    const hoverColor = useColorModeValue('brand.rust', 'brand.sand')
    
    return (
      <NextLink href={href} passHref>
        <Link
          p={2}
          position="relative"
          transition="all 0.3s ease-in-out"
          color={inactiveColor}
          textDecoration={active ? 'underline' : 'none'}
          textUnderlineOffset="6px"
          textDecorationThickness="2px"
          textDecorationColor={activeColor}
          _hover={{
            color: hoverColor,
            textDecoration: 'underline',
            textDecorationColor: hoverColor
          }}
        >
          {children}
        </Link>
      </NextLink>
    )
  }
  
  export default LinkItem
