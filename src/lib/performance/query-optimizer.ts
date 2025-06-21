
import { supabase } from '@/integrations/supabase/client';

export interface QueryConfig {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryStats = new Map<string, { count: number; avgTime: number }>();

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  async executeQuery(config: QueryConfig, cacheTTL: number = 60000): Promise<any> {
    const cacheKey = this.generateCacheKey(config);
    const startTime = performance.now();

    // Check cache first
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.updateQueryStats(cacheKey, performance.now() - startTime, true);
      return cached.data;
    }

    try {
      // Build query step by step
      let query = supabase.from(config.table as any);

      if (config.select) {
        query = query.select(config.select);
      }

      // Apply filters
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.like(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (config.orderBy) {
        query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending ?? true });
      }

      // Apply limit
      if (config.limit) {
        query = query.limit(config.limit);
      }

      // Apply offset/range
      if (config.offset && config.limit) {
        query = query.range(config.offset, config.offset + config.limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Cache successful results
      this.queryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL
      });

      this.updateQueryStats(cacheKey, performance.now() - startTime, false);

      return data;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  private generateCacheKey(config: QueryConfig): string {
    return JSON.stringify(config);
  }

  private updateQueryStats(cacheKey: string, executionTime: number, fromCache: boolean): void {
    const current = this.queryStats.get(cacheKey) || { count: 0, avgTime: 0 };
    
    if (!fromCache) {
      current.count++;
      current.avgTime = (current.avgTime * (current.count - 1) + executionTime) / current.count;
      this.queryStats.set(cacheKey, current);
    }
  }

  // Pre-defined optimized queries for common operations
  async getActiveProducts(shopId?: string, categoryId?: string, limit: number = 20): Promise<any> {
    return this.executeQuery({
      table: 'products',
      select: `
        id, name, price, image, moq, description,
        shops!inner(id, name, contact),
        categories(id, name)
      `,
      filters: {
        is_active: true,
        verification_status: 'approved',
        ...(shopId && { shop_id: shopId }),
        ...(categoryId && { category_id: categoryId })
      },
      orderBy: { column: 'created_at', ascending: false },
      limit
    }, 300000); // 5 minute cache
  }

  async getOrdersWithDetails(userId: string, userRole: 'seller' | 'wholesaler', limit: number = 50): Promise<any> {
    const isWholesaler = userRole === 'wholesaler';
    
    return this.executeQuery({
      table: 'orders',
      select: `
        id, total_amount, status, created_at, payment_method,
        buyer_name, buyer_phone, wholesaler_notes,
        ${isWholesaler ? 'profiles!orders_buyer_id_fkey(email),' : ''}
        shops!inner(${isWholesaler ? '' : 'id, '}name, contact${isWholesaler ? ', owner_id' : ''})
      `,
      filters: isWholesaler 
        ? {} // Will be filtered by RLS for wholesaler's shops
        : { buyer_id: userId },
      orderBy: { column: 'created_at', ascending: false },
      limit
    }, 60000); // 1 minute cache
  }

  // Cache management
  clearCache(): void {
    this.queryCache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    let hits = 0;
    let total = 0;
    
    for (const stats of this.queryStats.values()) {
      total += stats.count;
      // This is a simplified calculation
    }

    return {
      size: this.queryCache.size,
      hitRate: total > 0 ? hits / total : 0
    };
  }

  // Clean up expired cache entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.queryCache.delete(key);
      }
    }
  }
}

export const queryOptimizer = QueryOptimizer.getInstance();

// Auto-cleanup every 5 minutes
setInterval(() => queryOptimizer.cleanup(), 5 * 60 * 1000);
