<script lang="ts">
import PDownloadingCard from './ui/PDownloadingCard.vue';
import PEncryptingCard from './ui/PEncryptingCard.vue';
</script>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

import type { IEncryptedFile } from './types';

defineOptions({
  name: 'EncrypterPage',
});

const $encryptingCard = useTemplateRef<InstanceType<typeof PEncryptingCard>>('encrypting-card');

const encryptedFiles = ref<IEncryptedFile[]>([]);

const reset = () => {
  encryptedFiles.value = [];
  $encryptingCard.value?.reset();
};
</script>

<template>
  <div class="encrypter">
    <PEncryptingCard
      ref="encrypting-card"
      class="encrypter__card mb-4"
      @filesUploaded="encryptedFiles = []"
      @filesEcnrypted="encryptedFiles = $event"
    />
    <VScrollYTransition>
      <PDownloadingCard
        v-if="encryptedFiles.length"
        class="encrypter__card"
        :encrypted-files="encryptedFiles"
        @filesDownloaded="reset"
      />
    </VScrollYTransition>
  </div>
</template>

<style scoped>
.encrypter {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 48px 12px;
}

.encrypter__card {
  width: 100%;
  max-width: 720px;

  margin-inline-start: auto;
  margin-inline-end: auto;
}

.encrypter__encrypted-file-chip {
  margin-inline-end: 0.5rem;
}

.encrypter__encrypted-file-chip:last {
  margin-inline-end: 0;
}
</style>
