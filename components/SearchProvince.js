import React, { useState } from 'react'
import { useRouter } from 'next/router'
import {
  VStack,
  Box,
  Input,
  List,
  ListItem,
  Heading,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { provinceList } from '../utils/ProvinceHelper'
import { getNearestProvince } from '../utils/LocationHelper'

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
      {province.name}
    </ListItem>
  )
}

function SearchProvince() {
  const [inputProvince, setInputProvince] = useState('')
  const [isSearchingGeo, setSearchingGeo] = useState(false)
  const [filterResult, setFilterResult] = useState([])
  const router = useRouter()

  function handleChooseProvince(value, geo) {
    let nextPage = `/${value}`

    if (geo) {
      nextPage += `?geo=${geo.lat},${geo.long}`
    }

    router.push(nextPage)
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
      const filteredProvince = provinceList
        .filter((province) =>
          province.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 5)
      setFilterResult(filteredProvince)
    } else {
      setFilterResult([])
    }

    setInputProvince(inputValue)
  }

  function handleSearchGeo() {
    setSearchingGeo(true)
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      const nearestProvince = getNearestProvince(latitude, longitude)
      handleChooseProvince(nearestProvince, { lat: latitude, long: longitude })
    })
  }

  return (
    <VStack w="100%" spacing="8">
      <Heading as="h1" fontSize="3xl" textAlign="center">
        Ketersediaan Tempat Tidur Rumah Sakit
      </Heading>
      <Box w="100%" position="relative">
        <HStack spacing="2">
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              // eslint-disable-next-line react/no-children-prop
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              fontSize="lg"
              isDisabled={provinceList.length < 1 || isSearchingGeo}
              placeholder="Masukkan nama provinsi"
              value={inputProvince}
              onKeyPress={handleKeyPress}
              onChange={handleOnChange}
            />
          </InputGroup>
          <Button
            disabled={isSearchingGeo}
            onClick={handleSearchGeo}
            aria-label="Cari provinsi terdekat"
          >
            📍
          </Button>
        </HStack>

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
