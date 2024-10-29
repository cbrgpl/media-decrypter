<script lang="ts">
import ZFilesListCard from '@/components/cards/ZFilesListCard';
import { VFileInput } from 'vuetify/components';
</script>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { useTheStore } from '@/store';
import { useSnackbarStore } from '@/components/snackbars';

import { dbAdd, dbIndex, EDbStore } from '../utils/db';
import { getEFilePointerFactory } from '../utils/getEFilePointerFactory';
import type { IEFilePointer } from './../types';

defineOptions({
  name: 'PMediaInput',
  inheritAttrs: false,
});

const internalLoadingState = ref(false);
const finalLoadingState = computed(() => internalLoadingState.value);

const $emit = defineEmits<{
  filesUploaded: [eFilePointers: IEFilePointer[]];
}>();

const snackbarStore = useSnackbarStore();
const theStore = useTheStore();

const { newEFilePointer } = getEFilePointerFactory(snackbarStore);

const eFiles = ref<File[]>([]);

const onFilesInput = async (files: File[] | File) => {
  if (!Array.isArray(files)) {
    snackbarStore.showSnackbar().error({
      text: 'Мне почему-то только один файл пришел, т.к. я не умею работать ТОЛЬКО с одним файлом, то ничего не могу поделать',
    });
    return;
  }

  internalLoadingState.value = true;

  const promises = [];
  for (const file of files) {
    promises.push(
      new Promise<File>(async (resolve, reject) => {
        const dbFile = await dbIndex(EDbStore.FILE, 'name', file.name);

        if (dbFile) {
          reject(file.name);
        } else {
          resolve(file);
        }
      }),
    );
  }

  const results = await Promise.allSettled(promises);

  results
    .filter((res) => res.status === 'rejected')
    .forEach((res) => {
      snackbarStore.showSnackbar().error({
        title: 'Дубликат',
        text: `Файл с именем "${res.reason}" уже есть в приложении`,
        life: 6000,
      });
    });

  eFiles.value = results.filter((res) => res.status === 'fulfilled').map((res) => res.value);

  internalLoadingState.value = false;
};

const onSubmit = async () => {
  if (!theStore.cryptoKey) {
    snackbarStore.showSnackbar().message({
      text: 'Нельзя начать расшифрование т.к. ключ не назначен',
    });
  }

  internalLoadingState.value = true;
  const eFilePointers: IEFilePointer[] = [];

  for (const file of eFiles.value) {
    try {
      const fileId = await dbAdd(EDbStore.FILE, { name: file.name, file });
      dbAdd(EDbStore.POINTER, {
        fileName: file.name,
        fileId: fileId,
      });

      eFilePointers.push(newEFilePointer({ fileId, fileName: file.name }));
    } catch (err) {
      snackbarStore.showSnackbar().error({
        title: 'Получил ошибку при сохранении в приложении',
        text: err instanceof Error ? err.message : `${err}`,
      });
    }
  }

  $emit('filesUploaded', eFilePointers);
  eFiles.value = [];
  internalLoadingState.value = false;
};
</script>
<template>
  <VCard
    :loading="finalLoadingState"
    class="gallery__card"
    title="Просмотр файлов в папке"
  >
    <VCardText>
      <VFileInput
        :model-value="eFiles"
        multiple
        :disabled="finalLoadingState"
        @update:modelValue="onFilesInput"
      />
      <VBtn
        color="primary"
        class="w-100"
        size="x-large"
        :disabled="!eFiles.length || finalLoadingState"
        text="Загрузить"
        @click="onSubmit"
      />
    </VCardText>
  </VCard>
  <VSlideYTransition>
    <ZFilesListCard
      v-if="eFiles.length"
      class="gallery__card mt-2"
      title="Выбранные файлы:"
      :files="eFiles"
    />
  </VSlideYTransition>
</template>

<style scoped>
.gallery__card {
  width: 100%;
  max-width: 720px;

  margin-bottom: 1rem;

  margin-inline-start: auto;
  margin-inline-end: auto;

  flex-shrink: 0;
}
</style>
