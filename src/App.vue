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

        <NearestList :monuments="nearestThree" :routeHandler="handleRoute" />

        <div class="panel-footer">
          <button class="primary-cta" @click="centerOnUser">Re-center</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MapView from './components/MapView.vue'
import NearestList from './components/NearestList.vue'

export default defineComponent({
  name: 'App',
  components: { MapView, NearestList },

  data() {
    return {
      nearestThree: [],
    }
  },

  methods: {
    updateNearest(list: any[]) {
      this.nearestThree = list
    },

    handleRoute([lon, lat]: [number, number]) {
      // keep your current approach: dispatch custom event that MapView listens to
      document.dispatchEvent(new CustomEvent('draw-route', { detail: { lon, lat } }))
    },

    centerOnUser() {
      // optional helper — MapView does not expose an API; we dispatch a custom event if you want to handle it later
      document.dispatchEvent(new CustomEvent('center-on-user'))
    },
  },
})
</script>

<style>
/* Page layout */ /* Mobile-first layout: Map on top, list below */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #0f1113;
}

.map-column {
  flex: 1;
  min-height: 55vh;
  padding: 16px;
  box-sizing: border-box;
}

.side-panel {
  width: 100%;
  background: linear-gradient(180deg, #0b0d0f 0%, #111214 100%);
  color: #fff;
  padding: 16px;
  box-sizing: border-box;
  max-height: 45vh;
  overflow-y: auto;
}

/* inner spacing */
.panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header h1 {
  margin: 0;
  font-size: 18px;
}

.panel-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

/* Laptop / Desktop: side-by-side */
@media (min-width: 880px) {
  .app-layout {
    flex-direction: row;
  }

  .map-column {
    flex: 1 1 70%;
    padding: 28px;
    min-height: 100vh;
  }

  .side-panel {
    flex: 0 0 30%;
    max-height: 100vh;
    overflow-y: auto;
    padding: 24px;
  }
}
</style>