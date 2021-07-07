import React from 'react'
import useSWR from 'swr'
import { getProvinceDisplayName } from '../utils/ProvinceHelper'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function useProvinceList() {
  const { data: apiResult } = useSWR('/api/bed', fetcher)
  let provinceList = []
  if (apiResult?.province) {
    provinceList = apiResult.province.map((p) => ({
      value: p,
      displayName: getProvinceDisplayName(p),
    }))
  }

  return provinceList
}
