import { useEffect, useState, useRef } from 'react'
import { Spinner } from '@chakra-ui/react'
import Head from 'next/head'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-spring-bottom-sheet/dist/style.css'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { NextSeo } from 'next-seo'
import SEO from 'next-seo.config'

import mapboxgl from '!mapbox-gl'
import styles from '@/styles/Map.module.css'

import useHospitalDataByProvince from '@/hooks/useHospitalDataByProvince'
import Select from 'react-select'
import { provincesWithCities } from '@/utils/constants'
import { getNearestProvince } from '@/utils/LocationHelper'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [lng] = useState(115.212631)
  const [lat] = useState(-8.670458)
  const [zoom] = useState(9)

  const [city, setCity] = useState({ value: 'jakarta', label: 'Jakarta' })
  const [myLocation, setMyLocation] = useState()
  const { hospitalList } = useHospitalDataByProvince(city.value)
  const isLoading = !Boolean(hospitalList)

  const [popupHospital, setPopupHospitalVisibility] = useState(false)
  const [isSearchingGeo, setSearchingGeo] = useState(false)

  useEffect(() => {
    if (map.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    })

    map.current.on('load', function () {
      map.current.resize()
    })
  })

  useEffect(() => {
    updateMap()
  }, [hospitalList])

  const handleSearchGeo = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setSearchingGeo(true)
        setMyLocation({
          lat: latitude,
          lng: longitude,
        })
        const nearestProvince = getNearestProvince(latitude, longitude)
        const province = provincesWithCities.find(
          (item) => item.province.value === nearestProvince
        )
        setCity({
          label: province.province.name,
          value: province.province.value,
        })
        map.current.flyTo({
          center: {
            lat: latitude,
            lng: longitude,
          },
          zoom: 12,
        })
      },
      (err) => {
        setSearchingGeo(false)
      }
    )
  }

  const updateMap = () => {
    if (!hospitalList?.length) return

    map.current.flyTo({
      center: [
        parseFloat(hospitalList[0]?.lon),
        parseFloat(hospitalList[0]?.lat),
      ],
      zoom: 12,
    })

    const id = Math.random() * 100000000000

    const features = hospitalList.map((hospital) => ({
      type: 'Feature',
      properties: {
        description: `<strong>${hospital.name}</strong>
        <p>Tempat tidur tersedia: ${hospital.available_bed} | Antrian: ${hospital.bed_queue}</p>
        <p>Hotline: ${hospital.hotline} | <a href="${hospital.bed_detail_link}" target="_blank">Detail</a></p>
        <p style="margin-top: .5rem">${hospital.address}</p>`,
        icon: 'hospital-15',
      },
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(hospital.lon), parseFloat(hospital.lat)],
      },
    }))
    map.current.addSource(`places-${id}`, {
      // This GeoJSON contains features that include an "icon"
      // property. The value of the "icon" property corresponds
      // to an image in the Mapbox Streets style's sprite.
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    })
    // Add a layer showing the places.
    map.current.addLayer({
      id: `places-${id}`,
      type: 'symbol',
      source: `places-${id}`,
      layout: {
        'icon-image': '{icon}',
        'icon-allow-overlap': true,
      },
    })

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.current.on('click', `places-${id}`, function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice()
      var description = e.features[0].properties.description

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map.current)
    })

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.current.on('mouseenter', `places-${id}`, function () {
      map.current.getCanvas().style.cursor = 'pointer'
    })

    // Change it back to a pointer when it leaves.
    map.current.on('mouseleave', `places-${id}`, function () {
      map.current.getCanvas().style.cursor = ''
    })
  }

  return (
    <div position="relative">
      <NextSeo
        {...SEO({
          pageTitle: `${city.label} - Peta Ketersediaan Tempat Tidur`,
          pageDescription:
            'Peta ketersediaan tempat tidur IGD di rumah sakit seluruh Indonesia.',
          pageURL: 'https://bed.ina-covid.com/map',
          images: [
            {
              url: 'http://bed.ina-covid.com/images/og-image-map.png',
              width: 1000,
              height: 500,
              alt: 'ina-covid-bed-image',
            },
          ],
        })}
      />
      <div className={styles.mapboxWrapper}>
        <div ref={mapContainer} className={styles.mapbox} />
        <div className={styles.floatingTopLeftContainer}>
          <Select
            placeholder="Pilih Provinsi"
            options={makeProvinceOptions()}
            value={city}
            onChange={(item) => {
              setCity(item)
            }}
          />
        </div>
        <div className={styles.floatingTopRightContainer}>
          <button className={styles.locationButton} onClick={handleSearchGeo}>
            📍
          </button>
        </div>

        <div className={styles.floatingContainer}>
          <p onClick={() => setPopupHospitalVisibility(true)}>
            Jumlah Rumah Sakit: {isLoading ? <Spinner /> : hospitalList?.length}{' '}
            <span style={{ color: '#F87A26', cursor: 'pointer' }}>
              (Daftar Rumah Sakit)
            </span>
          </p>
        </div>
      </div>

      <BottomSheet
        open={popupHospital}
        onDismiss={() => setPopupHospitalVisibility(false)}
      >
        <div style={{ padding: '1rem' }}>
          {hospitalList?.map((hospital) => (
            <div
              style={{
                padding: '.5rem 0',
                borderBottom: '1px solid #EAEAEA',
              }}
              key={hospital.name}
              onClick={() => {
                setPopupHospitalVisibility(false)
                map.current.flyTo({
                  center: [hospital.lon, hospital.lat],
                  zoom: 12,
                })
              }}
            >
              <p style={{ fontWeight: 'bold', marginBottom: '.5rem' }}>
                {hospital.name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p>Tempat tidur tersedia: {hospital.available_bed}</p>
                <p>
                  {hospital.bed_queue
                    ? `${hospital.bed_queue} antrian`
                    : 'Tanpa antrian'}
                </p>
              </div>
              <p>{hospital.address}</p>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}

export const makeProvinceOptions = () => {
  return provincesWithCities.map((item) => ({
    value: item.province.value,
    label: item.province.name,
  }))
}
