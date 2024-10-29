<script setup lang="ts">
import { useSlots } from 'vue';

defineOptions({
  name: 'ZFilesListCard',
});

const $props = defineProps<{ title: string; files: File[] }>();

const $slots = useSlots();
</script>
<template>
  <VCard>
    <VCardTitle>
      <h4 class="mb-2">
        {{ title }}
      </h4>
      <div class="files-list__chips">
        <VChip
          v-for="file of $props.files"
          :key="file.name"
          color="secondary"
          class="encrypter__encrypted-file-chip"
        >
          {{ file.name }}
        </VChip>
      </div>
    </VCardTitle>
    <VCardText v-if="$slots.default">
      <slot />
    </VCardText>
  </VCard>
</template>

<style scoped>
.files-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
