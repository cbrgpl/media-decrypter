<script lang="ts">
import PSnackbar from './PSnackbar.vue';
</script>

<script setup lang="ts">
import { useSnackbarStore } from '../model/snackbarStore';

defineOptions({
  name: 'PSnackbars',
});

const snackbarStore = useSnackbarStore();
</script>

<template>
  <div class="snackbars">
    <PSnackbar
      v-for="snackbar of snackbarStore.snackbars"
      :key="snackbar.id"
      :snackbar="snackbar"
    />
  </div>
</template>

<style scoped lang="scss">
.snackbars {
  position: absolute;
  width: 100%;
  height: 100vh;

  display: flex;
  flex-direction: column-reverse;

  align-items: center;
}
</style>
