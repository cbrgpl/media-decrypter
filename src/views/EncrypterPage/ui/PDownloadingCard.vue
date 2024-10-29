<script lang="ts">
import ZFilesListCard from '@/components/cards/ZFilesListCard';
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { saveFile } from '@/utils/saveFile';

import type { IEncryptedFile } from './../types';

defineOptions({
  name: 'ZDownloadingCard',
});

const $props = defineProps<{ encryptedFiles: IEncryptedFile[] }>();

const $emit = defineEmits<{
  filesDownloaded: [];
}>();

const files = computed(() =>
  $props.encryptedFiles.map(({ blob, name }) => new File([blob], name, { type: blob.type })),
);

const downloadEncryptedFiles = () => {
  for (const file of $props.encryptedFiles) {
    saveFile(file.name, file.blob);
  }

  $emit('filesDownloaded');
};
</script>
<template>
  <ZFilesListCard
    title="Зашифрованные файлы:"
    :files="files"
  >
    <div class="mt-8">
      <VBtn
        text="Скачать"
        class="w-100 mt-4"
        size="x-large"
        color="secondary"
        @click="downloadEncryptedFiles"
      />
    </div>
  </ZFilesListCard>
</template>
