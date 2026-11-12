import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

// "Night window" palette: ink-navy night sky, fairy-light amber, warm coral.
// Token names are historical; the comments describe each role.
const colors = {
  brand: {
    teal: '#2F4A7A', // Light mode primary: links, underlines - ink blue
    sand: '#F4E9D8', // Dark mode headings - warm moonlight
    orange: '#F2B05E', // Dark mode primary: links, accents - fairy-light amber
    rust: '#E07B53', // Hover / secondary accent - warm coral
    cream: '#F4F1EC', // Light mode background - soft fog
    tealDeep: '#1B2540', // Light mode headings - deep ink
    night: '#11161F', // Dark mode background - night sky
    surface: '#1A2231', // Dark mode cards/boxes
    surfaceHover: '#222C3E' // Dark mode card hover
  }
}

const styles = {
  global: (props) => ({
    body: {
      bg: mode(colors.brand.cream, colors.brand.night)(props),
      color: mode('#2A2F3A', '#D8DCE6')(props),
      transition: 'background-color 0.2s ease-in-out'
    }
  })
}

const components = {
  Heading: {
    baseStyle: (props) => ({
      color: mode(colors.brand.tealDeep, colors.brand.sand)(props)
    }),
    variants: {
      'section-title': (props) => ({
        textDecoration: 'underline',
        fontSize: 20,
        textUnderlineOffset: 6,
        textDecorationColor: mode(
          colors.brand.teal,
          colors.brand.orange
        )(props),
        textDecorationThickness: 4,
        marginTop: 3,
        marginBottom: 4,
        transition: 'all 0.3s ease-in-out',
        _hover: {
          textDecorationColor: mode(
            colors.brand.rust,
            colors.brand.orange
          )(props)
        }
      }),
      'page-title': (props) => ({
        fontSize: ['2xl', '3xl', '4xl'],
        fontWeight: 'bold',
        lineHeight: 1.2,
        letterSpacing: 'tight',
        bgGradient: mode(
          'linear(to-r, brand.tealDeep, brand.teal)',
          'linear(to-r, brand.orange, brand.rust)'
        )(props),
        bgClip: 'text'
      })
    }
  },
  Link: {
    baseStyle: (props) => ({
      color: mode(colors.brand.teal, colors.brand.orange)(props),
      textUnderlineOffset: 3,
      transition: 'all 0.3s ease-in-out',
      _hover: {
        textDecoration: 'none',
        color: mode(colors.brand.rust, colors.brand.sand)(props)
      }
    })
  },
  Button: {
    variants: {
      glass: (props) => ({
        bg: mode('whiteAlpha.500', 'whiteAlpha.100')(props),
        backdropFilter: 'blur(10px)',
        borderRadius: 'lg',
        padding: '6',
        _hover: {
          bg: mode('whiteAlpha.600', 'whiteAlpha.200')(props)
        }
      }),
      primary: (props) => ({
        bg: mode(colors.brand.teal, colors.brand.orange)(props),
        color: 'white',
        _hover: {
          bg: mode(colors.brand.rust, colors.brand.rust)(props),
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        }
      }),
      outline: (props) => ({
        border: '2px solid',
        borderColor: mode(colors.brand.teal, colors.brand.orange)(props),
        color: mode(colors.brand.teal, colors.brand.orange)(props),
        _hover: {
          bg: mode(`${colors.brand.teal}20`, `${colors.brand.orange}20`)(props)
        }
      })
    }
  },
  Card: {
    baseStyle: (props) => ({
      bg: mode('whiteAlpha.900', 'whiteAlpha.100')(props),
      borderRadius: 'lg',
      padding: 6,
      border: '1px solid',
      borderColor: mode(
        `${colors.brand.teal}30`,
        `${colors.brand.orange}30`
      )(props),
      boxShadow: mode(
        '0 4px 6px rgba(37, 113, 128, 0.1)',
        '0 4px 6px rgba(253, 139, 81, 0.1)'
      )(props),
      transition: 'all 0.3s ease-in-out',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: mode(
          '0 6px 8px rgba(37, 113, 128, 0.15)',
          '0 6px 8px rgba(253, 139, 81, 0.15)'
        )(props),
        borderColor: mode(
          `${colors.brand.teal}50`,
          `${colors.brand.orange}50`
        )(props)
      }
    })
  }
}

const fonts = {
  heading: "'M PLUS Rounded 1c'",
  body: "'M PLUS Rounded 1c'"
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: true
}

const theme = extendTheme({
  config,
  styles,
  components,
  colors,
  fonts
})

export default theme
