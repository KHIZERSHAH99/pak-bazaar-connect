
// Maximum number of entries to prevent memory overflow
const MAX_CACHE_ENTRIES = 200;
const EVICTION_BATCH_SIZE = 20;

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  accessCount: number;
  lastAccess: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheItem<any>>();
  private tagIndex = new Map<string, Set<string>>();
  private totalHits = 0;
  private totalMisses = 0;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, data: T, ttl: number = 300000, tags: string[] = []): void {
    // Enforce max size — evict LRU entries if at capacity
    if (this.cache.size >= MAX_CACHE_ENTRIES && !this.cache.has(key)) {
      this.evictLRU(EVICTION_BATCH_SIZE);
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      accessCount: 0,
      lastAccess: Date.now()
    };

    this.cache.set(key, item);

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.totalMisses++;
      return null;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      this.totalMisses++;
      return null;
    }

    // Track access for LRU eviction
    item.accessCount++;
    item.lastAccess = Date.now();
    this.totalHits++;

    return item.data;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      item.tags.forEach(tag => {
        const tagSet = this.tagIndex.get(tag);
        if (tagSet) {
          tagSet.delete(key);
          if (tagSet.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      });
    }
    
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let deletedCount = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
  }

  /** Evict least-recently-used entries */
  private evictLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.delete(entries[i][0]);
    }
  }

  getStats(): { size: number; maxSize: number; tags: number; hitRate: number; utilizationPercent: number } {
    const total = this.totalHits + this.totalMisses;
    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_ENTRIES,
      tags: this.tagIndex.size,
      hitRate: total > 0 ? this.totalHits / total : 0,
      utilizationPercent: Math.round((this.cache.size / MAX_CACHE_ENTRIES) * 100)
    };
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  // Specialized caching methods
  cacheUserData(userId: string, data: any, ttl: number = 900000): void {
    this.set(`user:${userId}`, data, ttl, ['users', `user:${userId}`]);
  }

  cacheShopData(shopId: string, data: any, ttl: number = 600000): void {
    this.set(`shop:${shopId}`, data, ttl, ['shops', `shop:${shopId}`]);
  }

  cacheProductData(productId: string, data: any, ttl: number = 300000): void {
    this.set(`product:${productId}`, data, ttl, ['products', `product:${productId}`]);
  }

  invalidateUserCache(userId: string): void {
    this.invalidateByTag(`user:${userId}`);
  }

  invalidateShopCache(shopId: string): void {
    this.invalidateByTag(`shop:${shopId}`);
  }

  invalidateProductCache(productId: string): void {
    this.invalidateByTag(`product:${productId}`);
  }
}

export const cacheManager = CacheManager.getInstance();

// Register cache cleanup with the centralized cleanup manager
export function registerCacheCleanup(): void {
  import('./cleanup-manager').then(({ cleanupManager }) => {
    cleanupManager.registerTask('cache-cleanup', () => cacheManager.cleanup());
  });
}
