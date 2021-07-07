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

export function getProvinceDisplayName(province) {
  const split = province.split('_')
  const capitalized = split.map((word) => {
    const capitalWord = word[0].toUpperCase() + word.slice(1)
    return capitalWord
  })
  return capitalized.join(' ')
}
