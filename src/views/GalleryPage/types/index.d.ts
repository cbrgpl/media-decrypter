import type { ComputedRef, Ref } from 'vue';
import type { EMediaType } from '../consts';

export type IModifiedFileSystemFileHandle = FileSystemFileHandle & {
  __preparedFile?: ComputedRef<IPreparedFile | null>;
  __file?: Readonly<Ref<File | null>>;
  __setPreparedFileRef: (preparedFile: ComputedRef<IPreparedFile | null>, file: Ref<File | null>) => void;
};

export type IPreparedFile = {
  mediaType: EMediaType | null;
  name: string;
  url: string;
};

export type IMediaViewerShowingRequestWrapper = {
  index: number;
};
