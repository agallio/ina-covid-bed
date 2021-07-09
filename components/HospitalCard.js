import {
  Heading,
  Box,
  Button,
  VStack,
  Text,
  HStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { PhoneIcon } from '@chakra-ui/icons'

import { getRelativeLastUpdatedTime } from '@/utils/HospitalHelper'

function generateGoogleMapsLink(name) {
  return `https://www.google.com/maps/search/${name}`
}

export default function HospitalCard(props) {
  const { hospital, onClick, onLocationClick } = props

  const lastUpdatedTime = getRelativeLastUpdatedTime(
    hospital.updated_at_minutes
  )
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const bgAvailable = useColorModeValue('white', 'gray.800')
  const bgNotAvailable = useColorModeValue('red.100', 'red.700')
  const bgDistanceAvailable = useColorModeValue('gray.200', 'gray.600')
  const bgDistanceNotAvailable = useColorModeValue('red.200', 'red.600')

  const hotlineSplitted = hospital.hotline && hospital.hotline.split(',')

  return (
    <Box
      w="100%"
      border="1px solid"
      borderColor={hospital.available_bed > 0 ? 'gray.200' : 'red.400'}
      bgColor={hospital.available_bed > 0 ? bgAvailable : bgNotAvailable}
      borderRadius="md"
      shadow="md"
      p={4}
      onClick={onClick}
    >
      <HStack alignItems="start" spacing="2">
        <VStack align="start" spacing="1" flex="3">
          <Heading as="h2" size="sm">
            {hospital.name}
          </Heading>
          <Text fontSize="sm" color={isDarkMode ? 'gray.200' : 'gray.600'}>
            {hospital.address}
          </Text>
          <Text
            pt="2"
            fontSize="xs"
            color={isDarkMode ? 'gray.300' : 'gray.600'}
          >
            Diperbarui {lastUpdatedTime}
          </Text>
        </VStack>
        <VStack align="center" justify="center">
          {hospital.distance && (
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
                {hospital.distance.toFixed(2)} KM
              </Text>
            </Box>
          )}
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
            {hotlineSplitted.length > 1 ? (
              hotlineSplitted.map((item) => (
                <Button
                  key={item}
                  as="a"
                  w="full"
                  mb={[2, 0]}
                  mr={{ base: '2' }}
                  size="sm"
                  leftIcon={item.length ? <PhoneIcon /> : null}
                  colorScheme="blue"
                  disabled={!item || item.length < 8}
                  href={`tel:${item}`}
                >
                  {item}
                </Button>
              ))
            ) : (
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
            )}

            {typeof onLocationClick === 'function' ? (
              <Button
                w="full"
                mb={[2, 0]}
                mr={{ base: '2' }}
                size="sm"
                onClick={onLocationClick}
              >
                <span style={{ marginRight: 5 }} aria-label="peta">
                  📍
                </span>{' '}
                Lihat Lokasi
              </Button>
            ) : (
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
            )}
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
