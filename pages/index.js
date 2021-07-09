import { useRouter } from 'next/router'
import { useState } from 'react'
import { Container, Flex } from '@chakra-ui/react'
import SearchProvince from '@/components/SearchProvince'
import { VStack, Box, Heading, Button } from '@chakra-ui/react'
import { getNearestProvince } from '@/utils/LocationHelper'

export default function Home() {
  const router = useRouter()
  const [isSearchingGeo, setSearchingGeo] = useState(false)

  function toMapPage() {
    router.push('/map')
  }

  function handleChooseProvince(province, geo) {
    let nextPage = `/${province.value}`

    if (geo) {
      nextPage += `?geo=${geo.lat},${geo.long}`
    }

    router.push(nextPage)
  }

  function handleSearchGeo() {
    setSearchingGeo(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const nearestProvince = getNearestProvince(latitude, longitude)
        handleChooseProvince(nearestProvince, {
          lat: latitude,
          long: longitude,
        })
      },
      (err) => {
        setSearchingGeo(false)
      }
    )
  }

  return (
    <Container>
      <Flex h="90vh" justify="center" align="center">
        <VStack w="100%" spacing="8">
          <Heading as="h1" fontSize="3xl" textAlign="center">
            Ketersediaan Tempat Tidur Rumah Sakit
          </Heading>
          <Box w="100%" position="relative">
            <Box w="full" textAlign="center" mb={4}>
              <Button w={['full', 'auto']} onClick={toMapPage}>
                Cari Menggunakan Peta
                <span
                  aria-label="Cari menggunakan peta"
                  style={{ marginLeft: 6 }}
                >
                  🗺
                </span>
              </Button>
            </Box>
            <SearchProvince
              onChooseProvince={handleChooseProvince}
              onSearchGeo={handleSearchGeo}
              disabled={isSearchingGeo}
            />
          </Box>
        </VStack>
      </Flex>
    </Container>
  )
}
