type Listener<T> = (event: T) => void;

export class EventEmitter<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  unsubscribe(fn: Listener<T>): void {
    this.listeners.delete(fn);
  }

  emit(event: T): void {
    this.listeners.forEach(fn => fn(event));
  }

  listenerCount(): number {
    return this.listeners.size;
  }
}
