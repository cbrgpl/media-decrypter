<script setup lang="ts">
import { computed } from 'vue';

import { useTheStore } from '@/store';

const theStore = useTheStore();

const keyStatusParams = computed(() => {
  return {
    color: theStore.cryptoKey ? 'success' : '',
  };
});
</script>
<template>
  <VSystemBar color="surface-bright">
    <VIcon
      :color="keyStatusParams.color"
      class="me-1"
      icon="mdi-key"
    />
  </VSystemBar>
</template>

<style>
.system-bar__salt {
  font-family: monospace;
}
</style>
