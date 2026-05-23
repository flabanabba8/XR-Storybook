export class GestureNav {
  constructor(callbacks) {
    this.callbacks = callbacks; // { onNext, onPrev, onMenu }
    this.lastGestureTime = 0;
    this.debounceMs = 800; // prevent double-triggers

    document.addEventListener('gesturestart', (e) => this.handleGesture(e));
  }

  handleGesture(event) {
    const { hand, name, confidence } = event.detail;
    const now = performance.now();

    if (confidence < 0.6) return;
    if (now - this.lastGestureTime < this.debounceMs) return;

    if (name === 'pinch' && hand === 'right') {
      this.lastGestureTime = now;
      this.callbacks.onNext?.();
    } else if (name === 'pinch' && hand === 'left') {
      this.lastGestureTime = now;
      this.callbacks.onPrev?.();
    } else if (name === 'open-palm') {
      this.lastGestureTime = now;
      this.callbacks.onMenu?.();
    }
  }
}
