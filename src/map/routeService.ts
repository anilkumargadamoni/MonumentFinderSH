import axios from "axios";
import { fromLonLat } from "ol/proj";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Overlay from "ol/Overlay";
import Map from "ol/Map";

export interface RouteParams {
  map: Map;
  userLat: number;
  userLon: number;
  selectedName: string;
}

let currentOverlay: Overlay | null = null;
let currentRouteLayer: VectorLayer | null = null;

export interface DrawRouteResult {
  layer: VectorLayer;
  distanceKm: number;
  durationMin: number;
}

export async function drawRoute(
  params: RouteParams,
  targetLon: number,
  targetLat: number
): Promise<DrawRouteResult> {
  const { map, userLat, userLon, selectedName } = params;

  // Remove previous overlay and route layer
  removeRouteOverlay(map);

  try {
    const drivingURL = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${targetLon},${targetLat}?overview=full&geometries=geojson`;

    const res = await axios.get(drivingURL);
    const routeData = res.data.routes?.[0];

    if (!routeData) throw new Error("No route found");

    const coords: [number, number][] = routeData.geometry.coordinates;

    const transformed = coords.map(([lon, lat]) => fromLonLat([lon, lat]));
    const geometry = new LineString(transformed);

    const feature = new Feature({ geometry });

    const layer = new VectorLayer({
      source: new VectorSource({ features: [feature] }),
      style: new Style({
        stroke: new Stroke({
          color: "#ff3b30",
          width: 5,
          lineDash: [1, 0],
        }),
      }),
    });

    map.addLayer(layer);
    currentRouteLayer = layer;

    // Fit the view to the route
    map.getView().fit(geometry.getExtent(), {
      padding: [80, 80, 80, 80],
      duration: 800,
    });

    // Create tooltip overlay
    const overlayEl = document.createElement("div");
    overlayEl.className = "route-tooltip";
    overlayEl.innerHTML = `
      <strong>${selectedName}</strong>
      <div>
        Distance by car: ${(routeData.distance / 1000).toFixed(2)} km<br>
        Duration: ${Math.round(routeData.duration / 60)} minutes
      </div>
    `;

    const overlay = new Overlay({
      element: overlayEl,
      positioning: "bottom-center",
      offset: [0, -15],
      stopEvent: false,
    });

    // Position overlay at the middle of the route
    overlay.setPosition(geometry.getCoordinateAt(0.5));
    map.addOverlay(overlay);
    currentOverlay = overlay;

    return {
      layer,
      distanceKm: routeData.distance / 1000,
      durationMin: Math.round(routeData.duration / 60),
    };
  } catch (error) {
    console.error("Error drawing route:", error);
    throw error;
  }
}

export function removeRouteOverlay(map: Map): void {
  if (currentOverlay) {
    map.removeOverlay(currentOverlay);
    currentOverlay = null;
  }
  if (currentRouteLayer) {
    map.removeLayer(currentRouteLayer);
    currentRouteLayer = null;
  }
}
