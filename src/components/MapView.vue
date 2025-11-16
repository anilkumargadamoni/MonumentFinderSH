<template>
	<div id="map" class="map-container"></div>
</template>

<script lang="ts">
import { onMounted } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import TileWMS from "ol/source/TileWMS";

export default {
	name: "MapView",
	setup() {
		onMounted(() => {
			new Map({
				target: "map",
				layers: [
	// Base layer
	new TileLayer({
		source: new OSM()
	}),
	// WMS layer (required)
	new TileLayer({
		source: new TileWMS({
			url: "https://geodienste.schleswig-holstein.de/geoport/ows/wms_sh_basisdaten?",
			params: {
				LAYERS: "de_sh_grundkarte",
				TILED: true
			},
			serverType: "geoserver"
		}),
		opacity: 0.7
	})
],
				view: new View({
					center: [0, 0], // default center
					zoom: 2
				})
			});
		});
	}
};
</script>

<style scoped>
.map-container {
	width: 100%;
	height: 100vh;
}
</style>