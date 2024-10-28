export const formatMilliseconds = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hoursStr = hours !== 0 ? String(hours).padStart(2, '0') + ':' : '';
  const minutesStr = minutes !== 0 ? String(minutes).padStart(2, '0') + ':' : '';
  const secondsStr = String(seconds).padStart(2, '0');

  return `${hoursStr}${minutesStr}${secondsStr}`;
};
