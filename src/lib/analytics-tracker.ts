import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: any;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  session_id?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initializeUserId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async initializeUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  async track(event: AnalyticsEvent): Promise<void> {
    try {
      // Security: Omit IP address (handled server-side) and anonymize user agent
      const anonymizedUserAgent = this.anonymizeUserAgent(event.user_agent || navigator.userAgent);
      
      // Use secure SECURITY DEFINER function to insert analytics events
      // This bypasses RLS safely while preventing direct table manipulation
      await supabase.rpc('secure_insert_analytics_event', {
        p_event_type: event.event_type,
        p_user_id: this.userId,
        p_session_id: this.sessionId,
        p_page_url: event.page_url || window.location.pathname,
        p_referrer: event.referrer ? new URL(event.referrer).hostname : null,
        p_user_agent: anonymizedUserAgent,
        p_event_data: event.event_data || {}
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Anonymize user agent to reduce fingerprinting
  private anonymizeUserAgent(userAgent: string): string {
    // Extract only browser family and OS, not specific version details
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i);
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i);
    const browser = browserMatch ? browserMatch[1] : 'Unknown';
    const os = osMatch ? osMatch[1] : 'Unknown';
    return `${browser}/${os}`;
  }

  // Track page views
  async trackPageView(pageName?: string): Promise<void> {
    await this.track({
      event_type: 'page_view',
      event_data: { page_name: pageName || document.title }
    });
  }

  // Track product views
  async trackProductView(productId: string, productName: string): Promise<void> {
    await this.track({
      event_type: 'product_view',
      event_data: { product_id: productId, product_name: productName }
    });
  }

  // Track order events
  async trackOrderCreated(orderId: string, amount: number): Promise<void> {
    await this.track({
      event_type: 'order_created',
      event_data: { order_id: orderId, amount }
    });
  }

  async trackOrderConfirmed(orderId: string): Promise<void> {
    await this.track({
      event_type: 'order_confirmed',
      event_data: { order_id: orderId }
    });
  }

  // Track search
  async trackSearch(query: string, resultsCount: number): Promise<void> {
    await this.track({
      event_type: 'search',
      event_data: { query, results_count: resultsCount }
    });
  }

  // Track user actions
  async trackButtonClick(buttonName: string, context?: any): Promise<void> {
    await this.track({
      event_type: 'button_click',
      event_data: { button_name: buttonName, context }
    });
  }

  // Get analytics data
  async getAnalyticsSummary(userId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }

    // Process data into summary
    const summary = {
      total_events: data?.length || 0,
      page_views: data?.filter(e => e.event_type === 'page_view').length || 0,
      product_views: data?.filter(e => e.event_type === 'product_view').length || 0,
      orders_created: data?.filter(e => e.event_type === 'order_created').length || 0,
      unique_sessions: new Set(data?.map(e => e.session_id)).size || 0,
      events_by_type: {} as Record<string, number>,
      daily_stats: {} as Record<string, number>
    };

    // Count events by type
    data?.forEach(event => {
      summary.events_by_type[event.event_type] = (summary.events_by_type[event.event_type] || 0) + 1;
      
      const date = new Date(event.created_at).toLocaleDateString();
      summary.daily_stats[date] = (summary.daily_stats[date] || 0) + 1;
    });

    return summary;
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();