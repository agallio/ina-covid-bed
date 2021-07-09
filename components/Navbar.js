import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, IconButton, useColorMode } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const bgButton = isDarkMode ? 'gray.700' : 'gray.100'
  const router = useRouter()
  const isMapPage = router.pathname === '/map'
  return isMapPage ? null : (
    <Box pos="fixed" top={0} right={0} p={2} zIndex="modal">
      <IconButton
        borderRadius="md"
        bg={bgButton}
        _hover={{
          bg: bgButton,
        }}
        _active={{
          bg: bgButton,
        }}
        onClick={toggleColorMode}
        icon={isDarkMode ? <MoonIcon /> : <SunIcon />}
        aria-label="toggle color mode"
      />
    </Box>
  )
}

export default Navbar
