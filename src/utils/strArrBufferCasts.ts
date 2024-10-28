const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const strToArrayBuffer = (v: string) => {
  const array = encoder.encode(v);

  if (window.SharedArrayBuffer) {
    if (array.buffer instanceof SharedArrayBuffer) {
      throw new Error('I don\'t know how to handle "SharedArrayBuffer"');
    }
  }

  return array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength) as ArrayBuffer;
};

export const strFromArrayBuffer = (v: ArrayBuffer): string => {
  return decoder.decode(v);
};
