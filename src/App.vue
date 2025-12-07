<template>
  <main id="main-content">
    <div class="app-layout">
      <div class="map-column">
        <MapView @nearest-monuments="updateNearest" />
      </div>

      <aside class="side-panel" aria-label="Nearby monuments panel">
        <div class="panel-inner">
          <header class="panel-header">
            <h1>Nearby Monuments</h1>
            <p class="subtitle">Explore places around you</p>
          </header>

          <NearestList :monuments="filteredMonuments" :route-handler="handleRoute" />

          <div class="panel-footer">
            <button class="primary-cta" @click="centerOnUser">Re-center</button>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import MapView from './components/MapView.vue'
import NearestList from './components/NearestList.vue'

interface Monument {
  name: string
  lat: number
  lon: number
  distance: number
  wikipediaUrl?: string
}

export default defineComponent({
  name: 'App',
  components: { MapView, NearestList },

  setup() {
    const nearestThree = ref<Monument[]>([])
    const searchQuery = ref('')

    const filteredMonuments = computed(() => {
      if (!searchQuery.value) return nearestThree.value.slice(0, 3)

      return nearestThree.value
        .filter((m) => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
        .slice(0, 3)
    })

    function updateNearest(list: Monument[]) {
      nearestThree.value = list
    }

    function handleRoute({ lon, lat, name }) {
      document.dispatchEvent(
        new CustomEvent('draw-route', {
          detail: { lon, lat, name },
        }),
      )
    }

    function centerOnUser() {
      document.dispatchEvent(new CustomEvent('center-on-user'))
    }

    return {
      nearestThree,
      searchQuery,
      filteredMonuments,
      updateNearest,
      handleRoute,
      centerOnUser,
    }
  },

  mounted() {
    document.documentElement.lang = 'en'
    document.title = 'Nearby Monuments Explorer'
  },
})
</script>

<style>
/* Accessibility improvements */
:root {
  --primary-color: #1a73e8;
  --primary-dark: #0d62d9;
  --text-primary: #ffffff;
  --text-secondary: #c7c9cc;
  --bg-dark: #0f1113;
  --bg-panel: #0b0d0f;
  --border-color: rgba(255, 255, 255, 0.1);
}

:deep(.ol-viewport:focus-visible) {
  outline: 3px solid #1a73e8;
  outline-offset: 2px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Page layout */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: var(--bg-dark);
  color: var(--text-primary);
}

.map-column {
  flex: 1;
  min-height: 55vh;
  padding: 16px;
  box-sizing: border-box;
}

.side-panel {
  width: 100%;
  background: linear-gradient(180deg, var(--bg-panel) 0%, #111214 100%);
  color: var(--text-primary);
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
  gap: 16px;
}

.panel-header h1 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.subtitle {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Search styles */
.search-container {
  position: relative;
  margin-bottom: 8px;
}

.search-input {
  width: 100%;
  padding: 10px 44px 10px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.12);
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
}

.search-button:hover {
  color: var(--text-primary);
}

.search-icon {
  width: 20px;
  height: 20px;
}

.panel-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.primary-cta {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 140px;
}

.primary-cta:hover {
  background: var(--primary-dark);
}

.primary-cta:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

.primary-cta:active {
  transform: translateY(1px);
}

/* High contrast support */
@media (prefers-contrast: high) {
  .side-panel {
    background: #000;
    border-left: 2px solid #fff;
  }

  .search-input {
    border: 2px solid #fff;
  }

  .primary-cta {
    border: 2px solid #fff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .app-layout,
  .primary-cta {
    transition: none;
  }

  .primary-cta:active {
    transform: none;
  }
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

  .panel-header h1 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 15px;
  }
}

/* Ensure text contrast meets WCAG AA (4.5:1) */
@media (max-width: 879px) {
  .panel-header h1 {
    font-size: 20px;
  }
}
</style>