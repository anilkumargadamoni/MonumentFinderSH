<template>
  <div class="map-wrapper">
    <div
      id="map"
      class="map-canvas"
      aria-label="Interactive map showing nearby monuments"
      role="application"
    ></div>
  </div>
</template>

<script lang="ts">
import { fromLonLat, toLonLat } from 'ol/proj'
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'

import { createMap, updateUserMarker, enableKeyboardNavigation } from '@/map/mapCore'
import { processMonuments } from '@/map/monumentsProcessor'
import { drawRoute, removeRouteOverlay } from '@/map/routeService'

import { getMonuments } from '@/services/monumentsService'

import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

interface Monument {
  name: string
  lat: number
  lon: number
  distance: number
  wikipediaUrl?: string
}

export default defineComponent({
  name: 'MapView',
  emits: ['nearest-monuments'],

  setup(_, { emit }) {
    const nearestMonuments = ref<Monument[]>([])

    let map: any = null
    let routeLayer: any = null
    let userLat = 0
    let userLon = 0

    // ---------- ROUTE EVENT ----------
    function handleDrawRoute(e: CustomEvent) {
      const { lon, lat, name } = e.detail
      if (!map) return

      // Remove old route and overlay
      removeRouteOverlay(map)
      routeLayer = null

      drawRoute({ map, userLat, userLon, selectedName: name }, lon, lat).then((layer) => {
        routeLayer = layer
      })
    }

    // ---------- CENTER ON USER ----------
    function handleCenterOnUser() {
      if (!map) return
      map.getView().animate({
        center: fromLonLat([userLon, userLat]),
        zoom: 15,
        duration: 500,
      })
    }

    // ---------- CLICK MONUMENT TO ROUTE ----------
    function attachClickHandler() {
      map.on('click', (evt: any) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (f: any) => f, {
          hitTolerance: 6,
        }) as Feature | undefined

        if (feature && feature.get('name')) {
          const name = feature.get('name')
          const [lon, lat] = toLonLat((feature.getGeometry() as Point).getCoordinates())

          // Remove previous route and overlay
          removeRouteOverlay(map)
          routeLayer = null

          drawRoute({ map, userLat, userLon, selectedName: name }, lon, lat).then((layer) => {
            routeLayer = layer
          })
        }
      })
    }

    // ---------- MOUNT ----------
    onMounted(async () => {
      map = createMap('map')
      enableKeyboardNavigation(map)

      // Clean up ARIA attributes
      setTimeout(() => {
        const viewport = document.querySelector('.ol-viewport')
        if (viewport) {
          viewport.removeAttribute('aria-label')
          viewport.removeAttribute('role')
          viewport.removeAttribute('aria-hidden')
        }
      }, 300)

      document.addEventListener('draw-route', handleDrawRoute)
      document.addEventListener('center-on-user', handleCenterOnUser)

      // Get user location
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          userLat = pos.coords.latitude
          userLon = pos.coords.longitude

          // Center on user
          map.getView().animate({
            center: fromLonLat([userLon, userLat]),
            zoom: 15,
            duration: 500,
          })

          updateUserMarker(map, userLat, userLon)

          // Get and process monuments
          const geoData = await getMonuments(userLat, userLon)
          const processed = processMonuments(map, geoData, userLat, userLon)

          nearestMonuments.value = processed
          emit('nearest-monuments', processed)

          attachClickHandler()
        },
        async () => {
          // Fallback to Berlin
          userLat = 52.52
          userLon = 13.405

          map.getView().animate({
            center: fromLonLat([userLon, userLat]),
            zoom: 12,
            duration: 500,
          })

          updateUserMarker(map, userLat, userLon)

          const geoData = await getMonuments(userLat, userLon)
          const processed = processMonuments(map, geoData, userLat, userLon)

          nearestMonuments.value = processed
          emit('nearest-monuments', processed)

          attachClickHandler()
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })

    onUnmounted(() => {
      document.removeEventListener('draw-route', handleDrawRoute)
      document.removeEventListener('center-on-user', handleCenterOnUser)
      removeRouteOverlay(map)
      if (routeLayer) {
        map.removeLayer(routeLayer)
      }
      map?.dispose()
    })

    return { nearestMonuments }
  },
})
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}

.map-canvas {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}
</style>

<style>
.route-tooltip {
  position: absolute;
  background: rgba(255, 255, 255, 0.95) !important;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  pointer-events: none;
  z-index: 1000;
  color: #000 !important;
  max-width: 220px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  backdrop-filter: blur(2px);

  transition: opacity 0.2s ease;
  max-width: 200px;
  min-width: 120px;
}

.route-tooltip strong {
  color: #000 !important;
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
}

.route-tooltip div {
  color: #444 !important;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.route-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.95) transparent transparent;
}
</style>