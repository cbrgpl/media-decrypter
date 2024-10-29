<script lang="ts">
import PMedia from './PMedia.vue';
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { swipeLeftOn, swipeRightOn, touchXDiff } from '@/utils/touchUtils';

import type { IMediaViewerShowingRequestWrapper, IEFilePointerViewerMod } from './../types';
import { useSubmitDialogStore } from '@/components/singletons/ZSubmitDialog';
import { useSnackbarStore } from '@/components/snackbars';

defineOptions({
  name: 'PMediaViewer',
});

const $props = defineProps<{
  eFilePointers: IEFilePointerViewerMod[];
}>();

const $emit = defineEmits<{
  remove: [fileId: string];
}>();

const submitDialogStore = useSubmitDialogStore();
const snackbarStore = useSnackbarStore();

const dialogVisible = ref(false);

const currentViewRequest = ref<null | IMediaViewerShowingRequestWrapper>(null);
const currentViewedFile = computed(() => {
  if (!currentViewRequest.value) {
    return null;
  }
  const pointer = $props.eFilePointers[currentViewRequest.value.index];

  return {
    preparedFile: pointer.__raw.preparedFile?.value ?? null,
    fileType: pointer.__raw.file?.value?.type ?? null,
    fileId: pointer.fileId,
    fileName: pointer.fileName,
  };
});

const showNextMedia = () => {
  if (!currentViewRequest.value) {
    return;
  }

  if (currentViewRequest.value.index === $props.eFilePointers.length - 1) {
    return;
  }

  currentViewRequest.value = {
    index: currentViewRequest.value.index + 1,
  };
};

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

swipeLeftOn(showNextMedia);
swipeRightOn(showPrevMedia);

const hideDialog = () => {
  dialogVisible.value = false;
  currentViewRequest.value = null;
};

const removeFile = () => {
  if (!currentViewedFile.value || !currentViewRequest.value) {
    return;
  }

  submitDialogStore.submit({
    title: `Удалить файл "${currentViewedFile.value.fileName}"?`,
    text: 'Он будет полностью удален из приложения, и в дальнейшем его придется импортировать заново',
    onSubmit() {
      if (!currentViewedFile.value || !currentViewRequest.value) {
        snackbarStore.showSnackbar().error({
          title: 'Не получилось удалить',
          text: 'Когда я попытался удалить файл, то он уже был недоступен. Попытайся снова',
        });
        return;
      }

      $emit('remove', currentViewedFile.value.fileId);

      if ($props.eFilePointers.length === 1) {
        hideDialog();
      } else if (currentViewRequest.value.index === $props.eFilePointers.length - 1) {
        showPrevMedia();
      }
    },
  });
};

const transformByTouchXDiff = computed(() => {
  return `translateX(${(-1 * touchXDiff.value) / 10}px)`;
});

const viewMedia = (request: IMediaViewerShowingRequestWrapper) => {
  currentViewRequest.value = request;
  dialogVisible.value = true;
};
defineExpose({ viewMedia });
</script>

<template>
  <VDialog
    fullscreen
    opacity="0"
    close-on-back
    :model-value="dialogVisible"
    @afterLeave="hideDialog"
  >
    <VFadeTransition>
      <VSheet class="gallery__media-viewer-card">
        <div class="gallery__media-viewer-actions">
          <VBtn
            size="x-large"
            :ripple="false"
            color="secondary-darken-1"
            text="Назад"
            class="desktop-only"
            @click="showPrevMedia"
          />
          <div class="d-flex flex-grow-1">
            <VBtn
              color="error"
              size="x-large"
              @click="removeFile"
            >
              <VIcon icon="mdi-delete-empty" />
            </VBtn>
            <VBtn
              size="x-large"
              class="flex-grow-1"
              :ripple="false"
              text="Назад"
              @click="hideDialog"
            />
          </div>
          <VBtn
            size="x-large"
            :ripple="false"
            color="secondary-darken-1"
            class="desktop-only"
            text="Вперед"
            @click="showNextMedia"
          />
        </div>

        <div
          class="gallery__media-viewer-inner"
          :style="{ transform: transformByTouchXDiff }"
        >
          <PMedia
            v-if="currentViewedFile && currentViewedFile.fileType && currentViewedFile.preparedFile"
            :file="currentViewedFile.preparedFile"
            :file-type="currentViewedFile.fileType"
            in-viewer
          />
          <div
            v-else
            class="mx-auto"
          >
            Что-то не могу отобразить :(
          </div>
        </div>

        <span
          v-if="!currentViewedFile?.preparedFile"
          class="d-flex align-center position-absolute left-0 bottom-0 pa-1"
        >
          {{ currentViewedFile?.fileName }}
        </span>
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
  position: relative;
}

.gallery__media-viewer-actions {
  width: 100vw;
  display: flex;
}

.gallery__media-viewer-actions > .desktop-only {
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
    grid-template-columns: minmax(150px, 250px) minmax(auto, 1fr) minmax(150px, 250px);
    overflow: auto;
  }

  .gallery__media-viewer-actions > *:not(:nth-child(2)) {
    display: block;
  }
}
</style>
