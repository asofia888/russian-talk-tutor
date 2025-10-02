/**
 * Performance monitoring utilities
 */

/**
 * Report Web Vitals metrics to console (development) or analytics (production)
 */
export const reportWebVitals = (metric: any) => {
  if (import.meta.env.DEV) {
    console.log('Web Vital:', metric);
  }
  // In production, you can send to analytics service
  // Example: sendToAnalytics(metric);
};

/**
 * Measure component render time
 */
export const measureComponentRender = (componentName: string, callback: () => void) => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (import.meta.env.DEV && renderTime > 16) {
    console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (>16ms)`);
  }

  return renderTime;
};

/**
 * Prefetch a route for faster navigation
 */
export const prefetchRoute = (path: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
};

/**
 * Report long tasks that block the main thread
 */
export const reportLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // longtask may not be supported in all browsers
    }
  }
};

/**
 * Get current page load performance metrics
 */
export const getLoadMetrics = () => {
  if ('performance' in window && 'timing' in performance) {
    const timing = performance.timing;
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domComplete - timing.domLoading,
      load: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart,
    };
  }
  return null;
};

/**
 * Initialize performance monitoring (call once in main entry point)
 */
export const initPerformanceMonitoring = () => {
  if (import.meta.env.DEV) {
    // Report load metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = getLoadMetrics();
        if (metrics) {
          console.log('📊 Page Load Metrics:', metrics);
        }
      }, 0);
    });

    // Monitor long tasks
    reportLongTasks();
  }
};
