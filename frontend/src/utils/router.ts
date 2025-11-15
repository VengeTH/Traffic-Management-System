/**
 * * Router utility functions
 * * Provides consistent basename handling for GitHub Pages deployment
 */

/**
 * * Gets the basename for React Router based on the current environment
 * * Returns '/Traffic-Management-System' for GitHub Pages, empty string for localhost
 */
export const getBasename = (): string => {
  try {
    if (typeof window === 'undefined') return '';
    
    // * Check if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '';
    }
    
    // * Check if deployed to GitHub Pages (vengeth.github.io domain)
    if (window.location.hostname.includes('github.io')) {
      return '/Traffic-Management-System';
    }
    
    // * Default: no basename for other deployments
    return '';
  } catch (error) {
    console.error('Error determining basename:', error);
    return '';
  }
};

/**
 * * Gets the full path for a route, respecting the basename
 * * Use this for window.location.href redirects outside of React Router
 * @param path - The route path (e.g., '/login', '/dashboard')
 * @returns The full path with basename if applicable
 */
export const getFullPath = (path: string): string => {
  const basename = getBasename();
  // * Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // * Combine basename and path, avoiding double slashes
  return `${basename}${normalizedPath}`;
};

