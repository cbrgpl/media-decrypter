<script lang="ts"></script>

<script lang="ts" setup>
import { computed } from 'vue';

import { useTheStore } from '@/store';
import { useSnackbarStore } from '@/components/snackbars';
import { useSubmitDialogStore } from '@/components/singletons/ZSubmitDialog';
import { saveFile } from '@/utils/saveFile';

import { useSaltHint } from '../composables/useSaltHint';

defineOptions({
  name: 'PViewCard',
});

const snackbarStore = useSnackbarStore();
const submitDialogStore = useSubmitDialogStore();
const theStore = useTheStore();

const { saltHint } = useSaltHint(computed(() => theStore.salt));
const COUNT_OF_COLUMNS_FOR_PRETTY_PASSPHRASE = 2;
const prettyPasshprase = computed(() => {
  if (theStore.passphrase === null) {
    return null;
  }

  const words = theStore.passphrase.split(' ');

  const columns: Array<{ word: string; order: number }[]> = [];
  const wordsPerColumn = words.length / COUNT_OF_COLUMNS_FOR_PRETTY_PASSPHRASE;
  for (let i = 0; i < COUNT_OF_COLUMNS_FOR_PRETTY_PASSPHRASE; ++i) {
    columns.push(
      words.slice(i * wordsPerColumn, (i + 1) * wordsPerColumn).map((word, colInx) => ({
        word,
        order: i * wordsPerColumn + colInx + 1,
      })),
    );
  }

  console.log(columns);

  return columns;
});

const downloadSalt = () => {
  if (theStore.salt === null) {
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  saveFile(`salt_${date}.txt`, new Blob([theStore.salt?.toString()]));

  snackbarStore.showSnackbar().success({
    text: 'Файл начал скачиваться',
    life: 2000,
  });
};

const resetCryptoKey = async () => {
  submitDialogStore.submit({
    title: 'Сбросить ключ?',
    text: 'Если сбросить ключ, то файлы, хранящиеся в приложении не смогут быть расшифрованы в следующий раз, когда ты зайдешь. Ключ нужно будет ввести заново и только потом можно будет смотреть файлы',
    onSubmit() {
      theStore.resetPassphrase();
    },
  });
};
</script>

<template>
  <VCard>
    <VCardText>
      <div class="mb-8">
        <VBtn
          class="w-100 mb-1"
          color="secondary"
          size="x-large"
          text="Скачать соль"
          @click="downloadSalt"
        />
        <span class="text-info">
          {{ saltHint }}
        </span>
      </div>

      <ol>
        <VBtn
          class="w-100 mb-2"
          size="x-large"
          color="error"
          text="Сбросить ключ"
          @click="resetCryptoKey"
        />
        <span
          v-if="theStore.cryptoKey"
          class="text-info d-flex"
        >
          <ol
            v-for="(col, i) of prettyPasshprase"
            :key="i"
            class="crypto-key__words-list"
          >
            <li
              v-for="word of col"
              :key="word.order"
              class="mb-0.5"
            >
              <strong>{{ word.order }}.</strong> {{ word.word }}
            </li>
          </ol>
        </span>
      </ol>
    </VCardText>
  </VCard>
</template>

<style scoped>
.crypto-key__words-list {
  padding: 0;
  list-style: none;
  margin-right: 20px;
}
</style>
