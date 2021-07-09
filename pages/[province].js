import React from 'react'
import Link from 'next/link'
import { Link as ChakraLink } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import {
  Container,
  Heading,
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
} from '@chakra-ui/react'

import useHospitalDataByProvince from '@/hooks/useHospitalDataByProvince'
import { getProvinceDisplayName } from '@/utils/ProvinceHelper'
import { getNearestProvinces } from '@/utils/LocationHelper'
import HospitalCard from '@/components/HospitalCard'
import SEO from 'next-seo.config'

function ProvincePage(props) {
  const { province } = props
  const [lat, lon] = (props.geo ?? '').split(',')
  const geo = props.geo ? { lat, lon } : null
  const { bedFull, hospitalList } = useHospitalDataByProvince(province, geo)
  const isShowAlternativeProvince = !!geo

  let alternativeProvinces
  if (isShowAlternativeProvince) {
    alternativeProvinces = getNearestProvinces(lat, lon)
      .slice(0, 3)
      .filter((p) => p.value !== province)
  }

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
        <Text color="blue.600" fontSize="sm">
          <Link href="/" passHref>
            <ChakraLink>‹ Ganti Provinsi</ChakraLink>
          </Link>
        </Text>
        <VStack spacing="1" my="12">
          <Text>Ketersediaan tempat tidur rumah sakit</Text>
          <Heading m="4" textAlign="center">
            {getProvinceDisplayName(province)}
          </Heading>
          {isShowAlternativeProvince && (
            <HStack
              fontSize={['xs', 'sm']}
              w="100%"
              spacing="4"
              justify="center"
              color="gray.500"
            >
              <Text>Provinsi sekitar:</Text>
              {alternativeProvinces.map((alternative) => (
                <Text key={alternative.value} color="blue.600">
                  <Link
                    passHref
                    href={`/${alternative.value}?geo=${lat},${lon}`}
                  >
                    <ChakraLink>{alternative.name}</ChakraLink>
                  </Link>
                </Text>
              ))}
            </HStack>
          )}
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
