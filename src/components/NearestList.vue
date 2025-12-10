<template>
  <div class="nearest-wrap">
    <ul
      v-if="monuments && monuments.length"
      class="monuments"
      role="list"
      aria-label="List of nearby monuments"
    >
      <li
        v-for="(m, idx) in monuments.slice(0, 3)"
        :key="`${m.name}-${idx}`"
        class="mon-card"
        role="listitem"
        :aria-label="`${m.name}, ${m.distance.toFixed(2)} kilometers away`"
      >
        <div class="card-left">
          <div class="icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="mon-icon" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
              />
            </svg>
          </div>
        </div>

        <div class="card-body">
          <div class="title-row">
            <div class="name">{{ m.name }}</div>
            <button
              class="info-icon-btn"
              @click="openWikipedia(m)"
              :aria-label="`Open Wikipedia page for ${m.name}`"
              :title="`Learn more about ${m.name} on Wikipedia`"
            >
              <span class="sr-only">Open Wikipedia for {{ m.name }}</span>
              <svg viewBox="0 0 24 24" class="info-icon" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
            </button>
          </div>

          <div class="button-row">
            <button
              class="btn route"
              @click="showRoute(m)"
              :aria-label="`Show route to ${m.name}`"
              :title="`Display route on map to ${m.name}`"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2l4 4-6 6L6 8l6-6zM3 21V13l4 4-4 4z" />
              </svg>
              Show Route
            </button>

            <button
              class="btn nav"
              @click="navigate(m)"
              :aria-label="`Open navigation to ${m.name} in Google Maps`"
              :title="`Navigate to ${m.name} using Google Maps`"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2L2 7l10 5 10-5-10-5zm0 7.2L6.5 7.1 12 5.1 17.5 7.1 12 9.2zM2 17l10 5 10-5-10-5L2 17z"
                />
              </svg>
              Navigate
            </button>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="empty" role="status" aria-live="polite">No nearby monuments found</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

interface Monument {
  name: string
  lat: number
  lon: number
  distance: number
  wikipediaUrl?: string
}

export default defineComponent({
  name: 'NearestList',
  props: {
    monuments: {
      type: Array as PropType<Monument[]>,
      required: true,
      validator: (value: Monument[]) => {
        return Array.isArray(value)
      },
    },
    routeHandler: {
      type: Function as PropType<(coordinates: [number, number]) => void>,
      required: true,
    },
  },

  methods: {
 showRoute(monument: Monument): void {
  this.routeHandler({
    lon: monument.lon,
    lat: monument.lat,
    name: monument.name
  });
},


    navigate(monument: Monument): void {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${monument.lat},${monument.lon}`
      window.open(url, '_blank', 'noopener,noreferrer')
    },

    openWikipedia(monument: Monument): void {
      if (monument.wikipediaUrl) {
        window.open(monument.wikipediaUrl, '_blank', 'noopener,noreferrer')
      } else {
        const searchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(monument.name)}`
        window.open(searchUrl, '_blank', 'noopener,noreferrer')
      }
    },
  },
})
</script>

<style scoped>

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

.nearest-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monuments {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mon-card {
  display: flex;
  gap: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
  align-items: center;
}

.mon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.55);
}

:deep(.mon-card:focus-within) {
  outline: 2px solid #1a73e8;
}

.icon-wrap {
  min-width: 44px;
  min-height: 44px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mon-icon {
  width: 22px;
  height: 22px;
  color: #f8f9fa;
}


.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}


.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.name {
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  overflow-wrap: break-word;
  flex: 1;
}


.info-icon-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #4f8cff;
  transition: background-color 0.2s ease;
}

.info-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

:deep(.info-icon-btn:focus-visible) {
  outline: 2px solid #4f8cff;
  outline-offset: 2px;
}

.info-icon {
  width: 18px;
  height: 18px;
}


.meta-row {
  margin-top: 6px;
  color: #c7c9cc;
  font-size: 13px;
}

.button-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.btn {
  flex: 1 1 48%;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;
}

.btn:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

:deep(.btn:focus-visible) {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}

.btn.route {
  background: #1a73e8;
  color: white;
}

.btn.nav {
  background: #0bd07a;
  color: #062a12;
}

.btn-icon {
  width: 16px;
  height: 16px;
  color: inherit;
}

.empty {
  color: #c7c9cc;
  font-size: 14px;
  padding: 8px 0;
  text-align: center;
}

@media (max-width: 480px) {
  .mon-card {
    padding: 10px;
    gap: 10px;
  }

  .name {
    font-size: 14px;
  }

  .meta-row {
    font-size: 12px;
  }

  .icon-wrap {
    min-width: 40px;
    min-height: 40px;
  }
}


@media (min-width: 880px) {
  .btn {
    flex: initial;
    min-width: auto;
  }
}


@media (prefers-contrast: high) {
  .mon-card {
    border: 2px solid #fff;
    background: #000;
  }

  .btn {
    border: 2px solid currentColor;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mon-card,
  .btn {
    transition: none;
  }

  .mon-card:hover {
    transform: none;
  }

  .btn:hover {
    transform: none;
  }
}
</style>