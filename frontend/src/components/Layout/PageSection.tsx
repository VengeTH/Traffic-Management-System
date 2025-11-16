import React from 'react';

interface PageSectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAlignment?: 'left' | 'between';
}

const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  action,
  children,
  className = '',
  headerAlignment = 'between'
}) => {
  return (
    <section className={`lux-card animated-gradient-border premium-glow p-4 sm:p-6 md:p-8 w-full max-w-full overflow-x-hidden ${className}`}>
      {(title || description || action) && (
        <div
          className={`flex flex-col gap-4 border-b border-gray-100 pb-6 ${headerAlignment === 'between' ? 'sm:flex-row sm:items-center sm:justify-between' : ''}`}
        >
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-gradient-premium">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600 font-medium">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex flex-wrap gap-3">
              {action}
            </div>
          )}
        </div>
      )}
      <div className={title || description || action ? 'pt-6' : ''}>
        {children}
      </div>
    </section>
  );
};

export default PageSection;

