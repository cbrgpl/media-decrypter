import type { ComputedRef, Ref, Raw } from 'vue';
import type { EMediaType } from '../consts';

export type IPreparedFile = {
  mediaType: EMediaType | null;
  name: string;
  url: string;
};

/** @description Encrypted File object. Prefix E means Encrypted */
export type IEFileIn = { name: string; file: File };
export type IEFile = IEFileIn & { id: string };

export type IEFilePointerIn = { fileName: string; fileId: string };
export type IEFilePointer = IEFilePointerIn & {
  getEncryptedFile: () => Promise<IEFile | null>;
};
export type IEFilePointerViewerMod = IEFilePointer & {
  __raw: Raw<{
    preparedFile?: ComputedRef<IPreparedFile | null>;
    file?: Readonly<Ref<File | null>>;
    setPreparedFileRef: (preparedFile: ComputedRef<IPreparedFile | null>, file: Ref<File | null>) => void;
  }>;
};

export type IMediaViewerShowingRequestWrapper = {
  index: number;
};
