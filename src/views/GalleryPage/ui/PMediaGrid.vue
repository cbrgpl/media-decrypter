<script lang="ts">
import PMediaDecrypter from './PMediaDecrypter.vue';
</script>

<script setup lang="ts">
import { computed } from 'vue';
import type { VSheet } from 'vuetify/components';

import type { IMediaViewerShowingRequestWrapper, IModifiedFileSystemFileHandle } from './../types';

const $props = defineProps<{
  scrollingContainer: HTMLElement | null;
  fileHandles: IModifiedFileSystemFileHandle[];
}>();

const $emit = defineEmits<{
  showInMediaViewer: [IMediaViewerShowingRequestWrapper];
}>();

const observerOptions = computed(() => {
  if (!$props.scrollingContainer) {
    return null;
  }

  return {
    threshold: 0,
    root: $props.scrollingContainer,
    rootMargin: '0px 0px 150px 0px',
  };
});
</script>

<template>
  <VSheet
    color="transparent"
    class="gallery__media-grid"
  >
    <template v-if="observerOptions !== null">
      <VLazy
        v-for="(handle, i) of $props.fileHandles"
        :key="i"
        min-height="50"
        :options="observerOptions"
        transition="fade-transition"
      >
        <template #default>
          <PMediaDecrypter
            :i="i"
            :file-handle="handle"
            @showInMediaViewer="$emit('showInMediaViewer', $event)"
          />
        </template>
      </VLazy>
    </template>
  </VSheet>
</template>

<style scoped>
.gallery__media-grid {
  display: grid;
  grid-template-rows: max-content;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  overflow: visible;
  margin: 0 -10px;
}
</style>
