import React, { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Text,
  VStack,
  Box,
  Input,
  List,
  ListItem,
  Heading,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { getProvinceDisplayName } from '../utils/ProvinceHelper'

const PROVINCE = [
  'aceh',
  'sumatera_utara',
  'sumatera_barat',
  'riau',
  'jambi',
  'sumatera_selatan',
  'bengkulu',
  'lampung',
  'kepulauan_bangka_belitung',
  'kepulauan_riau',
  'jakarta',
  'jawa_barat',
  'jawa_tengah',
  'yogyakarta',
  'jawa_timur',
  'banten',
  'bali',
  'nusa_tenggara_barat',
  'nusa_tenggara_timur',
  'kalimantan_barat',
  'kalimantan_tengah',
  'kalimantan_selatan',
  'kalimantan_timur',
  'kalimantan_utara',
  'sulawesi_utara',
  'sulawesi_tengah',
  'sulawesi_selatan',
  'sulawesi_tenggara',
  'gorontalo',
  'sulawesi_barat',
  'maluku',
  'maluku_utara',
  'papua_barat',
  'papua',
]

const displayProvince = PROVINCE.map((p) => {
  const displayName = getProvinceDisplayName(p)
  return {
    value: p,
    displayName,
  }
})

function ProvinceItem(props) {
  const { province, onClick } = props

  function handleClickItem() {
    onClick(province.value)
  }

  return (
    <ListItem
      p="4"
      onClick={handleClickItem}
      cursor="pointer"
      borderBottom="1px solid"
      borderColor="gray.200"
      _hover={{
        background: 'green.50',
      }}
      _last={{ borderColor: 'transparent' }}
    >
      {province.displayName}
    </ListItem>
  )
}

function SearchProvince() {
  const [inputProvince, setInputProvince] = useState('')
  const [filterResult, setFilterResult] = useState([])
  const router = useRouter()

  function handleChooseProvince(value) {
    router.push(`/${value}`)
  }

  function handleKeyPress(e) {
    if (e.code === 'Enter' && filterResult.length > 0) {
      const selectedProvince = filterResult[0]
      handleChooseProvince(selectedProvince.value)
    }
  }

  function handleOnChange(e) {
    const inputValue = e.target.value
    if (inputValue) {
      const filteredProvince = displayProvince
        .filter((province) => province.value.includes(inputValue.toLowerCase()))
        .slice(0, 5)
      setFilterResult(filteredProvince)
    } else {
      setFilterResult([])
    }

    setInputProvince(inputValue)
  }

  return (
    <VStack w="100%" spacing="8">
      <Heading as="h1" fontSize="3xl" textAlign="center">
        Ketersediaan Tempat Tidur Rumah Sakit
      </Heading>
      <Box w="100%" position="relative">
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            // eslint-disable-next-line react/no-children-prop
            children={<SearchIcon color="gray.300" />}
          />
          <Input
            fontSize="lg"
            placeholder="Masukkan nama provinsi"
            value={inputProvince}
            onKeyPress={handleKeyPress}
            onChange={handleOnChange}
          />
        </InputGroup>

        <Box
          w="100%"
          borderRadius="md"
          background="white"
          shadow="lg"
          position="absolute"
          left="0"
          mt="2"
          overflow="hidden"
        >
          {filterResult.length > 0 && (
            <List>
              {filterResult.map((province) => (
                <ProvinceItem
                  key={province.value}
                  province={province}
                  onClick={handleChooseProvince}
                />
              ))}
            </List>
          )}
        </Box>
      </Box>
    </VStack>
  )
}

export default SearchProvince
