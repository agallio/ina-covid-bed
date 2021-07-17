import { provincesWithCities } from './constants'

export const provinceList = provincesWithCities.map((row) => ({
  value: row.province.value,
  name: row.province.name,
  alias: row.province.alias,
}))

/**
 * @param {string} province
 * @returns {string}
 */
export function getProvinceDisplayName(province) {
  const split = province.split('_')
  const capitalized = split.map((word) => {
    const capitalWord = word[0].toUpperCase() + word.slice(1)
    return capitalWord
  })
  return capitalized.join(' ')
}
