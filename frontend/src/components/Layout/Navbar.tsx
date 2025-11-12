import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Notification } from '../../types';
import { Menu, X, User, LogOut, Settings, Bell, Check, CheckCheck } from 'lucide-react';
import Button from '../UI/Button';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (isNotificationMenuOpen) {
          fetchNotifications();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isNotificationMenuOpen]);

  // Close notification menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationMenuOpen(false);
      }
    };

    if (isNotificationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationMenuOpen]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await apiService.getNotifications({ limit: 10 });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    if (!isNotificationMenuOpen) {
      fetchNotifications();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close user menu when clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Ensure user menu is closed on mount and when user changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [isAuthenticated]);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b-2 border-primary-100/50 sticky top-0 z-50 premium-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 premium-glow-hover border-2 border-primary-500/30">
                <span className="text-white font-black text-lg">EV</span>
              </div>
              <div className="ml-4">
                <span className="text-2xl font-black text-gradient-premium">
                  E-VioPay
                </span>
                <p className="text-xs text-gray-700 font-medium -mt-1">Las Piñas Online Traffic Payments</p>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-700 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-primary-50/80 hover:shadow-md"
                >
                  Login
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="px-6 py-2.5 shadow-xl btn-glow"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={toggleNotificationMenu}
                    className="relative p-3 text-gray-500 hover:text-primary-600 transition-all duration-200 hover:bg-primary-50 rounded-full"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationMenuOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b-2 border-gray-200 bg-white flex items-center justify-between sticky top-0">
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                          >
                            <CheckCheck className="h-3 w-3" />
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="overflow-y-auto flex-1">
                        {loadingNotifications ? (
                          <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  !notification.isRead ? 'bg-blue-50/30' : ''
                                }`}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification.id);
                                  }
                                  if (notification.linkUrl) {
                                    navigate(notification.linkUrl);
                                    setIsNotificationMenuOpen(false);
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    notification.type === 'success' ? 'bg-green-100' :
                                    notification.type === 'error' ? 'bg-red-100' :
                                    notification.type === 'warning' ? 'bg-orange-100' :
                                    'bg-blue-100'
                                  }`}>
                                    {notification.type === 'success' && <Check className="h-4 w-4 text-green-600" />}
                                    {notification.type === 'error' && <X className="h-4 w-4 text-red-600" />}
                                    {notification.type === 'warning' && <Bell className="h-4 w-4 text-orange-600" />}
                                    {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <p className={`text-sm font-semibold text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                      {!notification.isRead && (
                                        <div className="h-2 w-2 bg-primary-600 rounded-full flex-shrink-0 mt-1"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t-2 border-gray-200 bg-gray-50">
                          <Link
                            to="/notifications"
                            onClick={() => setIsNotificationMenuOpen(false)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-semibold text-center block"
                          >
                            View all notifications
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-all duration-200 p-2 rounded-lg hover:bg-primary-50"
                  >
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg premium-glow border-2 border-primary-500/30">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </button>

                  {/* User dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl py-2 z-50 border-2 border-primary-100/50 premium-glow glassmorphism animate-slide-down">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-primary-600" />
                        Profile Settings
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3 text-primary-600" />
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-green-200 animate-slide-down">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-200 mb-2">
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Dashboard
                </Link>
                <Link
                  to="/violations/search"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Search Violations
                </Link>
                <Link
                  to="/payments"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Payment History
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                    Admin Dashboard
                  </Link>
                )}
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;



