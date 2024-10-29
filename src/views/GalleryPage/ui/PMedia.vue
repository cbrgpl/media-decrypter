<script setup lang="ts">
import { ref } from 'vue';

import { formatMilliseconds } from '@/utils/formatMilliseconds';

import { EMediaType } from '../consts';
import type { IPreparedFile } from '../types';

defineOptions({
  name: 'PMedia',
});

const $props = withDefaults(
  defineProps<{
    file: IPreparedFile;
    fileType: string;

    inViewer?: boolean;
  }>(),
  {
    inViewer: false,
  },
);

const onVideoClick = (e: MouseEvent) => {
  if ($props.inViewer) {
    return;
  }

  const $video = e.target as HTMLVideoElement;
  if ($video.paused) {
    e.preventDefault();
  }
};

const videoDuration = ref<string | null>(null);
const setVideoDuration = (e: Event) => {
  requestIdleCallback(() => {
    const $video = e.target as HTMLVideoElement;
    videoDuration.value = formatMilliseconds($video.duration * 1000);
  });
};
</script>

<template>
  <div class="gallery__media">
    <VImg
      v-if="$props.file.mediaType === EMediaType.IMAGE"
      class="gallery__image"
      :src="$props.file.url"
    />
    <div
      v-else-if="$props.file.mediaType === EMediaType.VIDEO"
      class="gallery__video-wrapper"
    >
      <span
        v-if="!$props.inViewer && videoDuration"
        class="gallery__video-time"
      >
        {{ videoDuration }}
        <VIcon
          icon="mdi-play-circle"
          class="ms-1"
          size="20"
        />
      </span>
      <video
        class="gallery__video"
        :controls="$props.inViewer"
        :autoplay="$props.inViewer"
        @click="onVideoClick"
        @loadedmetadata="setVideoDuration"
      >
        <source
          :src="$props.file.url"
          :type="$props.fileType"
        />
      </video>
    </div>
    <span v-else> "{{ $props.fileType }}" не поддерживаемый тип </span>
  </div>
</template>

<style scoped>
.gallery__media {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery__video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.gallery__video-time {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;

  font-weight: 500;

  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 4px;
}

.gallery__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.gallery__image > img) {
  object-fit: cover;
}

.gallery__video:focus-within {
  outline: none;
}
</style>
