<template>
  <div class="map-wrapper">
    <div id="map" class="map-canvas"></div>

    <div id="hover-tooltip" class="hover-tooltip" ref="tooltipRef"></div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { fromLonLat, toLonLat } from 'ol/proj'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Stroke from 'ol/style/Stroke'
import axios from 'axios'
import { Overlay } from 'ol'
import { getMonuments } from '@/services/monumentsService'

let userLat = 0
let userLon = 0

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default {
  name: 'MapView',
  emits: ['nearest-monuments'],

  setup(_, { emit }) {
    const nearestMonuments = ref([])
    const tooltipRef = ref<HTMLElement | null>(null)
    let selectedMonumentName = ''
    let map: Map | null = null
    let tooltipOverlay: Overlay | null = null
    let userFeature: Feature | null = null
    let routeLayer: VectorLayer | null = null
    let monumentsLayer: VectorLayer | null = null

    async function drawRouteTo(lon: number, lat: number) {
  if (!map) return

  const drivingURL = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${lon},${lat}?overview=full&geometries=geojson`

  try {
    // Fetch driving route
    const res = await axios.get(drivingURL)
    if (!res.data.routes?.length) {
      alert('No route found!')
      return
    }

    const route = res.data.routes[0]
    const distanceKm = route.distance / 1000
    const timeMin = Math.round(route.duration / 60)

    const coords = route.geometry.coordinates
    const transformed = coords.map(([lo, la]: [number, number]) => fromLonLat([lo, la]))
    const routeGeometry = new LineString(transformed)
    const routeFeature = new Feature({ geometry: routeGeometry })

    // Remove previous route layer
    if (routeLayer && map) {
      map.removeLayer(routeLayer)
      routeLayer = null
    }

    routeLayer = new VectorLayer({
      source: new VectorSource({ features: [routeFeature] }),
      style: new Style({
        stroke: new Stroke({ color: '#ff3b30', width: 5 }),
      }),
    })

    map.addLayer(routeLayer)
    map.getView().fit(routeGeometry.getExtent(), { padding: [60, 60, 120, 60] })

    // Tooltip
    const tooltip = document.createElement('div')
    tooltip.className = 'hover-tooltip'
    tooltip.innerHTML = `
      <strong>${selectedMonumentName}</strong>
      <div style="font-size:12px;color:#000000;margin-top:4px">
        ${distanceKm.toFixed(2)} km, ${timeMin} min
      </div>
    `

    // Remove previous tooltip overlay
    if (window.routeTooltipOverlay) {
      map.removeOverlay(window.routeTooltipOverlay)
    }

    const midpoint = routeGeometry.getCoordinateAt(0.5)
    const overlay = new Overlay({
      element: tooltip,
      positioning: 'bottom-center',
      offset: [0, -10],
    })

    window.routeTooltipOverlay = overlay
    map.addOverlay(overlay)
    overlay.setPosition(midpoint)
    tooltip.style.display = 'block'

  } catch (err) {
    console.error(err)
    alert('Failed to fetch route!')
  }
}





    async function loadMonuments() {
      if (!map) return
      const monGeoJSON = await getMonuments(userLat, userLon)

      const features = new GeoJSON().readFeatures(monGeoJSON, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })

      features.forEach((f) => {
        const rawName = f.get('name') || f.get('properties')?.name || 'Unknown Monument'
        f.set('name', rawName)

        const [lon, lat] = toLonLat(f.getGeometry().getCoordinates())
        const d = haversineDistance(userLat, userLon, lat, lon)
        f.set('distanceKm', d)

        f.setStyle(
          new Style({
            image: new Icon({
              src: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              anchor: [0.5, 1],
            }),
          }),
        )
      })

      if (monumentsLayer && map) {
        map.removeLayer(monumentsLayer)
        monumentsLayer = null
      }

      monumentsLayer = new VectorLayer({ source: new VectorSource({ features }) })
      map.addLayer(monumentsLayer)

      const processed = features
        .map((f: any) => {
          const [lon, lat] = toLonLat(f.getGeometry().getCoordinates())
          return { name: f.get('name'), lat, lon, distance: f.get('distanceKm') }
        })
        .filter((m) => m.distance <= 10)
        .sort((a, b) => a.distance - b.distance)

      nearestMonuments.value = processed
      emit('nearest-monuments', processed)

      attachHoverHandler()
    }

    function attachHoverHandler() {
      if (!map || !tooltipRef.value) return

      if (!tooltipOverlay) {
        tooltipOverlay = new Overlay({
          element: tooltipRef.value,
          offset: [12, 0],
          positioning: 'center-left',
        })
        map.addOverlay(tooltipOverlay)
      }

      map.getViewport().style.cursor = ''

      map.on('pointermove', (evt) => {
        if (evt.dragging) {
          tooltipRef.value!.style.display = 'none'
          return
        }

        const feature = map!.forEachFeatureAtPixel(evt.pixel, (f) => f, { hitTolerance: 6 })

        if (feature && feature.get('name')) {
          const name = feature.get('name')
          const dist = (feature.get('distanceKm') || 0).toFixed(2)

          tooltipRef.value!.innerHTML = `<strong>${name}</strong><div style="font-size:12px;color:#d6d6d6;margin-top:4px">${dist} km</div>`
          tooltipRef.value!.style.display = 'block'
          tooltipOverlay!.setPosition(evt.coordinate)
          map!.getViewport().style.cursor = 'pointer'
        } else {
          tooltipRef.value!.style.display = 'none'
          map!.getViewport().style.cursor = ''
        }
      })
    }

    function updateUserMarker() {
      if (!map) return
      if (!userFeature) {
        userFeature = new Feature(new Point(fromLonLat([userLon, userLat])))
        userFeature.setStyle(
          new Style({
            image: new Icon({
              src: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              anchor: [0.5, 1],
            }),
          }),
        )

        const userLayer = new VectorLayer({ source: new VectorSource({ features: [userFeature] }) })
        map.addLayer(userLayer)
      } else {
        userFeature.getGeometry().setCoordinates(fromLonLat([userLon, userLat]))
      }
    }

    onMounted(() => {
      map = new Map({
        target: 'map',
        layers: [new TileLayer({ source: new OSM() })],
        view: new View({ center: fromLonLat([0, 0]), zoom: 12 }),
      })

      nextTick(() => {})

      // ➤ ADDED FOR TAP-TO-ROUTE
      map.on('click', (evt) => {
        const feature = map!.forEachFeatureAtPixel(evt.pixel, (f) => f, { hitTolerance: 6 })
        if (feature && feature.get('name')) {
            selectedMonumentName = feature.get('name')
          
          }

        if (feature && feature.get('name')) {
          const [lon, lat] = toLonLat(feature.getGeometry().getCoordinates())
          drawRouteTo(lon, lat)
        }
      })
      // ➤ END

      document.addEventListener('draw-route', (e: any) => {
        if (e?.detail?.lon !== undefined && e?.detail?.lat !== undefined) {
          drawRouteTo(e.detail.lon, e.detail.lat)
        }
      })

      document.addEventListener('center-on-user', () => {
        if (map) {
          map.getView().animate({
            center: fromLonLat([userLon, userLat]),
            zoom: 15,
            duration: 600,
          })
        }
      })

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            userLat = pos.coords.latitude
            userLon = pos.coords.longitude

            map!.getView().animate({ center: fromLonLat([userLon, userLat]), zoom: 15 })
            updateUserMarker()
            await loadMonuments()
          },
          async () => {
            userLat = 52.52
            userLon = 13.405
            map!.getView().setCenter(fromLonLat([userLon, userLat]))
            map!.getView().setZoom(12)
            updateUserMarker()
            await loadMonuments()
          },
        )
      } else {
        userLat = 52.52
        userLon = 13.405
        map.getView().setCenter(fromLonLat([userLon, userLat]))
        map.getView().setZoom(12)
        updateUserMarker()
        loadMonuments()
      }
    })

    return { nearestMonuments }
  },
}
</script>

<style>
/* unchanged styles */
.map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.map-canvas {
  width: 100%;
  height: 100%;
  max-width: 1100px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.hover-tooltip {
  position: absolute;
  background: rgba(255, 251, 251, 0.95);
  color: #040404;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.15;
  display: none;
  pointer-events: none;
  width: 100px;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.04);
}
</style>

