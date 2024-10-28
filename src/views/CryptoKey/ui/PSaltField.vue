<script lang="ts"></script>

<script lang="ts" setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import type { VFileInput } from 'vuetify/components';

import { useSnackbarStore } from '@/components/snackbars';
import { generateSalt } from '@/utils/encryption';

import { useSaltHint } from '../composables/useSaltHint';

defineOptions({
  name: 'PSaltField',
});

const $props = defineProps<{
  salt: Uint8Array<ArrayBuffer> | null;
}>();

const $emit = defineEmits<{
  'update:salt': [Uint8Array<ArrayBuffer> | null];
}>();

const snackbarStore = useSnackbarStore();

const { saltHint } = useSaltHint(computed(() => $props.salt));

type USaltOrigin = 'file' | 'generation';
const saltOrigin = ref<USaltOrigin | null>(null);

const $fileInput = useTemplateRef<InstanceType<typeof VFileInput>>('fileInput');

const SALT_TESTING_REGEXP = /^(\d{1,3},?)+$/;
const saltFileHandlingInProccess = ref(false);
const fileWithSaltUploaded = async (file?: File | File[]) => {
  if (Array.isArray(file)) {
    throw new Error('Why I caught an File[] while getting salt from a file');
  }

  if (!file) {
    saltOrigin.value = null;
    $emit('update:salt', null);
    return;
  }

  try {
    console.log(file.type);
    if (file.type !== 'text/plain') {
      snackbarStore.showSnackbar().error({
        title: 'Какой-то не такой файл',
        text: 'Тип файла не тот, убедись, что выбираешь нужный файл',
      });
      return;
    }

    saltFileHandlingInProccess.value = true;
    const salt = await file.text();

    const saltIsValid = SALT_TESTING_REGEXP.test(salt);

    if (!saltIsValid) {
      snackbarStore.showSnackbar().error({
        title: 'Какой-то не такой файл',
        text: 'Соль не содержится в файли, либо она была повреждена',
      });

      $fileInput.value?.reset();
      return;
    }

    const arr = Uint8Array.from(salt.split(',').map((item) => +item));

    $emit('update:salt', arr);
    saltOrigin.value = 'file';
  } catch (err) {
    snackbarStore.showSnackbar().error({
      title: 'Ошибка загрузки соли',
      text: err instanceof Error ? err.message : `${err}`,
    });
  } finally {
    saltFileHandlingInProccess.value = false;
  }
};

const generateSaltOnClick = () => {
  saltOrigin.value = 'generation';
  $emit('update:salt', generateSalt());
  nextTick(() => {
    $fileInput.value?.validate();
  });
};

const resetSalt = () => {
  $emit('update:salt', null);
  saltOrigin.value = null;
  $fileInput.value?.reset();
};

const saltInputMethodsDisabled = computed(() => !!$props.salt || saltFileHandlingInProccess.value);

const saltValidators = [() => !!$props.salt || 'Нужно загрузить соль или сгенрировать ее через кнопку'];
</script>

<template>
  <div>
    <div class="d-flex flex-column">
      <VFileInput
        ref="fileInput"
        label="Загрузка соли"
        class="mb-4"
        :hint="saltHint ?? ''"
        persistent-hint
        :loading="saltFileHandlingInProccess"
        :disabled="saltInputMethodsDisabled"
        :rules="saltValidators"
        @update:modelValue="fileWithSaltUploaded"
      >
        <template #selection="{ fileNames }">
          <span class="line-clamp-1">
            {{ fileNames[0] }}
          </span>
        </template>
      </VFileInput>

      <VBtn
        color="primary"
        variant="outlined"
        class="mb-4"
        size="large"
        :disabled="saltInputMethodsDisabled"
        @click="generateSaltOnClick"
      >
        <template #prepend>
          <VIcon
            size="large"
            icon="mdi-shaker-outline"
          />
        </template>

        Сгенерировать
      </VBtn>
      <VBtn
        color="danger"
        variant="outlined"
        size="large"
        :disabled="!$props.salt"
        @click="resetSalt"
      >
        <template #prepend>
          <VIcon
            size="large"
            icon="mdi-trash-can"
          />
        </template>

        Сбросить
      </VBtn>
    </div>
  </div>
</template>

<style scoped></style>
