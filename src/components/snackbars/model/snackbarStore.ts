import { generateId } from '@/utils/generateId';
import { defineStore } from 'pinia';

const SNACKBAR_DEFAULT_LIFE_TIME = 7500;
const MAX_SNACKBARS_SIMULSTANEOUSLY = 3;

export type USnackbarTypes = 'message' | 'success' | 'error';

type ISnackbarIn = {
  life?: number;

  title?: string;
  text: string;
};

type ISnackbarInternalContainer = ISnackbarIn & {
  life: number;
  type: USnackbarTypes;
};

export type ISnackbar = ISnackbarInternalContainer & {
  id: number;
};

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    snackbars: [] as ISnackbar[],
    snackbarsQueue: [] as ISnackbar[],
  }),
  actions: {
    _addSnackbar(snackbar: ISnackbarInternalContainer) {
      const snackbarWithId = {
        ...snackbar,
        id: generateId(),
      };

      if (this.snackbars.length === MAX_SNACKBARS_SIMULSTANEOUSLY) {
        this.snackbarsQueue.push(snackbarWithId);
      } else {
        this.snackbars.push(snackbarWithId);
      }

      return snackbarWithId.id;
    },
    showSnackbar(): Record<USnackbarTypes, (snackbarIn: ISnackbarIn) => number> {
      return {
        message: (snackbarIn) => {
          return this._addSnackbar({
            life: SNACKBAR_DEFAULT_LIFE_TIME,
            type: 'message',
            ...snackbarIn,
          });
        },
        error: (snackbarIn) => {
          return this._addSnackbar({
            life: SNACKBAR_DEFAULT_LIFE_TIME,
            type: 'error',
            ...snackbarIn,
          });
        },
        success: (snackbarIn) => {
          return this._addSnackbar({
            life: SNACKBAR_DEFAULT_LIFE_TIME,
            type: 'success',
            ...snackbarIn,
          });
        },
      };
    },
    hideSnackbar(snackbarId: number) {
      const snackbarInx = this.snackbars.findIndex((snackbar) => snackbar.id === snackbarId);

      if (snackbarInx === -1) {
        return;
      }

      if (typeof snackbarInx === 'number') {
        this.snackbars.splice(snackbarInx, 1);
      }

      const [queuedSnackbar] = this.snackbarsQueue.splice(0, 1);
      if (queuedSnackbar) {
        this.snackbars.push(queuedSnackbar);
      }
    },
  },
});
