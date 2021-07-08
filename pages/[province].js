import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {
  Container,
  Heading,
  Box,
  VStack,
  Text,
  Spinner,
} from '@chakra-ui/react'

import useHospitalDataByProvince from '@/hooks/useHospitalDataByProvince'
import { getProvinceDisplayName } from '@/utils/ProvinceHelper'
import HospitalCard from '@/components/HospitalCard'

function ProvincePage(props) {
  const { province } = props
  const [lat, lon] = (props.geo ?? '').split(',')
  const geo = props.geo ? { lat, lon } : null
  const { bedFull, hospitalList } = useHospitalDataByProvince(province, geo)

  const isLoading = !Boolean(hospitalList)

  return (
    <>
      <Head>
        <title>
          {getProvinceDisplayName(province)} Kasur IGD COVID-19 Tersedia |
          ina-covid-bed
        </title>
        <meta
          name="description"
          content={`${getProvinceDisplayName(
            province
          )} - Kasur IGD COVID-19 Tersedia | ina-covid-bed`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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

          {!bedFull && hospitalList && hospitalList.length < 1 && (
            <Text textAlign="center" w="100%" p="24" color="gray.600">
              Tidak ditemukan data rumah sakit di provinsi ini
            </Text>
          )}
          {bedFull && (
            <Text
              fontSize="xl"
              textAlign="center"
              w="100%"
              py="24"
              color="gray.800"
            >
              ⚠️ Semua rumah sakit di <b>{getProvinceDisplayName(province)}</b>{' '}
              telah penuh! 😔
            </Text>
          )}
        </VStack>
      </Container>
    </>
  )
}

ProvincePage.getInitialProps = async ({ query }) => {
  const { province, geo } = query
  return { province, geo }
}

export default ProvincePage
