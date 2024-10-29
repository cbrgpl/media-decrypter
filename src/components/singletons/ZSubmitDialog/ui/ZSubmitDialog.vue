<script lang="ts">
import ZDialog from '@/components/floats/ZDialog';
</script>

<script setup lang="ts">
import { ref, computed, type Raw, type Ref } from 'vue';

import { useSubmitDialogStore, type ISubmitionRequest, type UOnAbortCallingContext } from '../model/submitDialog';

defineOptions({
  name: 'ZSubmitDialog',
});

const submitDialogStore = useSubmitDialogStore();

const activeRequest = ref<Raw<ISubmitionRequest> | null>(null);
const activeRequestId = computed(() => activeRequest.value?.id ?? null);
const activeRequestLoadingTooltip = computed(() => {
  if (activeRequest.value === null) {
    return null;
  }

  return (
    (activeRequest.value.loaderTooltip as null | Ref<string | null>)?.value ??
    (activeRequest.value.loaderTooltip as string | null)
  );
});
const dialogVisible = ref(false);

submitDialogStore.abortActiveRequest = () => {
  if (activeRequest.value !== null) {
    activeRequest.value.aborted = true;
    // activeRequest.value = null;
    // dialogVisible.value = false;
  }
};
submitDialogStore.getActiveRequestId = () => activeRequestId.value;

submitDialogStore.$onAction(({ name, after }) => {
  if (name === 'submit') {
    after(() => {
      if (activeRequest.value === null) {
        activeRequest.value = submitDialogStore.requestsQueue.shift() ?? null;
        dialogVisible.value = true;
      }
    });
  }
});

const callOnAbort = (request: ISubmitionRequest, callingContext: UOnAbortCallingContext) => {
  return request.onAbort?.(callingContext);
};

const setRequestLoading = (state: boolean, request: ISubmitionRequest | null) => {
  if (request) {
    request.loading = state;
  }
};
const callIfPromise = (value: Promise<unknown> | unknown, cb: () => void) => {
  if (value instanceof Promise) {
    cb();
  }
};
const wrapAction =
  (context: UOnAbortCallingContext, cb: (request: ISubmitionRequest) => Promise<void> | void) => async () => {
    const lockedRequestRef = activeRequest.value;

    if (lockedRequestRef === null) {
      throw new Error(`Действие ${context} в ZSubmitDialog было вызвана, когда отсутствует значение activeRequest`);
    }

    if (lockedRequestRef.aborted) {
      return;
    }

    const cbResult = cb(lockedRequestRef);

    callIfPromise(cbResult, () => setRequestLoading(true, lockedRequestRef));

    await cbResult;

    if (lockedRequestRef.aborted) {
      const callOnAbortResult = callOnAbort(lockedRequestRef, 'decline');
      callIfPromise(callOnAbortResult, () => setRequestLoading(true, lockedRequestRef));
      await callOnAbortResult;
    }

    callIfPromise(cbResult, () => setRequestLoading(false, lockedRequestRef));

    dialogVisible.value = false;
  };

const onDecline = wrapAction('decline', (request: ISubmitionRequest) => request.onDecline());
const onSubmit = wrapAction('submit', (request: ISubmitionRequest) => request.onSubmit());

const showAnotherSubmitionRequest = () => {
  activeRequest.value = submitDialogStore.requestsQueue.shift() ?? null;
  dialogVisible.value = !!activeRequest.value;
};
</script>

<template>
  <ZDialog
    :title="activeRequest?.title"
    :loading="activeRequest?.loading"
    :loader-tooltip="activeRequestLoadingTooltip"
    show-loader-tooltip-permanently
    min-height="240"
    max-width="600"
    width="100%"
    :model-value="dialogVisible"
    @hidden="showAnotherSubmitionRequest"
  >
    <template #text>
      <span
        class="submit-dialog__text"
        v-html="activeRequest?.text"
      />
    </template>

    <template #actions>
      <div class="submit-dialog__actions">
        <VBtn
          class="mb-2"
          size="x-large"
          width="100%"
          :disabled="activeRequest?.loading"
          variant="elevated"
          color="error"
          text="Отменить"
          @click="onDecline"
        />

        <VBtn
          :disabled="activeRequest?.loading"
          text="Подтвердить"
          size="x-large"
          width="100%"
          variant="elevated"
          color="primary"
          @click="onSubmit"
        />
      </div>
    </template>
  </ZDialog>
</template>

<style scoped>
.submit-dialog__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.submit-dialog__text {
  white-space: pre-wrap;
}
</style>
