import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Input,
  InputGroup,
  InputLeftElement,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import {
  Container,
  Heading,
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react'

import useHospitalDataByProvince from '@/hooks/useHospitalDataByProvince'
import { getProvinceDisplayName } from '@/utils/ProvinceHelper'
import { getNearestProvinces } from '@/utils/LocationHelper'
import HospitalCard from '@/components/HospitalCard'
import SEO from 'next-seo.config'
import debounce from 'lodash.debounce'
import { SearchIcon } from '@chakra-ui/icons'

function ProvincePage(props) {
  const { province } = props
  const [lat, lon] = (props.geo ?? '').split(',')
  const geo = props.geo ? { lat, lon } : null
  const { bedFull, hospitalList, slowLoading } = useHospitalDataByProvince(
    province,
    geo
  )
  const isShowAlternativeProvince = !!geo
  const [hospitals, setHospitals] = useState([])
  const [searchValue, setSearchValue] = useState('')

  const refreshHospitals = () => {
    setHospitals(hospitalList || [])
  }

  useEffect(() => {
    refreshHospitals()
  }, [hospitalList])

  useEffect(() => {
    if (searchValue) {
      setHospitals(
        hospitalList.filter(
          (hospital) =>
            hospital.name.toLowerCase().indexOf(searchValue.toLowerCase()) !==
            -1
        )
      )
      return
    }
    refreshHospitals()
  }, [searchValue])

  const handleSearchChange = debounce((e) => {
    setSearchValue(e.target.value)
  }, 750)

  let alternativeProvinces
  if (isShowAlternativeProvince) {
    alternativeProvinces = getNearestProvinces(lat, lon)
      .slice(0, 3)
      .filter((p) => p.value !== province)
  }

  const dynamicLinkColor = useColorModeValue('blue.600', 'blue.400')

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
        <Text color={dynamicLinkColor} fontSize="sm">
          <Link href="/" passHref>
            <ChakraLink>‹ Ganti Provinsi</ChakraLink>
          </Link>
        </Text>
        <VStack spacing="1" my="12">
          <Text>Ketersediaan tempat tidur rumah sakit</Text>
          <Heading m="4" textAlign="center">
            {getProvinceDisplayName(province)}
          </Heading>
          <br />
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              // eslint-disable-next-line react/no-children-prop
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              fontSize="lg"
              onChange={handleSearchChange}
              placeholder="Cari berdasarkan nama RS"
            />
          </InputGroup>
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
                <Text key={alternative.value} color={dynamicLinkColor}>
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
            hospitals.map((hospital, idx) => (
              <HospitalCard key={idx} hospital={hospital} />
            ))
          ) : (
            <Box w="100%" textAlign="center">
              <Spinner size="lg" />
              {slowLoading && (
                <Text p={4} mt={4}>
                  Pengambilan data Provinsi {getProvinceDisplayName(province)}{' '}
                  membutuhkan waktu lebih lama. Mohon tunggu.{' '}
                </Text>
              )}
            </Box>
          )}

          {!bedFull && hospitalList && hospitalList.length < 1 && (
            <Text textAlign="center" w="100%" p="24" color="gray.600">
              Tidak ditemukan data rumah sakit di provinsi ini
            </Text>
          )}
          {searchValue.length > 1 && hospitals && hospitals.length < 1 && (
            <Text textAlign="center" w="100%" p="24" color="gray.600">
              {`Pencarian rumah sakit dengan keyword "${searchValue}" tidak ditemukan.`}
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
