import { type ShallowRef, type Ref, shallowRef } from 'vue';

import { defineStore } from 'pinia';
import { generateId } from '@/utils/generateId';

export type UOnAbortCallingContext = 'submit' | 'decline';
export type ISubmitionRequestIn = {
  title: string;
  text?: string | null;

  loaderTooltip?: string | null | Ref<string | null>;

  onDecline?: () => Promise<void> | void;
  onSubmit: () => Promise<void> | void;
  onAbort?: (callingContext: UOnAbortCallingContext) => Promise<void> | void;
};

export type ISubmitionRequest = ISubmitionRequestIn & {
  id: number;
  loading: boolean;
  loaderTooltip: string | null | Ref<string | null>;
  aborted: boolean;
  onDecline: () => Promise<void> | void;
};

const fillByDefaults = (submitionRequest: ISubmitionRequestIn): ISubmitionRequest => ({
  id: generateId(),
  onDecline: async () => {},
  aborted: false,
  loaderTooltip: null,
  loading: false,
  text: null,
  ...submitionRequest,
});

export const useSubmitDialogStore = defineStore('submitDialog', {
  state: () => ({
    abortActiveRequest: null as null | (() => void),
    getActiveRequestId: null as null | (() => number | null),

    requestsQueue: shallowRef([]) as ShallowRef<ISubmitionRequest[]>,
  }),
  actions: {
    submit(submitionRequest: ISubmitionRequestIn) {
      const preparedRequest = fillByDefaults(submitionRequest);

      this.requestsQueue.push(preparedRequest);
      return preparedRequest.id;
    },
    abort(id: number) {
      if (this.getActiveRequestId === null) {
        throw new Error(
          'Произведена попытка прервать получение подтверждения от пользователя, но отсутствует установленная функция getActiveRequestId',
        );
      }

      if (this.abortActiveRequest === null) {
        throw new Error(
          'Произведена попытка прервать получение подтверждения от пользователя, но отсутствует установленная функция abortActiveRequest',
        );
      }

      if (this.getActiveRequestId() === id) {
        this.abortActiveRequest();
        return true;
      } else {
        const requestInx = this.requestsQueue.findIndex((request: any) => request.id === id);
        if (requestInx === -1) {
          return false;
        }

        this.requestsQueue.splice(requestInx, 1);
        return true;
      }
    },
  },
});
