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
  const { user } = useAuth();
  const location = useLocation();

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
          flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
          ${active
            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {/* Main Navigation */}
              <div className="pb-2">
                <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h2>
              </div>
              {navigationItems
                .filter(item => item.roles.includes(user?.role || ''))
                .map(renderNavigationItem)}

              {/* Admin Navigation */}
              {user?.role === 'admin' && (
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
              {user?.role === 'enforcer' && (
                <>
                  <div className="pt-6 pb-2">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Enforcement
                    </h3>
                  </div>
                  {enforcerItems.map(renderNavigationItem)}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;



