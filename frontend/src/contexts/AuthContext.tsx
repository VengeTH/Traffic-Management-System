import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Auth action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthResponse }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Safe localStorage access helpers
const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // localStorage not available or access denied
  }
  return null;
};

const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // localStorage not available or access denied
  }
  return false;
};

const safeLocalStorageRemove = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
      return true;
    }
  } catch {
    // localStorage not available or access denied
  }
  return false;
};

// Get initial user from localStorage if available
const getInitialUser = (): User | null => {
  try {
    const storedUser = safeLocalStorageGet('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

// Initial state
const initialState: AuthState = {
  user: getInitialUser(),
  token: safeLocalStorageGet('token'),
  refreshToken: safeLocalStorageGet('refreshToken'),
  loading: true,
  isAuthenticated: !!safeLocalStorageGet('token'),
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        loading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  refreshAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

// Create context with default safe values
const defaultAuthValue: AuthContextType = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  isAuthenticated: false,
  login: async () => { throw new Error('Auth not initialized'); },
  register: async () => { throw new Error('Auth not initialized'); },
  logout: async () => {},
  updateUser: () => {},
  refreshAuth: async () => { throw new Error('Auth not initialized'); },
  forgotPassword: async () => { throw new Error('Auth not initialized'); },
  resetPassword: async () => { throw new Error('Auth not initialized'); },
  verifyEmail: async () => { throw new Error('Auth not initialized'); },
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const token = safeLocalStorageGet('token');
        if (token && mounted) {
          try {
            dispatch({ type: 'AUTH_START' });
            const response = await apiService.getCurrentUser();
            if (mounted) {
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: {
                  user: response.data,
                  token,
                  refreshToken: safeLocalStorageGet('refreshToken') || '',
                },
              });
            }
          } catch (error) {
            console.error('Failed to initialize auth:', error);
            if (mounted) {
              dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
              safeLocalStorageRemove('token');
              safeLocalStorageRemove('refreshToken');
              safeLocalStorageRemove('user');
            }
          }
        } else if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeAuth();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.login(email, password);
      
      const { user, token, refreshToken } = response.data;
      
      // Store tokens in localStorage (safe)
      safeLocalStorageSet('token', token);
      safeLocalStorageSet('refreshToken', refreshToken);
      safeLocalStorageSet('user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.register(userData);
      
      const { user, token, refreshToken } = response.data;
      
      // Store tokens in localStorage (safe)
      safeLocalStorageSet('token', token);
      safeLocalStorageSet('refreshToken', refreshToken);
      safeLocalStorageSet('user', JSON.stringify(user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      
      toast.success('Registration successful! Please check your email for verification.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear localStorage (safe)
      safeLocalStorageRemove('token');
      safeLocalStorageRemove('refreshToken');
      safeLocalStorageRemove('user');
      
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update user function
  const updateUser = (userData: User) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    safeLocalStorageSet('user', JSON.stringify(userData));
  };

  // Refresh auth function - fetches current user data
  const refreshAuth = async () => {
    try {
      const response = await apiService.getCurrentUser();
      const updatedUser = response.data;
      
      // Update user in state and localStorage
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });
      safeLocalStorageSet('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Don't logout on error, just log it
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await apiService.forgotPassword(email);
      toast.success('Password reset email sent successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      await apiService.resetPassword(token, password);
      toast.success('Password reset successful');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (token: string) => {
    try {
      await apiService.verifyEmail(token);
      toast.success('Email verified successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshAuth,
    forgotPassword,
    resetPassword,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  try {
    const context = useContext(AuthContext);
    return context || defaultAuthValue;
  } catch (error) {
    console.error('Error accessing auth context:', error);
    return defaultAuthValue;
  }
};



