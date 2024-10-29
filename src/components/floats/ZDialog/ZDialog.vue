<script setup lang="ts">
import { useSlots, ref, watch } from 'vue';

defineOptions({
  name: 'ZDialog',
});

const $props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    scrollable?: boolean;
    title?: string;
    persistent?: boolean;
    fullscreen?: boolean;
    disabled?: boolean;
    contentProps?: any;
    contentClass?: string;

    loading?: boolean;
    loaderTooltip?: string | null;
    showLoaderTooltipPermanently?: boolean;

    maxWidth?: string | number;
    minWidth?: string | number;
    maxHeight?: string | number;
    minHeight?: string | number;
    width?: string | number;
    height?: string | number;
  }>(),
  {
    title: '',
    scrollable: false,
    persistent: false,
    loading: false,
    loaderTooltip: null,
    showLoaderTooltipPermanently: false,
    fullscreen: false,
    boolean: false,
    contentClass: '',
  },
);

const $slots = useSlots();

defineSlots<{
  activator(props: { isActive: boolean; props: Record<string, any> }): any;
  default(): any;
  text(): any;
  title(): any;
  actions(): any;
}>();

const $emit = defineEmits<{
  'hidden': [$event?: undefined];
  'update:modelValue': [value: boolean];
}>();

const progressTooltipVisibleWhenPermanently = ref(false);
const loaderTooltipInProgress = ref('');
let i = 0;
let timeout: ReturnType<typeof setTimeout>;
const DOTS_UPDATE_TIME = 450;
const updateLoaderTooltipInProgress = (time: number = 0) => {
  timeout = setTimeout(() => {
    if ($props.loaderTooltip !== null) {
      loaderTooltipInProgress.value = $props.loaderTooltip + '.'.repeat(1 + (i++ % 3));
      updateLoaderTooltipInProgress(DOTS_UPDATE_TIME);
    }
  }, time);
};
watch(
  () => $props.loading,
  (loading) => {
    if (loading) {
      updateLoaderTooltipInProgress();
    } else {
      clearTimeout(timeout);
      loaderTooltipInProgress.value = '';
    }
  },
  { immediate: true },
);
</script>

<template>
  <VDialog
    :model-value="$props.modelValue"
    :scrollable="$props.scrollable"
    :persistent="$props.persistent"
    :fullscreen="$props.fullscreen"
    :content-props="$props.contentProps"
    :content-class="$props.contentClass"
    :min-height="$props.minHeight"
    :max-height="$props.maxHeight"
    :height="$props.height"
    :width="$props.width"
    :max-width="$props.maxWidth"
    :min-width="$props.minWidth"
    close-on-back
    transition="slide-y-reverse-transition"
    @afterLeave="$emit('hidden', $event)"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="props"
      />
    </template>

    <template #default>
      <slot name="default" />

      <VCard
        data-cy="dialog-card"
        height="100%"
        width="100%"
        class="flex-grow-1 my-n6"
        :loading="true"
        :title="!$slots.title ? $props.title || undefined : undefined"
      >
        <template #loader>
          <VProgressLinear
            v-if="$props.loading"
            indeterminate
            height="6"
            color="primary"
            @mouseenter="progressTooltipVisibleWhenPermanently = true"
            @mouseleave="progressTooltipVisibleWhenPermanently = false"
          >
            <VTooltip
              v-if="$props.loaderTooltip !== null"
              :text="loaderTooltipInProgress"
              activator="parent"
              location="top center"
              :model-value="
                $props.showLoaderTooltipPermanently ? $props.loading : progressTooltipVisibleWhenPermanently
              "
            >
            </VTooltip>
          </VProgressLinear>
        </template>
        <template
          v-if="$slots.title"
          #title
        >
          <slot name="title" />
        </template>
        <template #text>
          <slot name="text" />
        </template>
        <template
          v-if="$slots.actions"
          #default
        >
          <VCardActions>
            <slot name="actions" />
          </VCardActions>
        </template>
      </VCard>
    </template>
  </VDialog>
</template>

<style scoped>
:deep(.v-card__loader) {
  position: sticky;
  min-height: 6px;
}
</style>
