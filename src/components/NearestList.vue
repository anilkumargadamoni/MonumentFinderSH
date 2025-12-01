<template>
  <div class="nearest-wrap">
    <ul v-if="monuments && monuments.length" class="monuments">
      <li v-for="(m, idx) in monuments.slice(0, 3)" :key="m.name + idx" class="mon-card">
        <div class="card-left">
          <div class="icon-wrap">
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
            <button class="info-icon-btn" @click="openWikipedia(m)" title="Open Wikipedia">
              <svg viewBox="0 0 24 24" class="info-icon">
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
            </button>
          </div>

          <div class="meta-row">
            <div class="meta">
              Distance: <strong>{{ m.distance.toFixed(2) }} km</strong>
            </div>
          </div>

          <div class="button-row">
            <button class="btn route" @click="showRoute(m)">
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2l4 4-6 6L6 8l6-6zM3 21V13l4 4-4 4z" />
              </svg>
              Show Route
            </button>

            <button class="btn nav" @click="navigate(m)">
              <svg class="btn-icon" viewBox="0 0 24 24">
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

    <p v-else class="empty">No nearby monuments found.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'NearestList',
  props: {
    monuments: {
      type: Array as PropType<
        Array<{
          name: string
          lat: number
          lon: number
          distance: number
          wikipediaUrl?: string
        }>
      >,
      required: true,
    },
    routeHandler: { type: Function, required: true },
  },
  methods: {
    showRoute(monument: any) {
      this.routeHandler([monument.lon, monument.lat])
    },
    navigate(monument: any) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${monument.lat},${monument.lon}`
      window.open(url, '_blank')
    },
    openWikipedia(monument: any) {
      if (monument.wikipediaUrl) {
        window.open(monument.wikipediaUrl, '_blank')
      } else {
        const searchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(monument.name)}`
        window.open(searchUrl, '_blank')
      }
    },
  },
})
</script>

<style scoped>
/* ───────────────────────────────
   Nearest List – responsive layout
   ─────────────────────────────── */

.nearest-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* List spacing */
.monuments {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card base */
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

/* Left icon */
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

/* Body */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Title row */
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

/* Wikipedia icon */
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

.info-icon {
  width: 18px;
  height: 18px;
}

/* Meta */
.meta-row {
  margin-top: 6px;
  color: #c7c9cc;
  font-size: 13px;
}

/* Buttons layout */
.button-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap; /* ⭐ Responsive */
}

.btn {
  flex: 1 1 48%; /* ⭐ 2 buttons side-by-side on mobile */
  min-width: 120px; /* Prevent super small buttons */
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

/* Empty state */
.empty {
  color: #c7c9cc;
  font-size: 14px;
  padding: 8px 0;
  text-align: center;
}

/* ────────────────
   📱 Mobile tuning
   ──────────────── */
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

/* ──────────────────────
   💻 Larger screens tuning
   ────────────────────── */
@media (min-width: 880px) {
  .btn {
    flex: initial;
    min-width: auto; /* Let the desktop buttons shrink to text width */
  }
}
</style>