import { useState, useEffect } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
]

/**
 * Small desk-calendar badge showing the current month and day.
 * Date is set on the client so the static export never goes stale.
 */
const CalendarBadge = () => {
  const [date, setDate] = useState(null)
  const bodyBg = useColorModeValue('white', 'brand.surface')
  const dayColor = useColorModeValue('brand.tealDeep', 'brand.sand')

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDate(new Date()))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      textAlign="center"
      minW="56px"
      flexShrink={0}
      aria-label="Today's date"
    >
      <Box
        bg="brand.rust"
        color="white"
        fontSize="xs"
        fontWeight="bold"
        letterSpacing="wider"
        py={0.5}
      >
        {date ? MONTHS[date.getMonth()] : '···'}
      </Box>
      <Box
        bg={bodyBg}
        color={dayColor}
        fontSize="lg"
        fontWeight="bold"
        lineHeight="short"
        py={1}
      >
        {date ? date.getDate() : '–'}
      </Box>
    </Box>
  )
}

export default CalendarBadge
