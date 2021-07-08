import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, IconButton, useColorMode } from '@chakra-ui/react'

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Box pos="fixed" top={0} right={0} p={2}>
      <IconButton
        onClick={toggleColorMode}
        icon={colorMode === 'light' ? <SunIcon /> : <MoonIcon />}
      />
    </Box>
  )
}

export default Navbar
