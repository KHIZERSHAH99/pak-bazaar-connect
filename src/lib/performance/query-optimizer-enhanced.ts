
import { supabase } from '@/integrations/supabase/client';

export interface QueryOptimizationConfig {
  enableCaching?: boolean;
  cacheTimeout?: number;
  enablePagination?: boolean;
  pageSize?: number;
  enableIndexHints?: boolean;
}

class QueryOptimizerEnhanced {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultConfig: QueryOptimizationConfig = {
    enableCaching: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    enablePagination: true,
    pageSize: 20,
    enableIndexHints: true
  };

  private getCacheKey(query: string, params: any): string {
    return `${query}_${JSON.stringify(params)}`;
  }

  private isValidCache(item: { timestamp: number; ttl: number }): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  async optimizedQuery(
    tableName: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      pagination?: { page: number; pageSize?: number };
      config?: QueryOptimizationConfig;
    } = {}
  ): Promise<any[]> {
    const config = { ...this.defaultConfig, ...options.config };
    const cacheKey = this.getCacheKey(tableName, options);

    // Check cache first
    if (config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isValidCache(cached)) {
        console.log(`Cache hit for ${tableName}`);
        return cached.data;
      }
    }

    try {
      let query = supabase.from(tableName as any).select(options.select || '*');

      // Apply filters with index optimization
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering with index hints
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      // Apply pagination
      if (config.enablePagination && options.pagination) {
        const { page, pageSize = config.pageSize } = options.pagination;
        const from = (page - 1) * pageSize!;
        const to = from + pageSize! - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Cache the result
      if (config.enableCaching) {
        this.cache.set(cacheKey, {
          data: data || [],
          timestamp: Date.now(),
          ttl: config.cacheTimeout!
        });
        console.log(`Cached result for ${tableName}`);
      }

      return data || [];
    } catch (error) {
      console.error(`Query optimization error for ${tableName}:`, error);
      throw error;
    }
  }

  // Optimized queries for specific tables
  async getOptimizedShops(filters: {
    city?: string;
    owner_id?: string;
    isActive?: boolean;
  } = {}): Promise<any[]> {
    return this.optimizedQuery('shops', {
      select: 'id, name, contact, address, logo, owner_id, city_id, commission_rate',
      filters,
      orderBy: { column: 'created_at', ascending: false },
      config: { pageSize: 12 }
    });
  }

  async getOptimizedProducts(shopId?: string, filters: {
    category_id?: string;
    is_active?: boolean;
    verification_status?: string;
  } = {}): Promise<any[]> {
    const productFilters = {
      ...filters,
      is_active: true,
      verification_status: 'approved',
      ...(shopId && { shop_id: shopId })
    };

    return this.optimizedQuery('products', {
      select: 'id, name, description, price, image, moq, shop_id, category_id',
      filters: productFilters,
      orderBy: { column: 'created_at', ascending: false },
      config: { pageSize: 16 }
    });
  }

  async getOptimizedOrders(userId: string, userRole: 'seller' | 'wholesaler'): Promise<any[]> {
    if (userRole === 'seller') {
      return this.optimizedQuery('orders', {
        select: `
          id, status, total_amount, created_at, buyer_name, buyer_phone
        `,
        filters: { buyer_id: userId },
        orderBy: { column: 'created_at', ascending: false },
        config: { pageSize: 10 }
      });
    } else {
      // For wholesalers, we need to get orders for their shops
      const { data: shops } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', userId);
      
      const shopIds = shops?.map(shop => shop.id) || [];
      
      if (shopIds.length === 0) return [];
      
      return this.optimizedQuery('orders', {
        select: `
          id, status, total_amount, created_at, buyer_name, buyer_phone
        `,
        filters: { shop_id: shopIds },
        orderBy: { column: 'created_at', ascending: false },
        config: { pageSize: 10 }
      });
    }
  }

  // Cache management
  clearCache(pattern?: string) {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(pattern)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`Cleared ${keysToDelete.length} cache entries matching "${pattern}"`);
    } else {
      this.cache.clear();
      console.log('Cleared all cache');
    }
  }

  getCacheStats() {
    const validEntries = Array.from(this.cache.values()).filter(item => 
      this.isValidCache(item)
    ).length;
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      hitRate: validEntries / this.cache.size || 0
    };
  }
}

export const queryOptimizer = new QueryOptimizerEnhanced();
