import { Container, Flex } from '@chakra-ui/react'
import SearchProvince from '@/components/SearchProvince'

export default function Home() {
  return (
    <Container>
      <Flex h="90vh" justify="center" align="center">
        <SearchProvince />
      </Flex>
    </Container>
  )
}
