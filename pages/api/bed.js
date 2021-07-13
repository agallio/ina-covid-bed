import axios from 'axios'
import cheerio from 'cheerio'
import { parseUrl } from 'query-string'

import { provincesWithCities } from '@/utils/constants'
import { supabase } from '@/utils/supabase'

export default async function getBedAvailability(req, res) {
  if (req.method !== 'GET') {
    res
      .status(405)
      .json({ status: 405, data: null, error: 'Method not allowed.' })
    return
  }

  const {
    query: { prov, revalidate },
  } = req

  if (!prov) {
    res.status(400).json({
      status: 400,
      data: null,
      error: `Bad request. Add 'prov' query string with Indonesia provinces.`,
      province: provincesWithCities.map((pwc) => pwc.province.value),
    })
    return
  }

  if (revalidate && revalidate !== 'true' && revalidate !== 'false') {
    res.status(400).json({
      status: 400,
      data: null,
      error: `Bad request. The 'revalidate' value should only be either 'true' or 'false'`,
    })
    return
  }

  const provinceWithCity = provincesWithCities.find(
    (pwc) => pwc.province.value === prov
  )

  if (!provinceWithCity) {
    res.status(404).json({
      status: 404,
      data: null,
      error: `Not found. Can't find any province with name '${prov}'`,
    })
    return
  }

  const provKey = provinceWithCity.province.key
  const url = `http://yankes.kemkes.go.id/app/siranap/rumah_sakit?jenis=1&propinsi=${provKey}`

  const fetcher = async () => {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const hospitalDetail = []
    const bedAvailable = []
    const updatedAt = []
    const bedQueue = []
    const hotline = []
    const bedDetailLink = []

    $('div')
      .find('.col-md-5.text-right')
      .filter((i, el) => {
        const data = $(el)
        const getBedInfo = data
          .find(':nth-child(2)')
          .first()
          .text()
          .split(' ')
          .filter((i) => i !== '')
          .join(' ')
          .split('\n')[1]
          .trim()
          .split(' ')
        const getBedQueue = data
          .find(':nth-child(3)')
          .first()
          .text()
          .split(' ')
          .filter((i) => i !== '')
          .join(' ')
          .split('\n')[1]
          .trim()
          .split(' ')
        const getLastUpdatedAt = data
          .find(':nth-child(4)')
          .first()
          .text()
          .split(' ')
          .filter((i) => i !== '')
          .join(' ')
          .split('\n')[1]
          .trim()
          .split(' ')

        if (getBedInfo[0] === 'Bed') {
          bedAvailable.push(0)
        } else if (getBedInfo[0] === 'Tersedia') {
          bedAvailable.push(Number(getBedInfo[1]))
        }

        if (getBedQueue[0] === 'tanpa') {
          bedQueue.push(0)
        } else if (getBedQueue[0] === 'dengan') {
          bedQueue.push(Number(getBedQueue[2]))
        }

        if (getLastUpdatedAt[1] === 'kurang') {
          updatedAt.push(0)
        } else if (getLastUpdatedAt[2] === 'menit') {
          updatedAt.push(Number(getLastUpdatedAt[1]))
        } else if (getLastUpdatedAt[2] === 'jam') {
          updatedAt.push(Number(getLastUpdatedAt[1]) * 60)
        }
      })

    // Address
    $('div')
      .find('.col-md-7')
      .filter((i, el) => {
        const data = $(el)

        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')
            .join(' ')
            .split('\n')
        ) {
          const hospitalName = data.find('h5').first().text()
          const hospitalAddress = data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')
            .join(' ')
            .split('\n')[2]
            .trim()

          hospitalDetail.push({ name: hospitalName, address: hospitalAddress })
        }
      })

    // Hotline
    $('div')
      .find('.card-footer')
      .find('span')
      .filter((i, el) => {
        const data = $(el)
        const hotlineSelector = data.first().text()
        const hotlineSelectorSplitted = hotlineSelector.split('/')

        if (hotlineSelector.includes('tidak tersedia')) {
          hotline.push('')
        } else if (hotlineSelectorSplitted.length > 1) {
          hotline.push(hotlineSelectorSplitted.join(',').replace(/ /g, ''))
        } else {
          hotline.push(hotlineSelector.replace(/ /g, ''))
        }
      })

    $('div')
      .find('.card-footer')
      .find('a')
      .filter((i, el) => {
        const data = $(el)
        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')[0]
            .includes('http')
        ) {
          const href = data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')[0]
          const linkSplitted = href.split('\n')
          const newLink = linkSplitted[0].split('"')[0]
          const { query } = parseUrl(href)
          bedDetailLink.push({ link: newLink, hospital_code: query.kode_rs })
        }
      })

    // Don't delete this.
    // This will only logged to console if there's new data.
    console.log(`Fetched data at ${new Date().toISOString()}`)

    // const filteredAvailableBed = hospitalArray.filter(
    //   (hos) => hos.available_bed > 0
    // )

    const hospitalArray = hospitalDetail.map((hos, idx) => ({
      name: hos.name,
      address: hos.address,
      available_bed: Number(bedAvailable[idx]) || 0,
      bed_queue: bedQueue[idx],
      hotline: hotline[idx],
      bed_detail_link: bedDetailLink[idx].link,
      hospital_code: bedDetailLink[idx].hospital_code,
      updated_at_minutes: updatedAt[idx],
    }))

    if (hospitalArray.length === 0) {
      return data
    }

    const filteredAvailableBedWithLocation = hospitalArray.map((hos) => {
      const url = `http://yankes.kemkes.go.id/app/siranap/rumah_sakit/${hos.hospital_code}`
      return axios
        .get(url)
        .then((res) => ({
          ...hos,
          lat: res.data.data.alt,
          lon: res.data.data.long,
        }))
        .catch((e) => {
          console.log(e)
          res.status(500).json({
            status: 500,
            data: null,
            error: 'Internal server error. (filteredAvailableBedWithLocation)',
          })
        })
    })

    const newArr = await Promise.all(filteredAvailableBedWithLocation)

    return newArr
  }

  const { data, error } = await supabase
    .from('bed_cache')
    .select()
    .eq('key', prov)

  if (error) {
    res.status(500).json({
      status: 500,
      data: null,
      error: 'Supabase read error.',
      error_detail: error,
    })
    return
  }

  if (data.length === 0) {
    try {
      const newArr = await fetcher()

      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

      if (newArr.length === 0) {
        res.json({ status: 200, data: newArr, error: null, full_bed: true })
        return
      }

      const { error } = await supabase.from('bed_cache').insert([
        {
          key: prov,
          data: newArr,
          date: new Date().toISOString(),
        },
      ])

      if (error) {
        res.status(500).json({
          status: 500,
          data: null,
          error: 'Supabase insert error.',
          error_detail: error,
        })
        return
      }

      res.json({ status: 200, data: newArr, error: null })
      return
    } catch (e) {
      console.log(e)
      res
        .status(500)
        .json({ status: 500, data: null, error: 'Internal server error.' })
      return
    }
  }

  const timeDiffs = Math.abs(new Date() - new Date(data[0].date))
  const timeDiffsInMinute = Math.floor(timeDiffs / 1000 / 60)

  if (timeDiffsInMinute <= 10) {
    const newArr = data[0].data

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

    if (newArr.length === 0) {
      res.json({ status: 200, data: newArr, error: null, full_bed: true })
      return
    }

    res.json({ status: 200, data: newArr, error: null })
    return
  }

  try {
    const newArr = await fetcher()

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

    if (newArr.length === 0) {
      res.json({ status: 200, data: newArr, error: null, full_bed: true })
      return
    }

    const { error } = await supabase
      .from('bed_cache')
      .update({ data: newArr, date: new Date().toISOString() })
      .eq('key', prov)

    if (error) {
      res.status(500).json({
        status: 500,
        data: null,
        error: 'Supabase update error.',
        error_detail: error,
      })
      return
    }

    return res.json({ status: 200, data: newArr, error: null })
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ status: 500, data: null, error: 'Internal server error.' })
  }
}
