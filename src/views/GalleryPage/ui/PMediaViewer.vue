<script lang="ts">
import PMedia from './PMedia.vue';
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import { useSnackbarStore } from '@/components/snackbars';
import { swipeLeftOn, swipeRightOn, touchXDiff } from '@/utils/touchUtils';

import type { IMediaViewerShowingRequestWrapper, IModifiedFileSystemFileHandle } from './../types';

const $props = defineProps<{
  fileHandles: IModifiedFileSystemFileHandle[];
}>();

const snackbarStore = useSnackbarStore();

const currentViewRequest = ref<null | IMediaViewerShowingRequestWrapper>(null);
const currentViewedFile = computed(() => {
  if (!currentViewRequest.value) {
    return null;
  }

  const handle = $props.fileHandles[currentViewRequest.value.index];

  return {
    preparedFile: handle.__preparedFile?.value ?? null,
    fileType: handle.__file?.value?.type ?? null,
  };
});
watch(currentViewedFile, (value) => {
  if (value !== null && (value.fileType === null || value.preparedFile === null)) {
    snackbarStore.showSnackbar().error({
      title: 'Не удается отобразить файл',
      text: `Не удалось получить тип файла или сами данные файла для просмотра в MediaViewer\nfileType="${value.fileType}"\npreparedFile=${value.preparedFile}`,
    });
  }
});

const showNextMedia = () => {
  if (!currentViewRequest.value) {
    return;
  }

  if (currentViewRequest.value.index === $props.fileHandles.length - 1) {
    return;
  }

  currentViewRequest.value = {
    index: currentViewRequest.value.index + 1,
  };
};
swipeLeftOn(showNextMedia);

const showPrevMedia = () => {
  if (!currentViewRequest.value) {
    return;
  }
  if (currentViewRequest.value.index === 0) {
    return;
  }

  currentViewRequest.value = {
    index: currentViewRequest.value.index - 1,
  };
};
swipeRightOn(showPrevMedia);

const transformByTouchXDiff = computed(() => {
  return `translateX(${(-1 * touchXDiff.value) / 10}px)`;
});

const viewMedia = (request: IMediaViewerShowingRequestWrapper) => {
  currentViewRequest.value = request;
};
defineExpose({ viewMedia });
</script>

<template>
  <VDialog
    fullscreen
    opacity="0"
    :model-value="currentViewRequest !== null"
  >
    <VFadeTransition>
      <VSheet
        v-if="currentViewedFile && currentViewedFile.fileType && currentViewedFile.preparedFile"
        class="gallery__media-viewer-card"
      >
        <div class="gallery__media-viewer-actions">
          <VBtn
            size="x-large"
            :ripple="false"
            color="secondary-darken-1"
            text="Назад"
            @click="showPrevMedia"
          />
          <VBtn
            width="100%"
            size="x-large"
            :ripple="false"
            text="Назад"
            @click="currentViewRequest = null"
          />
          <VBtn
            size="x-large"
            :ripple="false"
            color="secondary-darken-1"
            text="Вперед"
            @click="showNextMedia"
          />
        </div>
        <div
          class="gallery__media-viewer-inner"
          :style="{ transform: transformByTouchXDiff }"
        >
          <PMedia
            :file="currentViewedFile.preparedFile"
            :file-type="currentViewedFile.fileType"
            in-viewer
          />
        </div>
      </VSheet>
    </VFadeTransition>
  </VDialog>
</template>

<style scoped>
.gallery__media-viewer-card {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  align-items: center;
  justify-items: center;
  overflow: hidden !important;
}

.gallery__media-viewer-actions {
  width: 100vw;
}

.gallery__media-viewer-actions > *:not(:nth-child(2)) {
  display: none;
}

.gallery__media-viewer-inner {
  max-width: min(720px, 100vw);
  max-height: 90vh;

  transition: 60ms;

  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
}

/* https://habr.com/ru/sandbox/163605/?code=d7a09e1d4f5ad5f9acaaa50d65343834&state=2MWroJlpglNPOyEjY6N2XZ6a&hl=ru */
@media (pointer: fine), (pointer: none) {
  .gallery__media-viewer-actions {
    display: grid;
    grid-template-columns: minmax(150px, 250px) minmax(150px, 1fr) minmax(150px, 250px);
    overflow: auto;
  }

  .gallery__media-viewer-actions > *:not(:nth-child(2)) {
    display: block;
  }
}
</style>
