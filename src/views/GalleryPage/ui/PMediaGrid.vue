<script lang="ts">
import PMediaDecrypter from './PMediaDecrypter.vue';
</script>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { VSheet } from 'vuetify/components';

import type { IMediaViewerShowingRequestWrapper, IEFilePointerViewerMod } from './../types';

defineOptions({
  name: 'PMediaGrid',
  inheritAttrs: false,
});

const $props = defineProps<{
  scrollingContainer: HTMLElement | null;
  eFilePointers: IEFilePointerViewerMod[];
}>();

const $emit = defineEmits<{
  showInMediaViewer: [IMediaViewerShowingRequestWrapper];
}>();

const $attrs = useAttrs();

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
  <template v-if="eFilePointers.length === 0">
    <VDivider class="mb-4" />
    <h5 class="text-h5 text-center">Пусто тут</h5>
  </template>
  <VSheet
    v-bind="$attrs"
    color="transparent"
    class="gallery__media-grid"
  >
    <template v-if="observerOptions !== null">
      <VLazy
        v-for="(pointer, i) of $props.eFilePointers"
        :key="pointer.fileId"
        min-height="50"
        :options="observerOptions"
        transition="fade-transition"
      >
        <template #default>
          <PMediaDecrypter
            :i="i"
            :file-pointer="pointer"
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
