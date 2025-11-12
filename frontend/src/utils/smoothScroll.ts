/**
 * High-performance smooth scrolling utility
 * Optimized for 60-120 fps performance using requestAnimationFrame
 */

interface SmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
}

/**
 * Easing function for smooth acceleration/deceleration
 */
const easeInOutCubic = (t: number): number => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Smooth scroll to a specific element or position
 * Uses requestAnimationFrame for 60-120 fps performance
 */
export const smoothScrollTo = (
  target: HTMLElement | number,
  options: SmoothScrollOptions = {}
): void => {
  const {
    duration = 800,
    easing = easeInOutCubic,
    offset = 0,
  } = options;

  // Get target position
  let targetPosition: number;
  if (typeof target === 'number') {
    targetPosition = target;
  } else {
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset;
    targetPosition = offsetPosition - offset;
  }

  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  /**
   * Animation function using requestAnimationFrame
   * This ensures smooth 60-120 fps scrolling
   */
  const animateScroll = (currentTime: number): void => {
    if (startTime === null) {
      startTime = currentTime;
    }

    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easing(progress);

    // Use transform for GPU acceleration
    window.scrollTo({
      top: startPosition + distance * easedProgress,
      behavior: 'auto', // We handle smoothness manually
    });

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  // Start animation
  requestAnimationFrame(animateScroll);
};

/**
 * Smooth scroll to top of page
 */
export const smoothScrollToTop = (options?: SmoothScrollOptions): void => {
  smoothScrollTo(0, options);
};

/**
 * Smooth scroll to bottom of page
 */
export const smoothScrollToBottom = (options?: SmoothScrollOptions): void => {
  smoothScrollTo(document.documentElement.scrollHeight, options);
};

/**
 * Smooth scroll within a container element
 */
export const smoothScrollInContainer = (
  container: HTMLElement,
  target: HTMLElement | number,
  options: SmoothScrollOptions = {}
): void => {
  const {
    duration = 800,
    easing = easeInOutCubic,
    offset = 0,
  } = options;

  let targetPosition: number;
  if (typeof target === 'number') {
    targetPosition = target;
  } else {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    targetPosition = targetRect.top - containerRect.top + container.scrollTop - offset;
  }

  const startPosition = container.scrollTop;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animateScroll = (currentTime: number): void => {
    if (startTime === null) {
      startTime = currentTime;
    }

    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easing(progress);

    // Use scrollTop for container scrolling with GPU acceleration
    container.scrollTop = startPosition + distance * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Initialize smooth scrolling for anchor links
 */
export const initSmoothScroll = (): void => {
  // Handle anchor link clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="#"]') as HTMLAnchorElement;

    if (link && link.hash) {
      e.preventDefault();
      const targetElement = document.querySelector(link.hash) as HTMLElement;
      
      if (targetElement) {
        smoothScrollTo(targetElement, {
          duration: 800,
          offset: 80, // Account for fixed navbar
        });
      }
    }
  });
};

/**
 * Enable smooth scrolling on page load
 */
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
  } else {
    initSmoothScroll();
  }
}

