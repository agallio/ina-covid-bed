import styles from '@/styles/Home.module.css'
import { Text } from '@chakra-ui/react'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Text color="blue.500" fontSize="sm">
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
