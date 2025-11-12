/**
 * Performance optimization utilities
 * Reduces lag and improves frame rates throughout the system
 */

/**
 * Throttle function calls for better performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Optimize scroll performance by managing will-change
 */
export const optimizeScrollPerformance = (): void => {
  let scrollTimeout: NodeJS.Timeout | null = null;
  const body = document.body;
  
  const handleScroll = throttle(() => {
    // Add scrolling class to enable will-change
    body.classList.add('scrolling');
    
    // Remove scrolling class after scroll ends
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      body.classList.remove('scrolling');
    }, 150);
  }, 16); // ~60fps
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Also handle scroll containers
  const scrollContainers = document.querySelectorAll('[data-scroll], .scroll-container');
  scrollContainers.forEach((container) => {
    const handleContainerScroll = throttle(() => {
      container.classList.add('scrolling');
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        container.classList.remove('scrolling');
      }, 150);
    }, 16);
    
    container.addEventListener('scroll', handleContainerScroll, { passive: true });
  });
};

/**
 * Use requestAnimationFrame for smooth animations
 */
export const raf = (callback: () => void): number => {
  return requestAnimationFrame(callback);
};

/**
 * Cancel requestAnimationFrame
 */
export const cancelRaf = (id: number): void => {
  cancelAnimationFrame(id);
};

/**
 * Check if device is low-end for performance optimizations
 */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check connection speed (if available)
  const connection = (navigator as any).connection;
  const slowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData
  );
  
  return cores <= 2 || memory <= 2 || slowConnection;
};

/**
 * Initialize performance optimizations
 */
export const initPerformanceOptimizations = (): void => {
  // Optimize scroll performance
  optimizeScrollPerformance();
  
  // Disable heavy effects on low-end devices
  if (isLowEndDevice()) {
    document.documentElement.classList.add('low-end-device');
  }
  
  // Prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }
};

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImages = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceOptimizations();
      lazyLoadImages();
    });
  } else {
    initPerformanceOptimizations();
    lazyLoadImages();
  }
}

