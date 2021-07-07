import { Heading, Box, HStack, VStack, Text, Flex } from '@chakra-ui/react'
import { PhoneIcon } from '@chakra-ui/icons'

function generateGoogleMapsLink(name) {
  return `https://www.google.com/maps/search/${name}`
}

export default function HospitalCard(props) {
  const { hospital } = props
  return (
    <Box
      w="100%"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      shadow="md"
      p="4"
    >
      <Flex alignItems="start" justifyContent="space-between">
        <VStack align="start" spacing="1" flex="3">
          <Heading as="h2" size="sm">
            {hospital.name}
          </Heading>
          <Text fontSize="sm" color="gray.600">
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
        </VStack>
        <VStack align="center" ml="4" flex="1" justify="center">
          <Text size="sm">Tersedia:</Text>
          <Text fontSize="xl" fontWeight="bold">
            {hospital.available_bed}
          </Text>
          <Text fontSize="sm" textAlign="center">
            {hospital.bed_queue
              ? `${hospital.bed_queue} antrian`
              : 'Tanpa antrian'}
          </Text>
        </VStack>
      </Flex>
      <Box mt="2" pt="2" borderTop="1px solid" borderTopColor="gray.300">
        <HStack spacing="8">
          <Text color="blue.500" fontSize="sm">
            <a
              target="_blank"
              rel="noreferrer"
              href={generateGoogleMapsLink(hospital.name)}
            >
              Lokasi
            </a>
          </Text>
          <Text color="blue.500" fontSize="sm">
            <a target="_blank" rel="noreferrer" href={hospital.bed_detail_link}>
              Detail
            </a>
          </Text>
        </HStack>
      </Box>
    </Box>
  )
}
