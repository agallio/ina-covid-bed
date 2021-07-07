import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useHospitalDataByProvince(province) {
  const { data: apiResult } = useSWR(`/api/bed?prov=${province}`, fetcher)
  let hospitalList = null
  let bedFull = false

  if (apiResult?.full_bed) {
    bedFull = true
  }

  if (apiResult?.data) {
    hospitalList = apiResult.data
  }

  return { bedFull, hospitalList }
}
