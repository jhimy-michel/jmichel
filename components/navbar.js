import Logo from './logo'
import NextLink from 'next/link'
import {
  Container,
  Box,
  HStack,
  Menu,
  MenuItem,
  MenuList,
  MenuButton,
  IconButton
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import ThemeToggleButton from './theme-toggle-button'
import LinkItem from './utils/linkItem'
import { SITE_PADDING, SITE_WIDTH } from '../libs/layout'

// Floats over the room (no background strip), in the same column as the
// hero text: logo and name on the left, links and theme on the right
const NavBar = props => {
  const { path } = props

  return (
    <Box position="fixed" as="nav" w="100%" zIndex={1}>
      <Container
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxW={`${SITE_WIDTH}px`}
        px={`${SITE_PADDING}px`}
        py={2}
      >
        <Logo />
        <HStack spacing={1}>
          <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
            <LinkItem href="/#about" path={path}>
              About
            </LinkItem>
            <LinkItem href="/posts" path={path}>
              Posts
            </LinkItem>
          </HStack>
          <ThemeToggleButton />
          <Box display={{ base: 'inline-block', md: 'none' }}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="ghost"
                aria-label="Options"
              />
              <MenuList>
                <MenuItem as={NextLink} href="/#about" scroll={false}>
                  About
                </MenuItem>
                <MenuItem as={NextLink} href="/posts">
                  Posts
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </HStack>
      </Container>
    </Box>
  )
}

export default NavBar
