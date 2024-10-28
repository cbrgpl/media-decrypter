<script lang="ts">
import PSaltField from './PSaltField.vue';
</script>
<script setup lang="ts">
import { ref, computed, reactive, useTemplateRef } from 'vue';

import { useTheStore } from '@/store';
import { deriveKey } from '@/utils/encryption';
import { useSnackbarStore } from '@/components/snackbars';

import { required } from './../utils/rules';

import type { VForm } from 'vuetify/components';

defineOptions({
  name: 'PGenerateCard',
});

const $form = useTemplateRef<InstanceType<typeof VForm>>('crypto-form');

const theStore = useTheStore();
const snackbarStore = useSnackbarStore();

type ICryptoKeyForm = { passphrase: null | string; salt: Uint8Array<ArrayBuffer> | null };
const form: ICryptoKeyForm = reactive({
  passphrase: theStore.passphrase,
  salt: theStore.salt,
});

const rules = {
  passphraseWordsQnt: (value: string) =>
    value.split(' ').filter((v) => v.length > 0).length === 20 || 'Кол-во слов должно быть 20',
};
const formValidators = {
  passphrase: [required('Нужно ввести фразу'), rules.passphraseWordsQnt],
};

const qntOfWordsInPassPhrase = computed(() =>
  form.passphrase ? `Кол-во слов: ${form.passphrase?.split(' ').filter((v) => v.length > 0).length}` : '',
);

const cryptoKeyGenerationInProccess = ref(false);
const deriveCryptoKey = async () => {
  if (!$form.value) {
    return;
  }

  const { valid } = await $form.value.validate();

  if (!valid || !form.passphrase || !form.salt) {
    snackbarStore.showSnackbar().error({
      text: 'Генерация не может быть начата, т.к. не вся нужная информация корректно введена',
    });
    return;
  }

  const cryptoKey = await deriveKey(form.passphrase, form.salt);

  theStore.usePassphrase(form.passphrase, form.salt);
  theStore.cryptoKey = cryptoKey;
};
</script>
<template>
  <VCard title="Управление ключом шифрования">
    <VCardText>
      <VForm
        ref="crypto-form"
        @submit.prevent="deriveCryptoKey"
      >
        <PSaltField v-model:salt="form.salt" />
        <VDivider class="my-8" />
        <div>
          <VTextarea
            v-model.trim="form.passphrase"
            class="crypto-key__pass-phrase-area mb-4"
            rows="12"
            :rules="formValidators.passphrase"
            label="Кодовая фраза"
            no-resize
          >
            <template #counter>
              {{ qntOfWordsInPassPhrase }}
            </template>
          </VTextarea>
        </div>

        <VBtn
          class="w-100"
          size="x-large"
          color="primary"
          :loading="cryptoKeyGenerationInProccess"
          type="submit"
          text="Сгенерировать ключ"
        />
      </VForm>
    </VCardText>
  </VCard>
</template>

<style scoped>
.crypto-key__pass-phrase-area {
  font-family: monospace;
}
</style>
