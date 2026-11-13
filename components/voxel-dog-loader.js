/* eslint-disable react/display-name */
import { forwardRef } from 'react'
import { Box, Spinner } from '@chakra-ui/react'

export const DogSpinner = () => (
  <Spinner
    size="xl"
    position="absolute"
    left="50%"
    top="50%"
    ml="calc(0px - var(--spinner-size) / 2)"
    mt="calc(0px - var(--spinner-size))"
  />
)

// Fills its parent: the full-screen room behind every page
export const DogContainer = forwardRef(({ children }, ref) => (
  <Box ref={ref} className="voxel-dog" w="100%" h="100%" position="relative">
    {children}
  </Box>
))

const Loader = () => {
  return (
    <DogContainer>
      <DogSpinner />
    </DogContainer>
  )
}

export default Loader
