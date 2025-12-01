
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheItem<any>>();
  private tagIndex = new Map<string, Set<string>>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, data: T, ttl: number = 300000, tags: string[] = []): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags
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
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      // Remove from tag index
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

  getStats(): { size: number; tags: number; hitRate: number } {
    return {
      size: this.cache.size,
      tags: this.tagIndex.size,
      hitRate: 0 // Would need hit tracking for accurate calculation
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
  cacheUserData(userId: string, data: any, ttl: number = 900000): void { // 15 minutes
    this.set(`user:${userId}`, data, ttl, ['users', `user:${userId}`]);
  }

  cacheShopData(shopId: string, data: any, ttl: number = 600000): void { // 10 minutes
    this.set(`shop:${shopId}`, data, ttl, ['shops', `shop:${shopId}`]);
  }

  cacheProductData(productId: string, data: any, ttl: number = 300000): void { // 5 minutes
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
// This is initialized in main.tsx to prevent memory leaks from multiple intervals
export function registerCacheCleanup(): void {
  // Import dynamically to avoid circular dependencies
  import('./cleanup-manager').then(({ cleanupManager }) => {
    cleanupManager.registerTask('cache-cleanup', () => cacheManager.cleanup());
  });
}
