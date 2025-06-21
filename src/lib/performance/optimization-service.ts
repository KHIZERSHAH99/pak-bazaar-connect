
import { optimizedQueryService } from './optimized-queries';
import { cacheManager } from './cache-manager';

export class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  
  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  // Preload critical data
  async preloadUserData(userId: string, userRole: string) {
    try {
      // Preload in parallel without blocking
      const promises = [
        optimizedQueryService.getUserProfile(userId),
        userRole === 'wholesaler' ? optimizedQueryService.getShopsByOwner(userId) : Promise.resolve([]),
        optimizedQueryService.getOrdersPaginated(userId, userRole, 0, 10)
      ];

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error preloading user data:', error);
    }
  }

  // Optimize images for faster loading
  optimizeImageUrl(url: string, options: { width?: number; quality?: number } = {}): string {
    if (!url) return url;
    
    const { width = 800, quality = 80 } = options;
    
    // For Unsplash images, add optimization parameters
    if (url.includes('unsplash.com')) {
      return `${url}&w=${width}&q=${quality}&auto=format&fit=crop`;
    }
    
    // For other images, return as-is (could be enhanced with a CDN)
    return url;
  }

  // Debounce function for search and input operations
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  }

  // Throttle function for scroll and resize events
  throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let lastCall = 0;
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    }) as T;
  }

  // Memory cleanup for components
  cleanup() {
    cacheManager.cleanup();
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => void | Promise<void>) {
    const start = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const end = performance.now();
          if (end - start > 100) { // Log slow operations
            console.warn(`Slow operation: ${name} took ${(end - start).toFixed(2)}ms`);
          }
        });
      } else {
        const end = performance.now();
        if (end - start > 100) {
          console.warn(`Slow operation: ${name} took ${(end - start).toFixed(2)}ms`);
        }
        return result;
      }
    } catch (error) {
      const end = performance.now();
      console.error(`Failed operation: ${name} failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  }
}

export const performanceService = PerformanceOptimizationService.getInstance();
