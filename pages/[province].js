import React from 'react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
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
import SEO from 'next-seo.config'

function ProvincePage(props) {
  const { province } = props
  const [lat, lon] = (props.geo ?? '').split(',')
  const geo = props.geo ? { lat, lon } : null
  const { bedFull, hospitalList } = useHospitalDataByProvince(province, geo)

  const isLoading = !Boolean(hospitalList)

  return (
    <>
      <NextSeo
        {...SEO({
          pageTitle: `${getProvinceDisplayName(
            province
          )} - Kasur IGD COVID-19 Tersedia`,
          pageDescription:
            'Daftar ketersediaan tempat tidur IGD di rumah sakit seluruh Indonesia.',
          pageURL: `https://bed.ina-covid.com/${province}`,
          images: [
            {
              url: 'http://bed.ina-covid.com/images/og-image-bed.png',
              width: 1000,
              height: 500,
              alt: 'ina-covid-bed-image',
            },
          ],
        })}
      />
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
