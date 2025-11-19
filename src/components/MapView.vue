<template>
  <div id="map" class="map-container"></div>
</template>
<script lang="ts">
import { onMounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'

import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { fromLonLat, toLonLat } from 'ol/proj'

import Style from 'ol/style/Style'
import CircleStyle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'

import { getMonuments } from '@/services/wfsService'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default {
  name: 'MapView',
  emits: ['nearest-monuments'],

  setup(_, { emit }) {
    onMounted(() => {
      const map = new Map({
        target: 'map',
        layers: [
          new TileLayer({ source: new OSM() }),
          new TileLayer({
            source: new TileWMS({
              url: 'https://ahocevar.com/geoserver/wms',
              params: { LAYERS: 'ne:ne_10m_admin_0_countries', TILED: true },
            }),
            opacity: 0.3,
          }),
        ],
        view: new View({ center: [0, 0], zoom: 2 }),
      })

      let userLat = 0
      let userLon = 0

      navigator.geolocation.getCurrentPosition((pos) => {
        userLat = pos.coords.latitude
        userLon = pos.coords.longitude

        const userFeature = new GeoJSON().readFeature(
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [userLon, userLat] },
          },
          {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          },
        )

        const userLayer = new VectorLayer({
          source: new VectorSource({ features: [userFeature] }),
          style: new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: 'blue' }),
              stroke: new Stroke({ color: 'white', width: 2 }),
            }),
          }),
        })

        map.addLayer(userLayer)

        map.getView().animate({
          center: fromLonLat([userLon, userLat]),
          zoom: 6,
          duration: 800,
        })
      })

      getMonuments().then((geojson) => {
        const features = new GeoJSON().readFeatures(geojson, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        })

        const monumentLayer = new VectorLayer({
          source: new VectorSource({ features }),
          style: new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({ color: 'red' }),
              stroke: new Stroke({ color: 'white', width: 1 }),
            }),
          }),
        })

        map.addLayer(monumentLayer)

        map.getView().setZoom(3)

        setTimeout(() => {
          const distances = features.map((f) => {
            const coords3857 = f.getGeometry().getCoordinates()
            const [lon, lat] = toLonLat(coords3857)

            const d = haversineDistance(userLat, userLon, lat, lon)
			console.log("The location is ",f);
			const name = f.get('NAME') || f.get('NAMEASCII') || f.get('LS_NAME');

            return {
              name: name,
              distance: d,
              lon,
              lat,
            }
          })

          const nearest3 = distances.sort((a, b) => a.distance - b.distance).slice(0, 3)
          console.log('neaaresssssssss', nearest3)
          emit('nearest-monuments', nearest3)
        }, 1500)
      })
    })
  },
}
</script>
<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>