import {
  Button,
  Heading,
  Box,
  HStack,
  VStack,
  Text,
  Flex,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { PhoneIcon } from '@chakra-ui/icons'

import { getRelativeLastUpdatedTime } from '@/utils/HospitalHelper'

function generateGoogleMapsLink(name) {
  return `https://www.google.com/maps/search/${name}`
}

export default function HospitalCard(props) {
  const { hospital } = props
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const lastUpdatedTime = getRelativeLastUpdatedTime(
    hospital.updated_at_minutes
  )
  const bgAvailable = useColorModeValue('white', 'gray.800')
  const bgNotAvailable = useColorModeValue('red.100', 'red.700')
  const bgDistanceAvailable = useColorModeValue('gray.200', 'gray.600')
  const bgDistanceNotAvailable = useColorModeValue('red.200', 'red.600')
  return (
    <Box
      w="100%"
      border="1px solid"
      borderColor={hospital.available_bed > 0 ? 'gray.200' : 'red.400'}
      bgColor={hospital.available_bed > 0 ? bgAvailable : bgNotAvailable}
      borderRadius="md"
      shadow="md"
      p={4}
    >
      <HStack alignItems="start" spacing="2">
        <VStack align="start" spacing="1" flex="3">
          <Heading as="h2" size="sm">
            {hospital.name}
          </Heading>
          <Text fontSize="sm" color={isDarkMode ? 'gray.200' : 'gray.600'}>
            {hospital.address}
          </Text>
          {hospital.hotline && (
            <HStack spacing="2">
              <PhoneIcon color="blue.500" />
              <Text color="blue.500" fontSize="sm">
                <a href={`tel:${hospital.hotline}`}>{hospital.hotline}</a>
              </Text>
            </HStack>
          )}
          <Text
            pt="2"
            fontSize="xs"
            color={isDarkMode ? 'gray.300' : 'gray.600'}
          >
            Diperbarui {lastUpdatedTime}
          </Text>
        </VStack>
        <VStack align="center" justify="center">
          <Box
            w={['24', '28']}
            p={2}
            textAlign="center"
            bgColor={
              hospital.available_bed > 0
                ? bgDistanceAvailable
                : bgDistanceNotAvailable
            }
            borderRadius="md"
          >
            <Text fontSize={['sm', 'md']} fontWeight="bold">
              {hospital.distance?.toFixed(2)} KM
            </Text>
          </Box>
          {hospital.available_bed > 0 ? (
            <>
              <Text size="sm">Tersedia:</Text>
              <Text fontSize="xl" fontWeight="bold">
                {hospital.available_bed}
              </Text>
              <Text fontSize="sm" textAlign="center">
                {hospital.bed_queue
                  ? `${hospital.bed_queue} antrian`
                  : 'Tanpa antrian'}
              </Text>
            </>
          ) : (
            <Text fontWeight="bold">Penuh!</Text>
          )}
        </VStack>
      </HStack>

      {hospital.available_bed > 0 && (
        <Box mt="4" pt="4" borderTop="1px solid" borderTopColor="gray.300">
          <Box display="flex" flexDirection={['column', 'row']}>
            <Button
              as="a"
              w="full"
              mb={[2, 0]}
              mr={{ base: '2' }}
              size="sm"
              leftIcon={hospital.hotline ? <PhoneIcon /> : null}
              colorScheme="blue"
              disabled={!hospital.hotline || hospital.hotline.length < 8}
              href={`tel:${hospital.hotline}`}
            >
              {!hospital.hotline || hospital.hotline.length < 8
                ? 'Hotline tidak tersedia'
                : hospital.hotline}
            </Button>

            <Button
              w="full"
              as="a"
              mb={[2, 0]}
              mr={{ base: '2' }}
              target="_blank"
              rel="noreferrer"
              size="sm"
              href={generateGoogleMapsLink(hospital.name)}
            >
              <span style={{ marginRight: 5 }} aria-label="peta">
                📍
              </span>{' '}
              Lihat Lokasi
            </Button>

            <Button
              w="full"
              as="a"
              target="_blank"
              rel="noreferrer"
              size="sm"
              href={hospital.bed_detail_link}
            >
              <span style={{ marginRight: 5 }} aria-label="kasur">
                🛏
              </span>{' '}
              Lihat Detail Kasur
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
