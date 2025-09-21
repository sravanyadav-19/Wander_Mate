import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0
  });

  const measureLoadTime = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    
    setMetrics(prev => ({
      ...prev,
      loadTime: Math.round(loadTime)
    }));
  }, []);

  const measureRenderTime = useCallback(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: Math.round(entry.duration)
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memory.usedJSHeapSize / 1048576) // Convert to MB
      }));
    }
  }, []);

  const logPerformance = useCallback((component: string, operation: string) => {
    const mark = `${component}-${operation}`;
    performance.mark(mark);
    
    return () => {
      const endMark = `${mark}-end`;
      performance.mark(endMark);
      performance.measure(`${mark}-duration`, mark, endMark);
    };
  }, []);

  const preloadResource = useCallback((url: string, type: 'image' | 'script' | 'style' = 'image') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const deferNonCritical = useCallback((callback: () => void, delay = 0) => {
    if ('requestIdleCallback' in window) {
      return requestIdleCallback(callback, { timeout: 5000 });
    } else {
      return setTimeout(callback, delay);
    }
  }, []);

  useEffect(() => {
    // Measure initial metrics
    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
    }

    measureRenderTime();
    
    // Measure memory usage periodically
    const memoryInterval = setInterval(measureMemoryUsage, 5000);

    return () => {
      window.removeEventListener('load', measureLoadTime);
      clearInterval(memoryInterval);
    };
  }, [measureLoadTime, measureRenderTime, measureMemoryUsage]);

  return {
    metrics,
    logPerformance,
    preloadResource,
    deferNonCritical,
    measureLoadTime,
    measureRenderTime,
    measureMemoryUsage
  };
};