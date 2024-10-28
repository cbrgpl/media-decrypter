import { ref, computed } from 'vue';

type ICallback = () => void;
class HandlersContainer {
  private _handlers: Array<ICallback> = [];

  on(cb: ICallback) {
    this._handlers.push(cb);
  }

  off(cb: ICallback) {
    const inx = this._handlers.findIndex(cb);

    if (inx !== -1) {
      this._handlers.splice(inx, 1);
    }
  }

  call() {
    this._handlers.forEach((cb) => cb());
  }
}

const swipeRightHandlerContainer = new HandlersContainer();
const swipeLeftHandlerContainer = new HandlersContainer();

const startX = ref<number | null>(null);
const moveX = ref<number | null>(null);
const touchXDiff = computed(() => {
  if (typeof startX.value === 'number' && typeof moveX.value === 'number') {
    return startX.value - moveX.value;
  }

  return 0;
});
document.addEventListener('touchstart', (e) => {
  startX.value = e.touches[0].clientX;
});

document.addEventListener('touchmove', (e) => {
  moveX.value = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
  if (startX.value === null) {
    return;
  }

  moveX.value = null;
  const endX = e.changedTouches[0].clientX;
  handleSwipe(startX.value, endX);
});

const MIN_DIFF_TO_SWIPE = 100;
const handleSwipe = (startX: number, endX: number) => {
  if (startX - endX > MIN_DIFF_TO_SWIPE) {
    swipeLeftHandlerContainer.call();
  } else if (endX - startX > MIN_DIFF_TO_SWIPE) {
    swipeRightHandlerContainer.call();
  }
};

export const swipeRightOn = (cb: ICallback) => {
  swipeRightHandlerContainer.on(cb);
};

export const swipeRightOff = (cb: ICallback) => {
  swipeRightHandlerContainer.off(cb);
};

export const swipeLeftOn = (cb: ICallback) => {
  swipeLeftHandlerContainer.on(cb);
};

export const swipeLeftOff = (cb: ICallback) => {
  swipeLeftHandlerContainer.off(cb);
};

export { touchXDiff };
