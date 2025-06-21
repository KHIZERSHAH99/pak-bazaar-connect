
import { supabase } from '@/integrations/supabase/client';
import { cacheManager } from './cache-manager';

export interface QueryOptions {
  useCache?: boolean;
  cacheDuration?: number;
  retries?: number;
}

class OptimizedQueryService {
  private static instance: OptimizedQueryService;
  private pendingQueries = new Map<string, Promise<any>>();

  static getInstance(): OptimizedQueryService {
    if (!OptimizedQueryService.instance) {
      OptimizedQueryService.instance = new OptimizedQueryService();
    }
    return OptimizedQueryService.instance;
  }

  // Deduplicate identical queries to prevent multiple calls
  async executeQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const { useCache = true, cacheDuration = 300000, retries = 2 } = options;

    // Check cache first
    if (useCache) {
      const cached = cacheManager.get<T>(key);
      if (cached) {
        return cached;
      }
    }

    // Check if query is already pending
    if (this.pendingQueries.has(key)) {
      return this.pendingQueries.get(key);
    }

    // Execute query with retry logic
    const queryPromise = this.executeWithRetry(queryFn, retries);
    this.pendingQueries.set(key, queryPromise);

    try {
      const result = await queryPromise;
      
      if (useCache && result) {
        cacheManager.set(key, result, cacheDuration, [key.split(':')[0]]);
      }
      
      return result;
    } finally {
      this.pendingQueries.delete(key);
    }
  }

  private async executeWithRetry<T>(queryFn: () => Promise<T>, retries: number): Promise<T> {
    for (let i = 0; i <= retries; i++) {
      try {
        return await queryFn();
      } catch (error) {
        if (i === retries || this.isNonRetryableError(error)) {
          throw error;
        }
        await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
    throw new Error('Query failed after retries');
  }

  private isNonRetryableError(error: any): boolean {
    // Don't retry on authentication or permission errors
    return error?.code === 'PGRST301' || error?.code === 'PGRST302';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Optimized profile query
  async getUserProfile(userId: string) {
    return this.executeQuery(
      `profile:${userId}`,
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data;
      },
      { cacheDuration: 900000 } // 15 minutes cache
    );
  }

  // Optimized shops query
  async getShopsByOwner(ownerId: string) {
    return this.executeQuery(
      `shops:${ownerId}`,
      async () => {
        const { data, error } = await supabase
          .from('shops')
          .select(`
            id, name, contact, address, postal_code, logo, commission_rate,
            cities(id, name, province)
          `)
          .eq('owner_id', ownerId);

        if (error) throw error;
        return data || [];
      },
      { cacheDuration: 600000 } // 10 minutes cache
    );
  }

  // Optimized orders query with pagination
  async getOrdersPaginated(userId: string, userRole: string, page: number = 0, limit: number = 20) {
    const offset = page * limit;
    
    return this.executeQuery(
      `orders:${userId}:${userRole}:${page}:${limit}`,
      async () => {
        let query = supabase
          .from('orders')
          .select(`
            id, total_amount, status, created_at, payment_method,
            buyer_name, buyer_phone, wholesaler_notes,
            shops!inner(id, name, contact),
            profiles!orders_buyer_id_fkey(email)
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (userRole === 'seller') {
          query = query.eq('buyer_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      { cacheDuration: 60000 } // 1 minute cache for orders
    );
  }

  // Clear cache for specific user data
  invalidateUserCache(userId: string) {
    cacheManager.invalidateByTag(`profile:${userId}`);
    cacheManager.invalidateByTag(`shops:${userId}`);
    cacheManager.invalidateByTag(`orders:${userId}`);
  }
}

export const optimizedQueryService = OptimizedQueryService.getInstance();
