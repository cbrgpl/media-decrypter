export const saveFile = async (name: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  console.log('down', blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();

  URL.revokeObjectURL(url);
};
