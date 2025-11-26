import axios from "axios";

/**
 * Fetch historic points in a bbox around (lat, lon).
 * delta is degrees (~0.5 ≈ 50 km)
 */
export async function getHistoricalPlaces(lat: number, lon: number, delta = 0.5): Promise<any> {
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLon = lon - delta;
  const maxLon = lon + delta;

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["historic"](${minLat},${minLon},${maxLat},${maxLon});
      way["historic"](${minLat},${minLon},${maxLat},${maxLon});
      relation["historic"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out center;
  `;

  const response = await axios.post(
    "https://overpass-api.de/api/interpreter",
    overpassQuery,
    { headers: { "Content-Type": "text/plain" } }
  );

  const elements = response.data.elements || [];

  // Convert Overpass elements to GeoJSON features (Point)
  const features = elements
    .map((el: any) => {
      const lon = el.lon ?? el.center?.lon;
      const lat = el.lat ?? el.center?.lat;
      if (!lon || !lat) return null;

      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: {
          id: el.id,
          osmType: el.type, // node/way/relation
          name: el.tags?.name || "Unnamed Historic Place",
          historic: el.tags?.historic || null,
          tags: el.tags || {},
        },
      };
    })
    .filter(Boolean);

  return { type: "FeatureCollection", features };
}

/**
 * Simple Nominatim search (used by the map search)
 * Returns first result or null
 */
export async function geocode(query: string) {
  const url = "https://nominatim.openstreetmap.org/search";
  const resp = await axios.get(url, {
    params: { q: query, format: "json", limit: 1 },
    headers: { "Accept-Language": "en" },
  });
  if (!resp.data || resp.data.length === 0) return null;
  return resp.data[0]; // {lat, lon, display_name, ...}
}
