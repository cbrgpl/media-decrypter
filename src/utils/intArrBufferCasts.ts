const BITS_PER_BYTE = 8;

const QNT_OF_BITS = 40;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const prettyBin = (num: number | bigint) => {
  const binaryNum = num.toString(2);

  const binN = binaryNum.padStart(QNT_OF_BITS, '0').split('');
  const b: string[] = [];
  const division: number = binN.length % 2 === 0 ? 0 : 1;
  for (let i = binN.length - 1; i >= 0; --i) {
    b.unshift(binN[i]);
    if (i !== 0 && i !== binN.length - 1 && i % 8 === division) {
      b.unshift(' ');
    }
  }

  return b.join('');
};

export const intToArrayBuffer = (v: number | bigint, bytes: number) => {
  const bigIntedNum = typeof v === 'bigint' ? v : BigInt(v);

  const buffer = new ArrayBuffer(bytes);
  const dataView = new DataView(buffer);

  const lastByteInx = bytes - 1;
  for (let i = 0; i <= lastByteInx; ++i) {
    dataView.setInt8(i, Number(bigIntedNum >> BigInt(BITS_PER_BYTE * (lastByteInx - i))) & 0xff);
  }

  return buffer;
};

export const intFromArrayBuffer = <BigInted extends boolean = false>(
  arrayBuffer: ArrayBuffer,
  bigInted: BigInted = false as BigInted,
): BigInted extends true ? bigint : number => {
  const uint8Arr = new Uint8Array(arrayBuffer);

  const binNum =
    '0b' +
    uint8Arr.reduce((bin, v) => {
      return bin + v.toString(2).padStart(8, '0');
    }, '');

  return (bigInted ? BigInt(binNum) : parseInt(binNum.slice(2), 2)) as BigInted extends true ? bigint : number;
};
