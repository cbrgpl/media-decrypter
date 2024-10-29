import type { IEFilePointerIn, IEFilePointer } from '../types';
import { dbGet, EDbStore } from './db';

import type { ISnackbarStore } from '@/components/snackbars';

export const getEFilePointerFactory = (snackbarStore: ISnackbarStore) => ({
  newEFilePointer: (pointerIn: IEFilePointerIn): IEFilePointer => ({
    ...pointerIn,
    getEncryptedFile: async () => {
      try {
        const file = await dbGet(EDbStore.FILE, pointerIn.fileId);
        return file;
      } catch (err) {
        const msg = err instanceof Error ? err.message : `${err}`;
        snackbarStore.showSnackbar().message({
          title: 'Не смог получить файл из хранилища',
          text: msg,
        });
        return null;
      }
    },
  }),
});
