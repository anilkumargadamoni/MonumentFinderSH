import axios from "axios";

export interface OverpassNode {
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    tourism?: string;
    historic?: string;
    [key: string]: string | undefined; 
  };
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
    type?: string;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * Fetch nearby monuments from Overpass API
 */
export async function getMonuments(
  lat: number,
  lon: number,
  delta = 0.5
): Promise<GeoJSONFeatureCollection> {
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLon = lon - delta;
  const maxLon = lon + delta;

  const overpassQuery = `
    [out:json];
    (
      node["tourism"="attraction"](${minLat},${minLon},${maxLat},${maxLon});
      node["historic"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out center;
  `;

  const response = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery, {
    headers: { "Content-Type": "text/plain" },
  });

  const features: GeoJSONFeature[] = response.data.elements.map((node: OverpassNode) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [node.lon, node.lat],
    },
    properties: {
      name: node.tags?.name || "Unnamed Monument",
      type: node.tags?.tourism || node.tags?.historic,
    },
  }));

  return {
    type: "FeatureCollection",
    features,
  };
}
