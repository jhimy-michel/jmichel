import { AnimatePresence, motion } from 'framer-motion'
import { IconButton, useColorModeValue, useColorMode } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'

const ThemeToggleButton = () => {
  const { toggleColorMode } = useColorMode()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        style={{ display: 'inline-block' }}
        key={useColorModeValue('light', 'dark')}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          aria-label="Toggle theme"
          // Quiet, like the nav links (the room's lamp is a switch too)
          variant="ghost"
          color={useColorModeValue('brand.teal', 'brand.orange')}
          _hover={{ bg: useColorModeValue('blackAlpha.100', 'whiteAlpha.100') }}
          icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
          onClick={toggleColorMode}
        />
      </motion.div>
    </AnimatePresence>
  )
}
export default ThemeToggleButton
