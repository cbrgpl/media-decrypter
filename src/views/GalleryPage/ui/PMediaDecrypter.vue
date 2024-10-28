<script lang="ts">
import PMedia from './PMedia.vue';
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useTheStore } from '@/store';
import { useSnackbarStore } from '@/components/snackbars';
import { decrypt } from '@/utils/encryption';
import { strFromArrayBuffer } from '@/utils/strArrBufferCasts';
import { intFromArrayBuffer } from '@/utils/intArrBufferCasts';

import { EMediaType } from '../consts';
import type { IPreparedFile, IMediaViewerShowingRequestWrapper, IModifiedFileSystemFileHandle } from '../types';

defineOptions({
  name: 'PMediaDecrypter',
});

const $props = defineProps<{
  fileHandle: IModifiedFileSystemFileHandle;
  i: number;
}>();

const $emit = defineEmits<{
  showInMediaViewer: [IMediaViewerShowingRequestWrapper];
}>();

const theStore = useTheStore();
const snackbarStore = useSnackbarStore();

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
const ready2UseFileWrapper = computed<IPreparedFile | null>(() => {
  if (!file.value) {
    return null;
  }

  return {
    mediaType: getMediaType(file.value.type),
    name: file.value.name,
    url: URL.createObjectURL(file.value),
  };
});
$props.fileHandle.__setPreparedFileRef(ready2UseFileWrapper, file);

const BYTES_PER_IV = 12;
const BYTES_PER_SIZE = 5;

const decryptFile = async (encryptedFile: File) => {
  try {
    if (!theStore.cryptoKey) {
      throw new Error('How the key could not be setted on this step?');
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
    snackbarStore.showSnackbar().error({
      title: 'Ошибка расшифрования',
      text: err instanceof Error ? err.message : `${err}`,
      life: 1500,
    });
    return null;
  }
};
const extractImageFromFileHandle = async () => {
  const encryptedFile = await $props.fileHandle.getFile();
  const decryptedFile = await decryptFile(encryptedFile);
  file.value = decryptedFile;
};

extractImageFromFileHandle();

const emitShowingInMediaViewer = () => {
  if (!file.value) {
    return;
  }

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
    <PMedia
      v-if="file !== null && ready2UseFileWrapper !== null"
      :file="ready2UseFileWrapper"
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
</style>
