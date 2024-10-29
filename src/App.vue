<script lang="ts">
import ZSnackbars from './components/snackbars';
import ZSystemBar from './components/singletons/ZSystemBar.vue';
import ZSubmitDialog from './components/singletons/ZSubmitDialog/ui/ZSubmitDialog.vue';
</script>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import { deriveKey } from '@/utils/encryption';

import { useTheStore } from './store';

const tabs: Array<{ routeName: string; title: string }> = [
  { routeName: 'CryptoKey', title: 'Ключ шифрования' },
  { routeName: 'Encrypter', title: 'Зашифровать' },
  { routeName: 'Gallery', title: 'Галерея' },
];

const theStore = useTheStore();

const generateCryptoFromCache = async () => {
  if (theStore.passphrase && theStore.salt) {
    const cryptoKey = await deriveKey(theStore.passphrase, theStore.salt);
    theStore.cryptoKey = cryptoKey;
  }
};

generateCryptoFromCache();

const router = useRouter();

const goToPage = (v: unknown) => {
  if (!router.currentRoute.value.name) {
    return;
  }

  router.push({ name: v as string });
};
</script>

<template>
  <div>
    <VApp class="h-screen">
      <ZSnackbars />
      <ZSystemBar />
      <ZSubmitDialog />

      <VAppBar>
        <VTabs
          class="w-100"
          fixed-tabs
          :model-value="router.currentRoute.value.name"
          @update:modelValue="goToPage"
        >
          <VTab
            v-for="tab of tabs"
            :key="tab.routeName"
            :value="tab.routeName"
          >
            <span class="link text-h5">
              {{ tab.title }}
            </span>
          </VTab>
        </VTabs>
      </VAppBar>

      <VMain class="app__main">
        <RouterView v-slot="{ Component }">
          <VFadeTransition mode="out-in">
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </VFadeTransition>
        </RouterView>
      </VMain>
    </VApp>
  </div>
</template>

<style scoped>
.app__main {
  overflow: auto;
  height: 100%;
}
</style>
