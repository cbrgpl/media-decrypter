<script setup lang="ts">
import { saveFile } from '@/utils/saveFile';

import type { IEncryptedFile } from './../types';

defineOptions({
  name: 'PDownloadingCard',
});

const $props = defineProps<{ encryptedFiles: IEncryptedFile[] }>();

const $emit = defineEmits<{
  filesDownloaded: [];
}>();

const downloadEncryptedFiles = () => {
  for (const file of $props.encryptedFiles) {
    saveFile(file.name, file.blob);
  }

  // encryptedFiles.value = [];
  // files.value = [];
  $emit('filesDownloaded');
};
</script>
<template>
  <VCard
    v-if="$props.encryptedFiles.length"
    class="encrypter__card"
  >
    <VCardTitle>
      <h4 class="mb-2">Зашифрованные файлы:</h4>
      <div class="d-flex">
        <VChip
          v-for="file of $props.encryptedFiles"
          :key="file.name"
          color="secondary"
          class="encrypter__encrypted-file-chip"
        >
          {{ file.name }}
        </VChip>
      </div>
    </VCardTitle>
    <VCardText>
      <div class="mt-8">
        <VBtn
          text="Скачать"
          class="w-100 mt-4"
          size="x-large"
          color="secondary"
          @click="downloadEncryptedFiles"
        />
      </div>
    </VCardText>
  </VCard>
</template>
