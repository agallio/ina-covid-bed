import axios from 'axios'
import cheerio from 'cheerio'
import { parseUrl } from 'query-string'

import { provincesWithCities } from '@/utils/constants'
import redis from '@/utils/RedisHelper'

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
    const hospitalNameArr = []
    const bedAvailable = []
    const address = []
    const updatedAt = []
    const bedQueue = []
    const hotline = []
    const bedDetailLink = []

    $('h5').filter((i, el) => {
      const data = $(el)
      hospitalNameArr.push(
        data
          .first()
          .text()
          .split(' ')
          .filter((i) => i !== '')
          .join(' ')
      )
    })

    $('b').filter((i, el) => {
      const data = $(el)
      bedAvailable.push(data.first().text())
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
          const addressData = data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')
            .join(' ')
            .split('\n')[2]
            .trim()

          address.push(addressData)
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
          const { query } = parseUrl(href)
          bedDetailLink.push({ link: href, hospital_code: query.kode_rs })
        }
      })

    $('p').filter((i, el) => {
      const data = $(el)

      // Updated At
      if (
        data
          .first()
          .text()
          .split(' ')
          .filter((i) => i !== '')
          .includes('diupdate')
      ) {
        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')
            .reverse()[5] === 'kurang'
        ) {
          updatedAt.push(0)
        }

        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')
            .reverse()[2] === 'menit'
        ) {
          updatedAt.push(
            Number(
              data
                .first()
                .text()
                .split(' ')
                .filter((i) => i !== '')
                .reverse()[3]
            )
          )
        }

        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')
            .reverse()[2] === 'jam'
        ) {
          updatedAt.push(
            Number(
              data
                .first()
                .text()
                .split(' ')
                .filter((i) => i !== '')
                .reverse()[3]
            ) * 60
          )
        }
      }

      // Bed Queue
      if (
        data
          .first()
          .text()
          .split(' ')
          .filter((i) => i !== '')
          .includes('antrian')
      ) {
        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')[1] === 'tanpa'
        ) {
          bedQueue.push(0)
        }

        if (
          data
            .first()
            .text()
            .split(' ')
            .filter((i) => i !== '')[1] === 'dengan'
        ) {
          bedQueue.push(
            Number(
              data
                .first()
                .text()
                .split(' ')
                .filter((i) => i !== '')[3]
            )
          )
        }
      }
    })

    hospitalNameArr.shift()

    // Don't delete this.
    // This will only logged to console if there's new data.
    console.log(`Fetched data at ${new Date().toISOString()}`)

    return hospitalNameArr.map((hos, idx) => ({
      name: hos,
      address: address[idx],
      available_bed: Number(bedAvailable[idx]) || 0,
      bed_queue: bedQueue[idx],
      hotline: hotline[idx],
      bed_detail_link: bedDetailLink[idx].link,
      hospital_code: bedDetailLink[idx].hospital_code,
      updated_at_minutes: updatedAt[idx],
    }))
  }

  try {
    const data = await redis.fetch(`bed:${prov}`, fetcher, 60 * 100, {
      revalidate: revalidate === 'true',
    })

    if (data.length === 0) {
      res.json({ status: 200, data, error: null })
      return
    }

    // const filteredAvailableBed = hospitalArray.filter(
    //   (hos) => hos.available_bed > 0
    // )

    const filteredAvailableBedWithLocation = data.map((hos) => {
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

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

    if (newArr.length === 0) {
      res.json({ status: 200, data: newArr, error: null, full_bed: true })
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
