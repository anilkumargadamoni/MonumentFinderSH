<template>
  <div class="container">
    <MapView @nearest-monuments="updateNearest" />
    <NearestList :monuments="nearestThree" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MapView from './components/MapView.vue'
import NearestList from './components/NearestList.vue'

export default defineComponent({
  name: 'App',

  components: {
    MapView,
    NearestList,
  },

  data() {
    return {
      nearestThree: [] as any[],
    }
  },

  methods: {
    updateNearest(list: any[]) {
      this.nearestThree = list
    },
  },
})
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>