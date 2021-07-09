import React, { useState, useEffect } from 'react'
import {
  Box,
  Input,
  List,
  ListItem,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

import { provinceList } from '@/utils/ProvinceHelper'

function ProvinceItem(props) {
  const { province, onClick } = props
  function handleClickItem() {
    onClick(province)
  }

  return (
    <ListItem
      p="4"
      onClick={handleClickItem}
      cursor="pointer"
      borderBottom="1px solid"
      background={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.500', 'gray.300')}
      color={useColorModeValue('black', 'white')}
      _hover={{
        background: useColorModeValue('green.50', 'blue.800'),
      }}
      _last={{ borderColor: 'transparent' }}
    >
      {province.name}
    </ListItem>
  )
}

function SearchProvince({ onChooseProvince, onSearchGeo, disabled, value }) {
  const [inputFocus, setInputFocus] = useState(false)
  const [inputProvince, setInputProvince] = useState('')
  const [filterResult, setFilterResult] = useState([])

  const dynamicInputColor = useColorModeValue('gray.300', 'white')

  function handleKeyPress(e) {
    if (e.code === 'Enter' && filterResult.length > 0) {
      const selectedProvince = filterResult[0]
      onChooseProvince(selectedProvince)
      setInputFocus(false)
    }
  }

  function handleOnChange(e) {
    const inputValue = e.target.value
    if (inputValue) {
      setInputFocus(true)
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

  useEffect(() => {
    if (value) {
      setInputProvince(value)
    }
  }, [value])

  return (
    <Box onBlur={() => setTimeout(() => setInputFocus(false), 100)}>
      <HStack spacing="2">
        <InputGroup onFocus={() => setInputFocus(true)}>
          <InputLeftElement
            pointerEvents="none"
            // eslint-disable-next-line react/no-children-prop
            children={<SearchIcon color="gray.300" />}
          />
          <Input
            fontSize="lg"
            isDisabled={provinceList.length < 1 || disabled}
            placeholder="Masukkan nama provinsi"
            value={inputProvince}
            onKeyPress={handleKeyPress}
            onChange={handleOnChange}
            color={dynamicInputColor}
          />
        </InputGroup>
        <Button
          disabled={disabled}
          onClick={onSearchGeo}
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
        {filterResult.length > 0 && inputFocus && (
          <List>
            {filterResult.map((province) => (
              <ProvinceItem
                key={province.value}
                province={province}
                onClick={onChooseProvince}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}

export default SearchProvince
