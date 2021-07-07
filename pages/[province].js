import React from 'react'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import {
  Container,
  Heading,
  Box,
  HStack,
  VStack,
  Text,
  Flex,
} from '@chakra-ui/react'
import { getProvinceDisplayName } from '../utils/ProvinceHelper'

function generateGoogleMapsLink(name) {
  return `https://www.google.com/maps/search/${name}`
}

function ProvincePage(props) {
  const { data, province } = props
  return (
    <Container py="10">
      <Text color="blue.500" fontSize="sm">
        <Link href="/">
          <a>‹ Ganti Provinsi</a>
        </Link>
      </Text>
      <VStack spacing="1" my="12">
        <Text>Ketersediaan tempat tidur rumah sakit</Text>
        <Heading m="4">{getProvinceDisplayName(province)}</Heading>
      </VStack>
      <VStack align="start" spacing="4">
        {data.map((hospital, idx) => {
          return (
            <Box
              w="100%"
              key={idx}
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
                    <Text color="blue.500" fontSize="sm">
                      <a href={`tel:${hospital.hotline}`}>{hospital.hotline}</a>
                    </Text>
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
              <Box
                mt="2"
                pt="2"
                borderTop="1px solid"
                borderTopColor="gray.300"
              >
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
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={hospital.bed_detail_link}
                    >
                      Detail
                    </a>
                  </Text>
                </HStack>
              </Box>
            </Box>
          )
        })}
      </VStack>
    </Container>
  )
}

ProvincePage.getInitialProps = async ({ query, req }) => {
  const { province } = query

  let origin
  if (req) {
    console.log('xxx', req.headers)
    const { referer } = req.headers
    origin = referer.replace(province, '')
  } else {
    origin = window.location.origin + '/'
  }

  const apiResult = await fetch(`${origin}api/bed?prov=${province}`)
  const json = await apiResult.json()
  return { data: json.data, province }
}

export default ProvincePage
