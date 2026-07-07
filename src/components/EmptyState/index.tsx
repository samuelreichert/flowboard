import type { ReactNode } from 'react';

import './EmptyState.css';

type EmptyStateProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title: string;
};

type InlineEmptyStateProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dropdown' | 'list' | 'soft' | 'surface';
};

const getInlineVariantClassName = (
  variant: InlineEmptyStateProps['variant']
) => (variant && variant !== 'default' ? `inline-empty-state--${variant}` : '');

export const EmptyState = ({
  children,
  className,
  icon,
  title,
}: EmptyStateProps) => (
  <div className={['empty-state', className].filter(Boolean).join(' ')}>
    {icon && <div className="empty-state__icon">{icon}</div>}
    <h2 className="empty-state__title">{title}</h2>
    <p className="empty-state__body">{children}</p>
  </div>
);

export const InlineEmptyState = ({
  children,
  className,
  variant = 'default',
}: InlineEmptyStateProps) => (
  <p
    className={[
      'inline-empty-state',
      getInlineVariantClassName(variant),
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </p>
);
