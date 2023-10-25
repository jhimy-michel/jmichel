import Head from 'next/head'
import { Box, Container } from '@chakra-ui/react'
import NavBar from '../navbar'
import VoxelDog from '../voxel-dog'

const Main = ({ children, router }) => {
  return (
    <Box as="main" pb={8}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <title>Jhimy Michel - Homepage</title>
      </Head>
      <NavBar path={router.asPath}></NavBar>
      <Container maxW={'container.md'} pt={14}>
        <VoxelDog />
        {children}
      </Container>
    </Box>
  )
}

export default Main
