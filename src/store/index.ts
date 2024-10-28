import { ref, readonly } from 'vue';
import { defineStore } from 'pinia';

const STORAGE_NAMES = {
  passphrase: 'q_passphrase',
  salt: 'q_salt',
};

const stringifiedNumbersToUint8 = (numbers: string | null) =>
  numbers ? Uint8Array.from(numbers.split(',').map((num) => parseInt(num))) : null;

export const useTheStore = defineStore('the', () => {
  const cryptoKey = ref<CryptoKey | null>(null);
  // !Behove М@имозыря In#scrutable Зав$се Mend%acious Зыбка^ Имение& Penulti*mate Ненаши Рута Тягло Tidbit Bedlam Ество Permutatio Несть Остуда Пазуха Jabberwocky Сквибидитуалет
  const passphrase = ref<null | string>(localStorage.getItem(STORAGE_NAMES.passphrase));
  const salt = ref<Uint8Array<ArrayBuffer> | null>(stringifiedNumbersToUint8(localStorage.getItem(STORAGE_NAMES.salt)));

  return {
    cryptoKey: cryptoKey,
    passphrase: readonly(passphrase),
    salt: readonly(salt),
    usePassphrase: (passphraseIn: string, saltIn: Uint8Array<ArrayBuffer>) => {
      passphrase.value = passphraseIn;
      localStorage.setItem(STORAGE_NAMES.passphrase, passphraseIn);

      salt.value = saltIn;
      localStorage.setItem(STORAGE_NAMES.salt, saltIn.toString());

      cryptoKey.value = null;
    },
    resetPassphrase: () => {
      passphrase.value = null;
      localStorage.removeItem(STORAGE_NAMES.passphrase);

      salt.value = null;
      localStorage.removeItem(STORAGE_NAMES.salt);

      cryptoKey.value = null;
    },
  };
});
