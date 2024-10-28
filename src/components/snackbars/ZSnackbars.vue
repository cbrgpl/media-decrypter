<script lang="ts">
import PSnackbars from './partials/PSnackbars.vue';
</script>

<script setup lang="ts">
defineOptions({
  name: 'ZNotifications',
});
</script>

<template>
  <div class="alerts">
    <PSnackbars />
  </div>
</template>

<style scoped lang="scss">
.alerts {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000000;

  width: 100vw;

  pointer-events: none;
}
</style>
