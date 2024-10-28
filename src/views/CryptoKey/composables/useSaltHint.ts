import { type Ref, computed } from 'vue';
export const useSaltHint = (salt: Ref<Uint8Array<ArrayBuffer> | null>) => {
  return {
    saltHint: computed(() =>
      salt.value
        ? `Текущая соль ${salt.value.slice(0, 3).toString()}, ..., ${salt.value.slice(salt.value.length - 3).toString()}`
        : null,
    ),
  };
};
