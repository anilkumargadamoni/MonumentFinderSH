import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import { Overlay } from "ol";

export function createMap(targetId: string) {
  return new Map({
    target: targetId,
    layers: [new TileLayer({ source: new OSM() })],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 12,
    }),
    controls: [],
  });
}

export function updateUserMarker(map: any, lat: number, lon: number) {
  const point = new Feature(new Point(fromLonLat([lon, lat])));

  point.setStyle(
    new Style({
      image: new Icon({
        src: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        anchor: [0.5, 1],
      }),
    })
  );

  const layer = new VectorLayer({
    source: new VectorSource({ features: [point] }),
  });

  map.addLayer(layer);
}

export function enableKeyboardNavigation(map: any) {
  const viewport = map.getViewport();
  viewport.setAttribute("tabindex", "0");

  viewport.addEventListener("keydown", (e) => {
    const view = map.getView();
    const zoom = view.getZoom() || 12;
    const center = view.getCenter()!;
    const amount = 100000 / Math.pow(2, zoom - 1);

    switch (e.key) {
      case "+":
      case "=":
        view.animate({ zoom: zoom + 1, duration: 250 });
        break;
      case "-":
        view.animate({ zoom: zoom - 1, duration: 250 });
        break;
      case "ArrowUp":
        view.animate({ center: [center[0], center[1] + amount], duration: 250 });
        break;
      case "ArrowDown":
        view.animate({ center: [center[0], center[1] - amount], duration: 250 });
        break;
      case "ArrowLeft":
        view.animate({ center: [center[0] - amount, center[1]], duration: 250 });
        break;
      case "ArrowRight":
        view.animate({ center: [center[0] + amount, center[1]], duration: 250 });
        break;
    }
  });
}