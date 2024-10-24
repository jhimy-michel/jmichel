import { Container, Heading, SimpleGrid, Divider } from '@chakra-ui/react'
import Section from '../components/section'
import { WorkGridItem } from '../components/grid-item'

//import thumbInkDrop from '../public/images/works/inkdrop_01.png'
import Layout from '../components/layouts/article'

const About = () => {
  return (
    <Layout>
      <Container>
        <Heading as="h3" fontSize={20} mb={40}>
          Works
        </Heading>
        <SimpleGrid columns={[1, 1, 2]} gap={6}>
          <Section>
            <WorkGridItem id="inkdrop" title="Inkdrop" /* tumbnail={thumbInkDrop} */>
              A markdown not-taking app
            </WorkGridItem>
          </Section>
          <Section>
            <WorkGridItem id="inkdrop" title="Inkdrop" /* tumbnail={thumbInkDrop} */>
              A markdown not-taking app
            </WorkGridItem>
          </Section>
          <Section>
            <Divider my={6} />
          </Section>
        </SimpleGrid>
      </Container>
    </Layout>
  )
}

export default About
