// Simple analytics utility for tracking user actions
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('wandermate_analytics');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      // Keep only last 1000 events to prevent storage bloat
      const recentEvents = this.events.slice(-1000);
      localStorage.setItem('wandermate_analytics', JSON.stringify(recentEvents));
      this.events = recentEvents;
    } catch (error) {
      console.warn('Failed to save analytics to storage:', error);
    }
  }

  track(event: string, properties?: Record<string, any>, userId?: string) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId
    };

    this.events.push(analyticsEvent);
    this.saveToStorage();

    // In production, you would send this to your analytics service
    console.log('Analytics Event:', analyticsEvent);
  }

  // Track page views
  trackPageView(page: string, properties?: Record<string, any>) {
    this.track('page_view', { page, ...properties });
  }

  // Track user actions
  trackAction(action: string, target: string, properties?: Record<string, any>) {
    this.track('user_action', { action, target, ...properties });
  }

  // Track trip events
  trackTripEvent(event: string, tripData?: Record<string, any>) {
    this.track(`trip_${event}`, tripData);
  }

  // Track search events
  trackSearch(query: string, results?: number, filters?: Record<string, any>) {
    this.track('search', { query, results, filters });
  }

  // Track social sharing
  trackShare(content: string, platform?: string, success?: boolean) {
    this.track('share', { content, platform, success });
  }

  // Get analytics data for reporting
  getEvents(startDate?: Date, endDate?: Date): AnalyticsEvent[] {
    let filtered = this.events;

    if (startDate) {
      filtered = filtered.filter(event => event.timestamp >= startDate.getTime());
    }

    if (endDate) {
      filtered = filtered.filter(event => event.timestamp <= endDate.getTime());
    }

    return filtered;
  }

  // Get event counts by type
  getEventCounts(): Record<string, number> {
    return this.events.reduce((counts, event) => {
      counts[event.event] = (counts[event.event] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  // Clear all events
  clear() {
    this.events = [];
    localStorage.removeItem('wandermate_analytics');
  }

  // Enable/disable tracking
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Helper hooks for React components
export const useAnalytics = () => {
  const trackPageView = (page: string, properties?: Record<string, any>) => {
    analytics.trackPageView(page, properties);
  };

  const trackAction = (action: string, target: string, properties?: Record<string, any>) => {
    analytics.trackAction(action, target, properties);
  };

  return {
    track: analytics.track.bind(analytics),
    trackPageView,
    trackAction,
    trackTripEvent: analytics.trackTripEvent.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackShare: analytics.trackShare.bind(analytics)
  };
};
