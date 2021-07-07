import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useHospitalDataByProvince(province) {
  const { data: apiResult } = useSWR(`/api/bed?prov=${province}`, fetcher)
  let hospitalList = null
  if (apiResult?.data) {
    hospitalList = apiResult.data
  }

  return hospitalList
}
