<script setup lang="ts">
import { ref } from 'vue';

import { useSnackbarStore } from '@/components/snackbars';
import { useTheStore } from '@/store';

import { encrypt } from '@/utils/encryption';

import { intToArrayBuffer } from '@/utils/intArrBufferCasts';
import { strToArrayBuffer } from '@/utils/strArrBufferCasts';

import { type IEncryptedFile } from '../types';

defineOptions({
  name: 'PEncryptingCard',
});

const $emit = defineEmits<{
  filesUploaded: [];
  filesEcnrypted: [IEncryptedFile[]];
}>();

const snackbarStore = useSnackbarStore();
const theStore = useTheStore();

const BYTES_PER_FILE_SIZE = 5;
const MAX_FILE_SIZE_PER_5_BYTES = 1_099_511_627_775;

const files = ref<File[]>([]);
const encryptionInProccess = ref(false);
let lastEncryptionAbort = null as null | (() => void);
const encryptedFilesQnt = ref(0);
const startEncryption = async () => {
  if (!theStore.cryptoKey) {
    snackbarStore.showSnackbar().error({
      text: 'Перед шифрованием нужно сгенерировать ключ',
    });
    return;
  }

  if (files.value.length === 0) {
    snackbarStore.showSnackbar().error({
      text: 'Не выбраны файлы для шифрования',
    });
    return;
  }

  let encryptionAborted = false;
  lastEncryptionAbort = () => (encryptionAborted = true);
  encryptedFilesQnt.value = 0;
  encryptionInProccess.value = true;

  const encryptionPromises: Promise<IEncryptedFile | Error>[] = [];

  for (const file of files.value) {
    encryptionPromises.push(
      (async () => {
        if (!theStore.cryptoKey) {
          throw new Error('Отсутствует ключ шифрования');
        }

        const buffer = await file.arrayBuffer();

        if (file.size >= MAX_FILE_SIZE_PER_5_BYTES) {
          const err = new Error('Размер файла ${file.name} слишком большой. Максимальный размер 1ТБ');
          err.cause = 'Размер файла слишком велик';
          throw err;
        }

        const sizeBuffer = intToArrayBuffer(file.size, BYTES_PER_FILE_SIZE);
        const typeBuffer = strToArrayBuffer(file.type);

        const encryptedBlob = await encrypt(theStore.cryptoKey, [
          // iv 12 bytes
          sizeBuffer, // 5 bytes
          buffer, // sizeBuffer bytes
          typeBuffer, // all bytes after buffer
        ]);
        encryptedFilesQnt.value++;
        return { blob: encryptedBlob, name: new Date(file.lastModified).toISOString().slice(0, 19) + '.cpp' };
      })(),
    );
  }

  const encryptionResults = await Promise.allSettled(encryptionPromises);

  if (encryptionAborted) {
    return;
  } else {
    encryptionResults
      .map((result) => (result.status === 'rejected' ? result.reason : null))
      .filter((err) => err !== null)
      .forEach((err) => {
        snackbarStore.showSnackbar().error({
          title: `${err.cause ?? 'Ошибка при шифровании файла'}`,
          text: err.message,
          life: 10000,
        });
      });

    const encryptionResultedFiles = encryptionResults
      .map((result) => (result.status === 'fulfilled' && !(result.value instanceof Error) ? result.value : null))
      .filter((file) => file !== null);

    $emit('filesEcnrypted', encryptionResultedFiles);
    encryptionInProccess.value = false;
  }
};

const abortEncryption = () => {
  encryptionInProccess.value = false;
  lastEncryptionAbort?.();
};

const onFileModelUpdate = (inputedFiles: File | File[]) => {
  if (!Array.isArray(inputedFiles)) {
    throw new Error('Вместо массива файлов File[] был передан File');
  }

  abortEncryption();
  $emit('filesUploaded');

  files.value = inputedFiles;
};

defineExpose({
  reset: () => {
    files.value = [];
  },
});
</script>
<template>
  <VCard
    title="Шифрование файлов"
    :loading="encryptionInProccess"
  >
    <template #loader="{ isActive }">
      <VProgressLinear
        :active="isActive"
        color="primary"
        height="4"
      >
        <VTooltip
          v-if="isActive"
          :text="`Зашифровано ${encryptedFilesQnt} из ${files.length} файлов`"
          activator="parent"
          location="top center"
          :model-value="true"
        >
        </VTooltip>
      </VProgressLinear>
    </template>

    <VCardText class="d-flex flex-column">
      <VFileInput
        label="Выбери файл"
        multiple
        small-chips
        :model-value="files"
        @update:modelValue="onFileModelUpdate"
      ></VFileInput>
      <div class="d-flex flex-column mt-4">
        <VBtn
          color="warning"
          class="w-100 mb-8"
          size="x-large"
          text="Прервать"
          :disabled="!encryptionInProccess"
          @click="abortEncryption"
        />
        <VBtn
          color="primary"
          size="x-large"
          class="w-100"
          text="Подтвердить"
          :loading="encryptionInProccess"
          @click="startEncryption"
        />
      </div>
    </VCardText>
  </VCard>
</template>
