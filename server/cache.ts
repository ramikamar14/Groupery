interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

const MAX_CACHE_SIZE = 1000;

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();

  private evictIfNeeded(): void {
    if (this.store.size < MAX_CACHE_SIZE) return;
    // Evict oldest accessed entry (LRU)
    let oldestKey = "";
    let oldestTime = Infinity;
    this.store.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });
    if (oldestKey) this.store.delete(oldestKey);
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    entry.lastAccessed = Date.now();
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.evictIfNeeded();
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      lastAccessed: Date.now(),
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    this.store.forEach((_value, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.store.delete(key));
  }

  size(): number {
    return this.store.size;
  }
}

export const cache = new MemoryCache();
