export class GestureNav {
  constructor(callbacks) {
    this.callbacks = callbacks; // { onPinch, onPalm }
    this.lastGestureTime = 0;
    this.debounceMs = 800;

    document.addEventListener('gesturestart', (e) => this.handleGesture(e));
  }

  handleGesture(event) {
    const { name, confidence } = event.detail;
    const now = performance.now();

    if (confidence < 0.6) return;
    if (now - this.lastGestureTime < this.debounceMs) return;

    if (name === 'pinch') {
      this.lastGestureTime = now;
      this.callbacks.onPinch?.();
    } else if (name === 'open-palm') {
      this.lastGestureTime = now;
      this.callbacks.onPalm?.();
    }
  }
}
