<template>
  <div class="nearest-wrap">
    <ul v-if="monuments && monuments.length" class="monuments">
      <li v-for="(m, idx) in monuments.slice(0, 3)" :key="m.name" class="mon-card">
        <div class="card-left">
          <div class="icon-wrap">
            <svg viewBox="0 0 24 24" class="mon-icon" aria-hidden="true">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
            </svg>
          </div>
        </div>

        <div class="card-body">
          <div class="title-row">
            <div class="name">{{ m.name }}</div>
          </div>

          <div class="meta-row">
            <div class="meta">Distance: <strong>{{ m.distance.toFixed(2) }} km</strong></div>
          </div>

          <div class="button-row">
            <button class="btn route" @click="showRoute(m)">
              <svg class="btn-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l4 4-6 6L6 8l6-6zM3 21V13l4 4-4 4z"/></svg>
              Show Route
            </button>

            <button class="btn nav" @click="navigate(m)">
              <svg class="btn-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm0 7.2L6.5 7.1 12 5.1 17.5 7.1 12 9.2zM2 17l10 5 10-5-10-5L2 17z"/></svg>
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
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "NearestList",
  props: {
    monuments: {
      type: Array as PropType<Array<{ name: string; lat: number; lon: number; distance: number }>>,
      required: true
    },
    routeHandler: { type: Function, required: true }
  },
  methods: {
    showRoute(monument: any) {
      this.routeHandler([monument.lon, monument.lat]);
    },
    navigate(monument: any) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${monument.lat},${monument.lon}`;
      window.open(url, "_blank");
    }
  }
});
</script>

<style scoped>
.nearest-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* card list */
.monuments {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* single card */
.mon-card {
  display: flex;
  gap: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border-radius: 12px;
  padding: 12px;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 4px 18px rgba(0,0,0,0.35);
  transition: transform .12s ease, box-shadow .12s ease;
}

.mon-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

/* left icon */
.icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.mon-icon {
  width: 24px;
  height: 24px;
  color: #f8f9fa;
}

/* body */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.title-row {
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.name {
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
}
.distance-pill {
  background: #0bd07a;
  color: #062a12;
  padding: 6px 10px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 13px;
}

/* meta text */
.meta-row {
  margin-top: 6px;
  color: #c7c9cc;
  font-size: 13px;
}

/* buttons */
.button-row {
  margin-top: 10px;
  display:flex;
  gap:10px;
}
.btn {
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px 12px;
  border-radius:10px;
  border:none;
  cursor:pointer;
  font-weight:600;
  color:#0f1113;
  background:#e7eef8;
  transition:transform .12s ease;
}
.btn:hover { transform: translateY(-2px); }

/* route is blue */
.btn.route {
  background: #1a73e8;
  color: white;
}

/* nav is green */
.btn.nav {
  background: #0bd07a;
  color: #062a12;
}

/* small svg icons on buttons */
.btn-icon { width: 16px; height: 16px; color: inherit; }

/* empty text */
.empty {
  color: #c7c9cc;
  font-size: 14px;
  padding: 8px 0;
}
</style>


