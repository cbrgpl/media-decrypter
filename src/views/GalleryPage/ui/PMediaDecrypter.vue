<script lang="ts">
import PMedia from './PMedia.vue';
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useTheStore } from '@/store';
import { decrypt } from '@/utils/encryption';
import { strFromArrayBuffer } from '@/utils/strArrBufferCasts';
import { intFromArrayBuffer } from '@/utils/intArrBufferCasts';

import { EMediaType } from '../consts';
import type { IPreparedFile, IMediaViewerShowingRequestWrapper, IEFilePointerViewerMod } from '../types';

defineOptions({
  name: 'PMediaDecrypter',
});

const $props = defineProps<{
  filePointer: IEFilePointerViewerMod;
  i: number;
}>();

const $emit = defineEmits<{
  showInMediaViewer: [IMediaViewerShowingRequestWrapper];
}>();

const theStore = useTheStore();

const CPP_EXT_REGEXP = /\.cpp$/;

const FILE_MEDIA_TYPE_REGEXP_IMAGE = /image/;
const FILE_MEDIA_TYPE_REGEXP_VIDEO = /video/;

const getMediaType = (fileType: string) => {
  if (FILE_MEDIA_TYPE_REGEXP_IMAGE.test(fileType)) {
    return EMediaType.IMAGE;
  } else if (FILE_MEDIA_TYPE_REGEXP_VIDEO.test(fileType)) {
    return EMediaType.VIDEO;
  } else {
    return null;
  }
};

const file = ref<File | null>(null);
const preparedFile = computed<IPreparedFile | null>(() => {
  if (!file.value) {
    return null;
  }

  return {
    mediaType: getMediaType(file.value.type),
    name: file.value.name,
    url: URL.createObjectURL(file.value),
  };
});
// TODO refactor for file pointer logic
$props.filePointer.__raw.setPreparedFileRef(preparedFile, file);

const BYTES_PER_IV = 12;
const BYTES_PER_SIZE = 5;

const failedEcryptionMsg = ref<null | string>(null);
const failedEcryptionTooltipVisible = ref(false);

const decryptFile = async (encryptedFile: File) => {
  try {
    if (!theStore.cryptoKey) {
      failedEcryptionMsg.value = 'Ключ шифрования не установлен. Этот этап не должен был наступить без ключа...';
      return null;
    }

    const encryptedContent = await encryptedFile.arrayBuffer();
    const decryptedContent = await decrypt(theStore.cryptoKey, encryptedContent as ArrayBuffer, {
      ivLen: BYTES_PER_IV,
    });

    const fileBytesLength = intFromArrayBuffer(decryptedContent.slice(0, BYTES_PER_SIZE));
    const fileType = strFromArrayBuffer(decryptedContent.slice(BYTES_PER_SIZE + fileBytesLength));
    const decryptedFile = new File(
      [decryptedContent.slice(BYTES_PER_SIZE, BYTES_PER_SIZE + fileBytesLength)],
      encryptedFile.name.replace(CPP_EXT_REGEXP, ''),
      {
        type: fileType,
      },
    );

    return decryptedFile;
  } catch (err) {
    if (err instanceof Error && err.name === 'OperationError') {
      failedEcryptionMsg.value = 'Ключ не подходит к файлу';
      return null;
    }

    failedEcryptionMsg.value =
      err instanceof Error ? `name=${err.name};msg=${err.message}${err.cause ? ';cause=' + err.cause : ''}` : `${err}`;
    return null;
  }
};

const extractImageFromFileHandle = async () => {
  const encryptedFile = await $props.filePointer.getEncryptedFile();

  if (!encryptedFile) {
    failedEcryptionMsg.value = 'Приложению не удалось получить файл по указателю[pointer]';
    return;
  }

  const decryptedFile = await decryptFile(encryptedFile.file);
  file.value = decryptedFile;
};

extractImageFromFileHandle();

const emitShowingInMediaViewer = () => {
  $emit('showInMediaViewer', {
    index: $props.i,
  });
};
</script>

<template>
  <div
    class="gallery__media-decrypted"
    @click="emitShowingInMediaViewer"
  >
    <div
      v-if="failedEcryptionMsg"
      class="pa-1 d-flex flex-column w-100 h-100"
    >
      <div class="gallery__media-decrypted-err line-clamp-3">
        {{ failedEcryptionMsg }}
      </div>
      <VTooltip
        :text="failedEcryptionMsg"
        :model-value="failedEcryptionTooltipVisible"
        location="top"
      >
        <template #activator="{ isActive, props }">
          <VBtn
            v-bind="props"
            class="ms-auto mt-auto"
            :ripple="false"
            :active="isActive"
            color="error"
            size="24"
            @click="failedEcryptionTooltipVisible = !failedEcryptionTooltipVisible"
          >
            <VIcon
              size="16"
              icon="mdi-alert-circle-outline"
            />
          </VBtn>
        </template>
      </VTooltip>
    </div>
    <PMedia
      v-else-if="file !== null && preparedFile !== null"
      :file="preparedFile"
      :file-type="file.type"
    />
  </div>
</template>

<style scoped>
.gallery__media-decrypted {
  background: #444;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1;
}

.gallery__media-decrypted-err {
  font-size: 12px;
}
</style>
