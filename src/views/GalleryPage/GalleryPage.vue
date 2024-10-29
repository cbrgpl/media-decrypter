<script lang="ts">
import PMediaInput from './ui/PMediaInput.vue';
import PMediaGrid from './ui/PMediaGrid.vue';
import PMediaViewer from './ui/PMediaViewer.vue';
</script>

<script setup lang="ts">
import { markRaw, ref, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useSnackbarStore } from '@/components/snackbars';

import type { IMediaViewerShowingRequestWrapper, IEFilePointerViewerMod, IEFilePointer } from './types';
import { dbGetAll, EDbStore, dbDelete } from './utils/db';
import { getEFilePointerFactory } from './utils/getEFilePointerFactory';

const route = useRoute();

const snackbarStore = useSnackbarStore();
const { newEFilePointer } = getEFilePointerFactory(snackbarStore);

const $scrollingContainer = useTemplateRef('scrolling-container');
const $viewer = useTemplateRef<InstanceType<typeof PMediaViewer>>('viewer');

const modifyPointerForViewer = (pointer: IEFilePointer): IEFilePointerViewerMod => ({
  ...pointer,
  __raw: markRaw({
    setPreparedFileRef(this: IEFilePointerViewerMod['__raw'], preparedFile, file) {
      this.preparedFile = preparedFile;
      this.file = file;
    },
  }),
});

const eFilePointers = ref<IEFilePointerViewerMod[]>([]);
const loadEFilePointersFromDb = async () => {
  try {
    const pointers = await dbGetAll(EDbStore.POINTER);
    eFilePointers.value = pointers.map((pointerIn) => {
      const pointer = newEFilePointer(pointerIn);
      return modifyPointerForViewer(pointer);
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : `${err}`;
    snackbarStore.showSnackbar().error({
      title: 'Приложению не удалось получить указать[pointer]',
      text: msg,
    });
  }
};

watch(
  () => route.name,
  () => {
    if (route.name === 'Gallery') {
      loadEFilePointersFromDb();
    }
  },
  { immediate: true },
);

const pushNewPointers = (pointers: IEFilePointer[]) => {
  eFilePointers.value.push(...pointers.map((pointer) => modifyPointerForViewer(pointer)));
};

const showFileInMediaViewer = (requestWrapper: IMediaViewerShowingRequestWrapper) => {
  $viewer.value?.viewMedia(requestWrapper);
};

const removeFile = async (fileId: string) => {
  try {
    await dbDelete(EDbStore.FILE, fileId);
    await dbDelete(EDbStore.POINTER, fileId);

    const pointerInx = eFilePointers.value.findIndex((pointer) => pointer.fileId == fileId);
    if (pointerInx !== -1) {
      eFilePointers.value.splice(pointerInx, 1);
    } else {
      throw new Error('Не удалось удалить указатель, т.к. он не был найден в списке указателей');
    }
  } catch (err) {
    snackbarStore.showSnackbar().error({
      title: 'Ошибка при удалении',
      text: err instanceof Error ? err.message : `${err}`,
    });
  }
};
</script>
<template>
  <div
    ref="scrolling-container"
    class="gallery"
  >
    <PMediaViewer
      ref="viewer"
      :e-file-pointers="eFilePointers"
      @remove="removeFile"
    />
    <PMediaInput @filesUploaded="pushNewPointers" />

    <PMediaGrid
      class="gallery__media"
      :scrolling-container="$scrollingContainer"
      :e-file-pointers="eFilePointers"
      @showInMediaViewer="showFileInMediaViewer"
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

.gallery__media {
  flex-grow: 1;
}
</style>
