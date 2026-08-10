export class RequestCache {
  private store = new Map<string, Promise<unknown>>();

  get<T>(key: string): Promise<T> | undefined {
    return this.store.get(key) as Promise<T> | undefined;
  }

  set<T>(key: string, promise: Promise<T>): Promise<T> {
    this.store.set(key, promise);
    promise.catch(() => this.store.delete(key));
    return promise;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
