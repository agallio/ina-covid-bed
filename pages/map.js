import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Container,
  Button,
  Spinner,
  useColorModeValue,
  LightMode,
} from '@chakra-ui/react'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-spring-bottom-sheet/dist/style.css'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { NextSeo } from 'next-seo'
import SEO from 'next-seo.config'
import { Box, VStack, HStack, Text } from '@chakra-ui/react'

import mapboxgl from '!mapbox-gl'

import HospitalCard from '@/components/HospitalCard'
import SearchProvince from '@/components/SearchProvince'
import useHospitalDataByProvince from '@/hooks/useHospitalDataByProvince'
import { provincesWithCities } from '@/utils/constants'
import { getNearestProvinces } from '@/utils/LocationHelper'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX

function MapPage(props) {
  const router = useRouter()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [lng] = useState(115.212631)
  const [lat] = useState(-8.670458)
  const [zoom] = useState(9)
  const [alternativeProvinces, setAlternativeProvinces] = useState([])
  const [province, setProvince] = useState({
    value: 'jakarta',
    label: 'Jakarta',
  })
  const [popupHospital, setPopupHospitalVisibility] = useState(false)
  const [_, setSearchingGeo] = useState(false)

  const [urlLat, urlLon] = (props.geo ?? '').split(',')
  const geo = props.geo ? { lat: urlLat, lon: urlLon } : null

  const { bedFull, hospitalList } = useHospitalDataByProvince(
    province.value,
    geo
  )

  const isLoading = !Boolean(hospitalList)

  const bgCard = useColorModeValue('white', 'gray.800')
  const textCard = useColorModeValue('black', 'white')

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
      updateMap()
    })
  })

  useEffect(() => {
    updateMap()
  }, [hospitalList])

  const handleChooseProvince = (province, type = 'auto') => {
    setProvince({ value: province.value, label: province.name })

    if (geo && type === 'auto') {
      const nearestProvinces = getNearestProvinces(geo.lat, geo.lon)
      setAlternativeProvinces(
        nearestProvinces.slice(0, 3).filter((p) => p.value !== province.value)
      )
    } else {
      setAlternativeProvinces([])
      router.push('/map')
    }
  }

  const handleSearchGeo = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setSearchingGeo(true)
        const nearestProvinces = getNearestProvinces(latitude, longitude)

        setProvince({
          label: nearestProvinces[0].name,
          value: nearestProvinces[0].value,
        })
        setAlternativeProvinces(nearestProvinces.slice(1, 3))

        map.current.flyTo({
          center: {
            lat: latitude,
            lng: longitude,
          },
          zoom: 12,
        })

        if (
          !map.current.getBounds().contains({ lat: latitude, lng: longitude })
        ) {
          new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map.current)
        }

        if (!geo) {
          router.push(`/map?geo=${latitude},${longitude}`)
        }
      },
      (err) => {
        setSearchingGeo(false)
      }
    )
  }

  const handleHospitalClick = (hospital) => {
    setPopupHospitalVisibility(false)
    map.current.flyTo({
      center: [parseFloat(hospital.lon), parseFloat(hospital.lat)],
      zoom: 12,
    })
  }

  const availableHospital = useMemo(
    () => hospitalList?.filter((hospital) => hospital.available_bed > 0) || [],
    [hospitalList]
  )

  const updateMap = () => {
    if (!availableHospital?.length || !map.current.isStyleLoaded()) return

    const geoAvailableInFirstRender =
      geo && !map.current.getBounds().contains({ lat: geo.lat, lng: geo.lon })

    map.current.flyTo({
      center: [
        parseFloat(
          geoAvailableInFirstRender ? geo.lon : availableHospital[0]?.lon
        ),
        parseFloat(
          geoAvailableInFirstRender ? geo.lat : availableHospital[0]?.lat
        ),
      ],
      zoom: 12,
    })

    const id = Math.random() * 100000000000

    const features = availableHospital.map((hospital) => ({
      type: 'Feature',
      properties: {
        description: `<strong>${hospital.name}</strong>
        <p>Tempat tidur tersedia: ${hospital.available_bed} | Antrian: ${
          hospital.bed_queue
        }</p>
        <p>Hotline: <a href="${
          hospital.hotline ? `tel:${hospital.hotline}` : '#'
        }" target="_blank" rel="noreferrer">${hospital.hotline}</a>
        | <a href="${
          hospital.bed_detail_link
        }" target="_blank" rel="noreferrer">Detail</a></p>
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

    if (geoAvailableInFirstRender) {
      const nearestProvinces = getNearestProvinces(geo.lat, geo.lon)
      setProvince({
        label: nearestProvinces[0].name,
        value: nearestProvinces[0].value,
      })
      setAlternativeProvinces(nearestProvinces.slice(1, 3))
      new mapboxgl.Marker().setLngLat([geo.lon, geo.lat]).addTo(map.current)
    }
  }

  return (
    <Box position="relative" color="black">
      <NextSeo
        {...SEO({
          pageTitle: `${province.label} - Peta Ketersediaan Tempat Tidur`,
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

      <Box
        position="relative"
        width="100vw"
        height="calc(100vh - 70px)"
        overflow="hidden"
      >
        <Box ref={mapContainer} height="100%" width="100%" />
        <Box
          position="absolute"
          backgroundColor={bgCard}
          padding="1rem"
          boxShadow="0 2px 8px 0 rgb(48 49 53 / 16%)"
          borderRadius="8px"
          top="1rem"
          left="1rem"
          right="1rem"
          width={{ md: '400px' }}
        >
          <SearchProvince
            onChooseProvince={(prov) => handleChooseProvince(prov, 'manual')}
            onSearchGeo={handleSearchGeo}
            disabled={isLoading}
            value={province.label}
          />

          {Boolean(alternativeProvinces.length) && (
            <HStack
              fontSize={['xs', 'sm']}
              mt="1rem"
              w="100%"
              spacing="4"
              color="gray.500"
            >
              <Text>Provinsi sekitar:</Text>
              {alternativeProvinces.map((alternative) => (
                <Text
                  key={alternative.value}
                  onClick={() => handleChooseProvince(alternative)}
                  color="blue.600"
                  cursor="pointer"
                >
                  {alternative.name}
                </Text>
              ))}
            </HStack>
          )}
        </Box>

        <Box
          position="absolute"
          bottom="2.5rem"
          left="1rem"
          right="1rem"
          borderRadius="8px"
          padding="1rem"
          boxShadow="0 2px 8px 0 rgb(48 49 53 / 16%)"
          bgColor={bgCard}
          w={{ sm: 'auto', md: '550px' }}
          display="flex"
          flexDir={['column', 'row']}
          alignItems="center"
          justifyContent={['center', 'space-between']}
        >
          {!isLoading && (
            <Box display="flex" color={textCard}>
              <Text>
                <b>{availableHospital.length}</b> rumah sakit tersedia dari{' '}
                <b>{hospitalList?.length}</b>
              </Text>
            </Box>
          )}
          <Button
            mt={!isLoading ? ['3', '0'] : undefined}
            w={isLoading ? 'full' : ['full', '60']}
            onClick={() => setPopupHospitalVisibility(true)}
            isLoading={isLoading}
            colorScheme="blue"
          >
            Lihat Daftar Rumah Sakit
          </Button>
        </Box>
      </Box>

      <BottomSheet
        open={popupHospital}
        onDismiss={() => setPopupHospitalVisibility(false)}
      >
        <LightMode>
          <Container px="10" color="black">
            <VStack align="start" spacing="4">
              {!isLoading ? (
                hospitalList.map((hospital, idx) => (
                  <HospitalCard
                    key={idx}
                    onLocationClick={() => handleHospitalClick(hospital)}
                    onClick={() => handleHospitalClick(hospital)}
                    hospital={hospital}
                  />
                ))
              ) : (
                <Box w="100%" textAlign="center">
                  <Spinner size="lg" />
                </Box>
              )}

              {!bedFull && hospitalList && hospitalList.length < 1 && (
                <Text textAlign="center" w="100%" p="24" color="gray.600">
                  Tidak ditemukan data rumah sakit di provinsi ini
                </Text>
              )}
              {bedFull && (
                <Text
                  fontSize="xl"
                  textAlign="center"
                  w="100%"
                  py="24"
                  color="gray.800"
                >
                  ⚠️ Semua rumah sakit di{' '}
                  <b>{getProvinceDisplayName(province)}</b> telah penuh! 😔
                </Text>
              )}
            </VStack>
          </Container>
        </LightMode>
      </BottomSheet>
    </Box>
  )
}

MapPage.getInitialProps = async ({ query }) => {
  const { geo } = query
  return { geo }
}

export const makeProvinceOptions = () => {
  return provincesWithCities.map((item) => ({
    value: item.province.value,
    label: item.province.name,
  }))
}

export default MapPage
