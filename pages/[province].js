import React, { useState } from 'react'
import Link from 'next/link'
import {
  Container,
  Heading,
  Box,
  HStack,
  VStack,
  Text,
  Flex,
  Spinner,
} from '@chakra-ui/react'
import useHospitalDataByProvince from '../hooks/useHospitalDataByProvince'
import { getProvinceDisplayName } from '../utils/ProvinceHelper'
import HospitalCard from '../components/HospitalCard'

function ProvincePage(props) {
  const { province } = props
  const hospitalList = useHospitalDataByProvince(province)

  const isLoading = !Boolean(hospitalList)
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
        {!isLoading ? (
          hospitalList.map((hospital, idx) => (
            <HospitalCard key={hospital.hospital_code} hospital={hospital} />
          ))
        ) : (
          <Box w="100%" textAlign="center">
            <Spinner size="lg" />
          </Box>
        )}

        {hospitalList && hospitalList.length < 1 && (
          <Text textAlign="center" w="100%" p="24" color="gray.600">
            Tidak ditemukan data rumah sakit di provinsi ini
          </Text>
        )}
      </VStack>
    </Container>
  )
}

ProvincePage.getInitialProps = async ({ query }) => {
  const { province } = query
  return { province }
}

export default ProvincePage
