import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Search,
  CreditCard,
  FileText,
  User,
  Settings,
  BarChart3,
  Users,
  Shield,
  Calendar,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Get user from localStorage as fallback during loading (safe access)
  // This ensures navigation shows immediately on refresh
  // Recalculate on every render to get the latest localStorage value
  const currentUser = React.useMemo(() => {
    // If user is already loaded, use it
    if (user && user.role) {
      return user;
    }
    
    // Otherwise, try to get from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (token && stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.role) {
              return parsed;
            }
          } catch {
            // Invalid JSON, ignore
          }
        }
      }
    } catch {
      // localStorage access failed, ignore
    }
    
    return null;
  }, [user, loading]); // Recalculate when user or loading changes
  
  // Ensure we have a valid user with role before rendering
  const hasValidUser = currentUser && currentUser.role;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['citizen', 'admin', 'enforcer'],
    },
    {
      name: 'Search Violations',
      href: '/violations/search',
      icon: Search,
      roles: ['citizen', 'admin', 'enforcer'],
    },
    {
      name: 'Payment History',
      href: '/payments',
      icon: CreditCard,
      roles: ['citizen', 'admin'],
    },
    {
      name: 'My Violations',
      href: '/violations',
      icon: FileText,
      roles: ['citizen'],
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['citizen', 'admin', 'enforcer'],
    },
  ];

  const adminItems = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: BarChart3,
    },
    {
      name: 'Manage Violations',
      href: '/admin/violations',
      icon: FileText,
    },
    {
      name: 'Manage Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: Calendar,
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const enforcerItems = [
    {
      name: 'Issue Violations',
      href: '/enforcer/violations',
      icon: Shield,
    },
    {
      name: 'My Issued Violations',
      href: '/enforcer/my-violations',
      icon: FileText,
    },
  ];

  const renderNavigationItem = (item: any) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`
          flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200
          ${active
            ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 border-r-4 border-primary-600 shadow-md premium-glow'
            : 'text-gray-700 hover:bg-primary-50/50 hover:text-primary-700 hover:shadow-sm'
          }
        `}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div 
      className="hidden md:flex md:flex-shrink-0 fixed left-0 z-40" 
      style={{ 
        width: '256px', 
        top: '80px', 
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      <div className="flex flex-col w-full h-full bg-white/95 backdrop-blur-sm border-r-2 border-primary-100/50 shadow-lg">
        <div className="flex-1 overflow-y-auto pt-5 pb-6">
          <nav className="px-2 space-y-1">
              {/* Main Navigation */}
              <div className="pb-2">
                <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h2>
              </div>
              {hasValidUser && navigationItems
                .filter(item => item.roles.includes(currentUser.role))
                .map(renderNavigationItem)}

              {/* Admin Navigation */}
              {hasValidUser && currentUser.role === 'admin' && (
                <>
                  <div className="pt-6 pb-2">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administration
                    </h3>
                  </div>
                  {adminItems.map(renderNavigationItem)}
                </>
              )}

              {/* Enforcer Navigation */}
              {hasValidUser && currentUser.role === 'enforcer' && (
                <>
                  <div className="pt-6 pb-2">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Enforcement
                    </h3>
                  </div>
                  {enforcerItems.map(renderNavigationItem)}
                </>
              )}
              
              {/* Loading state or no user */}
              {!hasValidUser && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  Loading navigation...
                </div>
              )}
            </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;



