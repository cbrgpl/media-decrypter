<script lang="ts">
import PMediaGrid from './ui/PMediaGrid.vue';
import PMediaViewer from './ui/PMediaViewer.vue';
</script>

<script setup lang="ts">
import { readonly, ref, shallowRef, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useTheStore } from '@/store';
import { useSnackbarStore } from '@/components/snackbars';

import type { IMediaViewerShowingRequestWrapper, IModifiedFileSystemFileHandle } from './types';

import { saveDirHandle, getDirHandle } from './utils/db';

const route = useRoute();

const snackbarStore = useSnackbarStore();
const theStore = useTheStore();

const dir = ref<FileSystemDirectoryHandle | null>(null);

const $scrollingContainer = useTemplateRef('scrolling-container');
const $viewer = useTemplateRef<InstanceType<typeof PMediaViewer>>('viewer');

const loader = ref(false);
const mediaGridCouldBeInDom = ref(true);
const filesHandles = shallowRef<Array<IModifiedFileSystemFileHandle>>([]);
const pickDir = async (requestDir?: boolean) => {
  if (!theStore.cryptoKey) {
    snackbarStore.showSnackbar().message({
      text: 'Нельзя начать шифрование т.к. ключ не назначен',
    });
    return;
  }

  loader.value = true;

  try {
    if (requestDir) {
      dir.value = await window.showDirectoryPicker();
      await saveDirHandle(dir.value);
    } else if (!dir.value) {
      snackbarStore.showSnackbar().error({
        text: 'Выбранная дирректория отсутствует, не могу загрузить и расшифровать файлы',
      });
      return;
    }

    /*
      // iv 12 bytes
      ENCRYPTED_PARTS:
      sizeBuffer, // 5 bytes
      buffer,     // sizeBuffer bytes
      typeBuffer, // all bytes after buffer
    */

    filesHandles.value = [];
    mediaGridCouldBeInDom.value = false;
    for await (const fileHandle of dir.value.values()) {
      if (fileHandle instanceof FileSystemDirectoryHandle) {
        snackbarStore.showSnackbar().error({
          title: 'Папки не поддерживаются',
          text: 'При обработке папки с зашифрованными файлами была найдена внутренняя папка. Она была проигнорирована вместе со своим содержимым',
        });
        continue;
      }

      const castedFileHandle = fileHandle as unknown as IModifiedFileSystemFileHandle;
      castedFileHandle.__setPreparedFileRef = (preparedFileRef, fileRef) => {
        castedFileHandle.__preparedFile = preparedFileRef;
        castedFileHandle.__file = readonly(fileRef);
      };

      filesHandles.value.push(castedFileHandle);
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('The user aborted a request')) {
      return;
    }

    const msg = err instanceof Error ? err.message : `${err}`;
    snackbarStore.showSnackbar().error({
      title: 'Непредвиденная ошибка была получена',
      text: 'Ошибка в процессе загрузки файлов в приложение.' + ' ' + msg,
    });
  } finally {
    mediaGridCouldBeInDom.value = true;
    loader.value = false;
  }
};

const showFileInMediaViewer = (requestWrapper: IMediaViewerShowingRequestWrapper) => {
  $viewer.value?.viewMedia(requestWrapper);
};

const loadEncryptedFileOnInit = async () => {
  loader.value = true;
  dir.value = await getDirHandle();
  if (dir.value) {
    pickDir(false);
  } else {
    loader.value = false;
  }
};

watch(
  () => route.name,
  (name) => {
    if (name === 'Gallery') {
      loadEncryptedFileOnInit();
    }
  },
  { immediate: true },
);
</script>
<template>
  <div
    ref="scrolling-container"
    class="gallery"
  >
    <VCard
      :loading="loader"
      class="gallery__card"
      title="Просмотр файлов в папке"
    >
      <VCardText>
        <VTextField
          :model-value="dir?.name"
          readonly
        />
        <VBtn
          color="primary"
          class="w-100"
          size="x-large"
          text="Выбрать"
          @click="pickDir"
        />
      </VCardText>
    </VCard>

    <template v-if="filesHandles.length === 0">
      <VDivider class="mb-4" />
      <h5 class="text-h5 text-center">Пусто тут</h5>
    </template>
    <PMediaGrid
      v-if="mediaGridCouldBeInDom"
      class="gallery__media"
      :scrolling-container="$scrollingContainer"
      :file-handles="filesHandles"
      @showInMediaViewer="showFileInMediaViewer"
    />

    <PMediaViewer
      ref="viewer"
      :file-handles="filesHandles"
    />
  </div>
</template>

<style scoped>
.gallery {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 48px 12px;
  padding-bottom: 0;
}

.gallery__card {
  width: 100%;
  max-width: 720px;

  margin-bottom: 1rem;

  margin-inline-start: auto;
  margin-inline-end: auto;

  flex-shrink: 0;
}

.gallery__media {
  flex-grow: 1;
}
</style>
