import { useColorModeValue } from '@chakra-ui/react'

/**
 * Tulip icon in the site's brand palette.
 * Petals: orange/rust. Stem & leaves: teal (lighter in dark mode).
 * @param {*} props
 * @returns
 */
const TulipIcon = (props) => {
  const stemColor = useColorModeValue('#257180', '#4FB0C0')

  return (
    <svg
      width="22px"
      height="22px"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      {...props}
    >
      {/* stem */}
      <path
        d="M32 32 L32 57"
        stroke={stemColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* left leaf */}
      <path
        d="M31 50 C25 50 19 46 17 38 C25 40 30 44 32 49 Z"
        fill={stemColor}
      />
      {/* right leaf */}
      <path
        d="M33 54 C38 53 43 50 45 43 C38 45 34 48 32 53 Z"
        fill={stemColor}
      />
      {/* left petal */}
      <path
        d="M18 10 C15 22 21 32 32 33 C28 26 26 16 26 11 C23 8 20 8 18 10 Z"
        fill="#CB6040"
      />
      {/* right petal */}
      <path
        d="M46 10 C49 22 43 32 32 33 C36 26 38 16 38 11 C41 8 44 8 46 10 Z"
        fill="#CB6040"
      />
      {/* center petal */}
      <path
        d="M32 6 C26 10 23 19 25 26 C27 31 29 33 32 33 C35 33 37 31 39 26 C41 19 38 10 32 6 Z"
        fill="#FD8B51"
      />
    </svg>
  )
}

export default TulipIcon
