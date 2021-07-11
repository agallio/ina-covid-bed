import styles from '@/styles/Home.module.css'
import { Text, useColorModeValue } from '@chakra-ui/react'

export default function Footer() {
  const dynamicLinkColor = useColorModeValue('blue.600', 'blue.400')

  return (
    <footer className={styles.footer}>
      <Text color={dynamicLinkColor} fontSize="sm">
        <a
          href="https://github.com/agallio/ina-covid-bed"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github Repository
        </a>
      </Text>
    </footer>
  )
}
