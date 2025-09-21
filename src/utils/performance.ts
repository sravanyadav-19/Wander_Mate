import React from 'react';

// Performance optimization utilities

// Bundle splitting helper
export const createLazyComponent = <T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return React.lazy(() => importFn());
};

// Debounce function for search and input optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Image preloader for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch multiple DOM reads/writes to prevent layout thrashing
export const batchDOMOperations = (operations: (() => void)[]): void => {
  requestAnimationFrame(() => {
    operations.forEach(op => op());
  });
};

// Memory-efficient event listener management
export class EventManager {
  private listeners: Map<string, Set<() => void>> = new Map();

  add(event: string, listener: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  remove(event: string, listener: () => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener());
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Virtual scrolling utility for large lists
export const calculateVisibleItems = (
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan: number = 5
): { startIndex: number; endIndex: number; offsetY: number } => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan);
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
};

// Efficient resize observer with throttling
export class ThrottledResizeObserver {
  private observer: ResizeObserver;
  private callbacks: Set<(entry: ResizeObserverEntry) => void> = new Set();
  private throttledCallback: () => void;

  constructor(throttleMs: number = 16) {
    this.throttledCallback = throttle(() => {
      // Process all callbacks
    }, throttleMs);

    this.observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        this.callbacks.forEach(callback => callback(entry));
      });
    });
  }

  observe(element: Element, callback: (entry: ResizeObserverEntry) => void): void {
    this.callbacks.add(callback);
    this.observer.observe(element);
  }

  unobserve(element: Element, callback?: (entry: ResizeObserverEntry) => void): void {
    if (callback) {
      this.callbacks.delete(callback);
    }
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

// Progressive Web App caching utilities
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      return registration;
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
      return null;
    }
  }
  return null;
};

// Critical resource hints
export const addResourceHint = (href: string, rel: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect', as?: string): void => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.setAttribute('as', as);
  document.head.appendChild(link);
};

// Performance monitoring
export const measurePerformance = (name: string) => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  performance.mark(startMark);
  
  return () => {
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name}: ${measure.duration}ms`);
    
    return measure.duration;
  };
};