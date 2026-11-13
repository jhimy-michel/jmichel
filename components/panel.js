import { useEffect, useRef } from 'react'
import Router from 'next/router'
import { Box, IconButton, useColorModeValue } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

// Below this width the panel is a bottom sheet (Chakra's `sm` breakpoint)
export const SHEET_BELOW = 480
export const SHEET_HEIGHT = 0.85 // share of the screen the sheet covers
export const PANEL_WIDTH = { about: 440, posts: 640 }

const close = () => Router.push('/', undefined, { scroll: false })

// Slides over the room: in from the right on desktop, up from the bottom
// on phones. Page content always renders inside it (search engines read
// it), but it's inert while closed so it can't be tabbed into
const Panel = ({ open, width, resetKey, children }) => {
  const refPanel = useRef()
  const refClose = useRef()
  const bg = useColorModeValue('brand.cream', 'brand.surface')

  useEffect(() => {
    if (!open) return
    refClose.current?.focus({ preventScroll: true })
    const onKey = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // A new page starts at its top
  useEffect(() => {
    if (refPanel.current) refPanel.current.scrollTop = 0
  }, [resetKey])

  return (
    <Box
      ref={refPanel}
      role="dialog"
      aria-label="Page content"
      {...(!open && { inert: '', 'aria-hidden': true })}
      position="fixed"
      zIndex={2}
      bg={bg}
      boxShadow="dark-lg"
      overflowY="auto"
      overscrollBehavior="contain"
      left={[0, 'auto']}
      right={0}
      bottom={0}
      // Desktop: below the navbar, which keeps its theme toggle in reach
      top={['auto', '56px']}
      h={[`${SHEET_HEIGHT * 100}svh`, 'calc(100svh - 56px)']}
      w={['100%', `min(${width}px, 100vw)`]}
      borderTopRadius={['2xl', 'none']}
      px={[5, 8]}
      pt={[5, 6]}
      pb={10}
      transform={open ? 'none' : ['translateY(105%)', 'translateX(105%)']}
      visibility={open ? 'visible' : 'hidden'}
      transition="transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0.45s, width 0.45s ease"
    >
      <IconButton
        ref={refClose}
        aria-label="Close"
        icon={<CloseIcon boxSize={3} />}
        variant="ghost"
        onClick={close}
        position="absolute"
        top={4}
        right={4}
      />
      {children}
    </Box>
  )
}

export default Panel
