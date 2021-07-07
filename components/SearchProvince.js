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
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { provinceList } from '../utils/ProvinceHelper'

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
      const filteredProvince = provinceList
        .filter((province) =>
          province.value.toLowerCase().includes(inputValue.toLowerCase())
        )
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
            isDisabled={provinceList.length < 1}
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
