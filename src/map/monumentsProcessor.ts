import GeoJSON from 'ol/format/GeoJSON'
import { toLonLat } from 'ol/proj'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Point from 'ol/geom/Point'
import Feature from 'ol/Feature'
import Map from 'ol/Map'

import { haversineDistance } from '@/utils'

export interface ProcessedMonument {
  name: string
  lat: number
  lon: number
  distance: number
  wikipediaUrl: string
}

export function processMonuments(
  map: Map,
  geojsonData: unknown,
  userLat: number,
  userLon: number
): ProcessedMonument[] {
  const features = new GeoJSON().readFeatures(geojsonData, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  })

  const processed: ProcessedMonument[] = []

  features.forEach((f: Feature<Point>) => {
    const name = (f.get('name') as string) || 'Unknown Monument'
    const geom = f.getGeometry()
    if (!(geom instanceof Point)) return

    const [lon, lat] = toLonLat(geom.getCoordinates())
    const distance = haversineDistance(userLat, userLon, lat!, lon!)

    const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      name.replace(/\s+/g, '_')
    )}`

    f.setStyle(
      new Style({
        image: new Icon({
          src: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          anchor: [0.5, 1],
        }),
      })
    )

    processed.push({ name, lat, lon, distance, wikipediaUrl })
  })

  const layer = new VectorLayer({
    source: new VectorSource({ features }),
  })

  map.addLayer(layer)

  return processed.filter((m) => m.distance <= 10).sort((a, b) => a.distance - b.distance)
}
