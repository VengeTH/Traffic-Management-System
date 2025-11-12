import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = ''
}) => {
  return (
    <header
      className={`relative overflow-hidden lux-card animated-gradient-border premium-glow px-8 py-7 ${className}`}
    >
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-br from-primary-100/50 to-transparent blur-3xl sm:block" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl premium-glow">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-gradient-premium">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-gray-600 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;

