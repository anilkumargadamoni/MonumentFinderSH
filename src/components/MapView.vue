<template>
  <div class="map-wrapper">
    <div id="map" class="map-canvas"></div>

    <div class="map-controls">
      <button
        @click="centerOnUser"
        class="control-btn location-btn"
        aria-label="Center on my location"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" />
          <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="2" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2" />
          <line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="2" />
          <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
      <div class="zoom-controls">
        <button @click="zoomIn" class="control-btn" aria-label="Zoom in">+</button>
        <button @click="zoomOut" class="control-btn" aria-label="Zoom out">−</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { fromLonLat, toLonLat } from 'ol/proj'
import Map from 'ol/Map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { MapBrowserEvent } from 'ol'
import { createMap, updateUserMarker, enableKeyboardNavigation } from '@/map/mapCore'
import { processMonuments } from '@/map/monumentsProcessor'
import { drawRoute, removeRouteOverlay } from '@/map/routeService'
import { getMonuments } from '@/services/monumentsService'

interface RouteEventDetail {
  lon: number
  lat: number
  name: string
}

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
    let map: Map | null = null
    let userLat = 0,
      userLon = 0

    const centerOnUser = () => {
      if (!map) return
      if (userLat && userLon) {
        map.getView().animate({ center: fromLonLat([userLon, userLat]), zoom: 15, duration: 500 })
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            userLat = pos.coords.latitude
            userLon = pos.coords.longitude
            map!
              .getView()
              .animate({ center: fromLonLat([userLon, userLat]), zoom: 15, duration: 500 })
            updateUserMarker(map!, userLat, userLon)
          },
          () =>
            userLat &&
            userLon &&
            map!
              .getView()
              .animate({ center: fromLonLat([userLon, userLat]), zoom: 15, duration: 500 }),
          { enableHighAccuracy: true, timeout: 5000 },
        )
      }
    }

    const zoomIn = () =>
      map?.getView().animate({ zoom: (map.getView().getZoom() || 12) + 1, duration: 200 })
    const zoomOut = () =>
      map?.getView().animate({ zoom: (map.getView().getZoom() || 12) - 1, duration: 200 })

    const handleDrawRoute = (e: Event) => {
      if (!map) return
      const { lon, lat, name } = (e as CustomEvent<RouteEventDetail>).detail
      removeRouteOverlay(map)
      drawRoute({ map, userLat, userLon, selectedName: name }, lon, lat)
    }

    const handleCenterOnUser = centerOnUser

    onMounted(async () => {
      map = createMap('map')
      enableKeyboardNavigation(map)
      setTimeout(() => {
        const viewport = document.querySelector('.ol-viewport')
        if (viewport) {
          viewport.removeAttribute('role')
          viewport.removeAttribute('aria-label')
          viewport.removeAttribute('aria-hidden')
        }

        document.querySelectorAll('.ol-control, .ol-overlaycontainer, .ol-zoom').forEach((el) => {
          el.removeAttribute('role')
          el.removeAttribute('aria-label')
          el.removeAttribute('aria-hidden')
        })
      }, 300)

      setTimeout(() => {
        const viewport = document.querySelector('.ol-viewport')
        if (viewport) {
          viewport.removeAttribute('aria-label')
          viewport.removeAttribute('role')
          viewport.removeAttribute('aria-hidden')
        }
      }, 300)

      document.addEventListener('draw-route', handleDrawRoute as EventListener)
      document.addEventListener('center-on-user', handleCenterOnUser as EventListener)

      const success = async (pos: GeolocationPosition) => {
        userLat = pos.coords.latitude
        userLon = pos.coords.longitude
        map!.getView().animate({ center: fromLonLat([userLon, userLat]), zoom: 15, duration: 500 })
        updateUserMarker(map!, userLat, userLon)
        const data = await getMonuments(userLat, userLon)
        const processed = processMonuments(map!, data, userLat, userLon)
        emit('nearest-monuments', processed)
        map!.on('click', handleMapClick)
      }

      const fallback = async () => {
        userLat = 52.52
        userLon = 13.405
        map!.getView().animate({ center: fromLonLat([userLon, userLat]), zoom: 12, duration: 500 })
        updateUserMarker(map!, userLat, userLon)
        const data = await getMonuments(userLat, userLon)
        const processed = processMonuments(map!, data, userLat, userLon) as Monument[]
        emit('nearest-monuments', processed)
        map!.on('click', handleMapClick)
      }

      const handleMapClick = (evt: MapBrowserEvent<MouseEvent>) => {
        const feature = map!.forEachFeatureAtPixel(evt.pixel, (f: Feature) => f, {
          hitTolerance: 6,
        })
        if (feature?.get('name')) {
          const name = feature.get('name') as string
          const geometry = feature.getGeometry()
          if (geometry instanceof Point) {
            const coordinates = geometry.getCoordinates()
            const [lon, lat] = toLonLat(coordinates)
            removeRouteOverlay(map!)
            drawRoute({ map: map!, userLat, userLon, selectedName: name }, lon, lat)
          }
        }
      }

      navigator.geolocation.getCurrentPosition(success, fallback, {
        enableHighAccuracy: true,
        timeout: 10000,
      })
    })

    onUnmounted(() => {
      document.removeEventListener('draw-route', handleDrawRoute as EventListener)
      document.removeEventListener('center-on-user', handleCenterOnUser as EventListener)
      if (map) {
        removeRouteOverlay(map)
        map.dispose()
      }
    })

    return { centerOnUser, zoomIn, zoomOut }
  },
})
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.map-canvas {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}

.map-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  z-index: 1000;
}

.control-btn {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.control-btn:hover {
  background: #f8f8f8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.control-btn:active {
  background: #f0f0f0;
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.location-btn {
  padding: 8px;
  min-width: 36px;
  min-height: 36px;
}

.location-btn svg {
  width: 16px;
  height: 16px;
}

.zoom-controls {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
}

.zoom-controls .control-btn {
  margin: 0;
  padding: 6px 10px;
  font-size: 16px;
  font-weight: bold;
  min-width: 36px;
  min-height: 32px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.zoom-controls .control-btn:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .map-controls {
    bottom: 12px;
    right: 12px;
    gap: 4px;
  }
  .location-btn {
    padding: 6px;
    min-width: 32px;
    min-height: 32px;
  }
  .zoom-controls .control-btn {
    padding: 5px 8px;
    min-width: 32px;
    min-height: 28px;
    font-size: 14px;
  }
  .location-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>

<style>
.route-tooltip {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  pointer-events: none;
  z-index: 1000;
  color: #000;
  max-width: min(400px, 90vw);
  width: max-content;
  min-width: 150px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.route-tooltip strong {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
}

.route-tooltip div {
  color: #444;
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