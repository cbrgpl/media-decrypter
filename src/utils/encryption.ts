export const generateKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
};

export const generateSalt = (length: number = 32) => {
  const salt = window.crypto.getRandomValues(new Uint8Array(length));
  return salt;
};

export const deriveKey = async (passphrase: string, salt: Uint8Array) => {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, [
    'deriveKey',
  ]);

  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

  return key;
};

const DEFAULT_IV_LEN = 12;

type IEncryptingParams = {
  ivLen?: number;
};

type IEncryptParams = IEncryptingParams & {
  saveAsType?: string | null;
  /** @description It will not be encrypted */
  prependData?: ArrayBuffer;
};
export const encrypt = async (key: CryptoKey, arrBuffer: ArrayBuffer | ArrayBuffer[], params?: IEncryptParams) => {
  const iv = crypto.getRandomValues(new Uint8Array(params?.ivLen ?? DEFAULT_IV_LEN)); // 96-bit nonce

  let bufferForEncryption: ArrayBuffer = new ArrayBuffer();
  if (Array.isArray(arrBuffer)) {
    for (const buffer of arrBuffer) {
      const oldBufferLength = bufferForEncryption.byteLength;
      bufferForEncryption = bufferForEncryption.transferToFixedLength(oldBufferLength + buffer.byteLength);
      const encryptedBufferView = new DataView(bufferForEncryption);
      const iteratedBufferView = new DataView(buffer);

      for (let j = oldBufferLength; j < oldBufferLength + buffer.byteLength; ++j) {
        const offset = j - oldBufferLength;
        encryptedBufferView.setInt8(j, iteratedBufferView.getUint8(offset));
      }
    }
  } else {
    bufferForEncryption = arrBuffer;
  }

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    bufferForEncryption,
  );

  const blobContent = [iv, encryptedContent];

  if (params?.prependData) {
    blobContent.unshift(params.prependData);
  }

  const encryptedBlob = new Blob(blobContent, {
    type: params?.saveAsType ?? 'application/octet-stream',
  });

  return encryptedBlob;
};

export const decrypt = async (key: CryptoKey, encryptedArrayBuffer: ArrayBuffer, params?: IEncryptingParams) => {
  try {
    const ivLen = params?.ivLen ?? DEFAULT_IV_LEN;

    const iv = encryptedArrayBuffer.slice(0, ivLen);
    const ciphertext = encryptedArrayBuffer.slice(ivLen);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext,
    );
    console.log('dsd');

    return decryptedContent;
  } catch (err) {
    throw err instanceof Error ? err : new Error(err as string);
  }
};
