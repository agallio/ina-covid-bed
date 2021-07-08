import Head from 'next/head'
import { Container, Flex } from '@chakra-ui/react'

import SearchProvince from '@/components/SearchProvince'

export default function Home() {
  return (
    <Container>
      <Head>
        <title>Kasur IGD COVID-19 Tersedia | ina-covid-bed</title>
        <meta
          name="description"
          content="Kasur IGD COVID-19 Tersedia | ina-covid-bed"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex h="90vh" justify="center" align="center">
        <SearchProvince />
      </Flex>
    </Container>
  )
}
