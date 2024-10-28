<script lang="ts">
import PGenerateCard from './ui/PGenerateCard.vue';
import PViewCard from './ui/PViewCard.vue';
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTheStore } from '@/store';

defineOptions({
  name: 'CryptoKey',
});

const theStore = useTheStore();

const cryptoKeyGenerated = computed(() => theStore.cryptoKey !== null);
</script>

<template>
  <div class="crypto-key">
    <VSlideYTransition mode="out-in">
      <PViewCard
        v-if="cryptoKeyGenerated"
        class="crypto-key__card"
      />
      <PGenerateCard
        v-else
        class="crypto-key__card"
      />
    </VSlideYTransition>
  </div>
</template>

<style scoped>
.crypto-key {
  display: flex;
  flex-direction: column;
  padding: 48px 12px;
}

.crypto-key__card {
  width: 100%;
  max-width: 720px;

  margin-inline-start: auto;
  margin-inline-end: auto;
}
</style>
