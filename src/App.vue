<template>
  <div class="app-layout">
 
    <div class="map-column">
      <MapView @nearest-monuments="updateNearest" />
    </div>

  
    <aside class="side-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <h1>Nearby Monuments</h1>
          <p class="subtitle">Explore places around you</p>
        </div>

        <NearestList
          :monuments="nearestThree"
          :routeHandler="handleRoute"
        />

        <div class="panel-footer">
          <button class="primary-cta" @click="centerOnUser">Re-center</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MapView from "./components/MapView.vue";
import NearestList from "./components/NearestList.vue";

export default defineComponent({
  name: "App",
  components: { MapView, NearestList },

  data() {
    return {
      nearestThree: []
    };
  },

  methods: {
    updateNearest(list: any[]) {
      this.nearestThree = list;
    },

    handleRoute([lon, lat]: [number, number]) {
      // keep your current approach: dispatch custom event that MapView listens to
      document.dispatchEvent(
        new CustomEvent("draw-route", { detail: { lon, lat } })
      );
    },

    centerOnUser() {
      // optional helper — MapView does not expose an API; we dispatch a custom event if you want to handle it later
      document.dispatchEvent(new CustomEvent("center-on-user"));
    }
  }
});
</script>

<style>
/* Page layout */
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #0f1113; /* dark page background to match screenshot */
}

/* Map column expands to fill available width */
.map-column {
  flex: 1;
  min-width: 320px;
  display: flex;
  padding: 28px; /* spacing around map like the reference */
  box-sizing: border-box;
  align-items: stretch;
  justify-content: center;
}

/* Side panel - auto width but constrained for good UX */
.side-panel {
  background: linear-gradient(180deg, #0b0d0f 0%, #111214 100%);
  color: #fff;
  padding: 24px;
  box-shadow: -8px 0 20px rgba(0,0,0,0.6);
  box-sizing: border-box;

  /* auto width but limited */
  width: clamp(300px, 30vw, 400px);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

/* inner wrapper for spacing */
.panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* header */
.panel-header {
  margin-bottom: 12px;
}
.panel-header h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.2px;
}
.panel-header .subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #bfc3c7;
}

/* footer area */
.panel-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding: 8px 0 20px;
}
.primary-cta {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(26,115,232,0.18);
}
.primary-cta:hover { transform: translateY(-2px); }
</style>