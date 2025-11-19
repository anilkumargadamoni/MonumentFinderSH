<template>
  <div class="list-container">
    <h2>Nearest Monuments</h2>

    <ul v-if="monuments && monuments.length > 0">
      <li v-for="m in monuments" :key="m.name" class="item">

        <strong>{{ m.name }}</strong><br />
        Distance: {{ m.distance.toFixed(2) }} km<br />

        <button class="nav-btn" @click="navigateTo(m.lat, m.lon)">
          Navigate
        </button>
      </li>
    </ul>

    <p v-else>No monuments found near your location.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NearestList",

  props: {
    monuments: {
      type: Array,
      required: true
    }
  },

  methods: {
    navigateTo(lat: number, lon: number) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
      window.open(url, "_blank");
    }
  }
});
</script>

<style scoped>
.list-container {
  padding: 12px;
  background: white;
  max-height: 40vh;
  overflow-y: auto;
  border-top: 1px solid #ccc;
}

.item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.nav-btn {
  margin-top: 5px;
  padding: 6px 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.nav-btn:hover {
  background: #0056b3;
}
</style>