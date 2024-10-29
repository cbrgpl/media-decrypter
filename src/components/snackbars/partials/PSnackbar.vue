<script setup lang="ts">
import { computed } from 'vue';
import { type ISnackbar, useSnackbarStore } from '../model/snackbarStore';

defineOptions({
  name: 'PSnackbar',
});

const $props = defineProps<{
  snackbar: ISnackbar;
}>();

const snackbarStore = useSnackbarStore();

const snackbarStylesByType = computed(() => {
  switch ($props.snackbar.type) {
    case 'error':
      return {
        color: 'error',
      };
    case 'success':
      return {
        color: 'success',
      };
    case 'message':
      return {
        color: 'message',
      };
    default:
      return {
        color: 'black',
      };
  }
});

const removeSnackbar = () => {
  snackbarStore.hideSnackbar($props.snackbar.id);
};
</script>

<template>
  <VSnackbar
    :attach="true"
    :model-value="true"
    close-on-content-click
    milti-line
    :vertical="!!$props.snackbar.title"
    :timeout="$props.snackbar.life"
    target="parent"
    class="snackbar"
    :content-props="{ class: 'position-static' }"
    :color="snackbarStylesByType.color"
  >
    <!-- Это костыль, т.к. у snackbar'а нет ивента @close -->
    <VCardText
      class="snackbar__close-event-analog"
      @vue:unmounted="removeSnackbar"
    />

    <h6
      v-if="$props.snackbar.title"
      class="text-subtitle-1"
    >
      {{ $props.snackbar.title }}
    </h6>
    <p>
      {{ $props.snackbar.text }}
    </p>
  </VSnackbar>
</template>

<style scoped lang="scss">
.snackbar {
  position: static;
  cursor: pointer;
  user-select: none;
  padding-top: 0;
}

.snackbar__close-event-analog {
  position: absolute;
  left: 0;
  top: 0;

  pointer-events: none;
  opacity: 0;
}
</style>
