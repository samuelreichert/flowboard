import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import './EmptyState.css';

type EmptyStateProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title: string;
} & Pick<ComponentPropsWithoutRef<'div'>, 'aria-busy' | 'aria-live' | 'role'>;

type InlineEmptyStateProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dropdown' | 'list' | 'soft' | 'surface';
};

const getInlineVariantClassName = (
  variant: InlineEmptyStateProps['variant']
) => (variant && variant !== 'default' ? `inline-empty-state--${variant}` : '');

export const EmptyState = ({
  actions,
  'aria-busy': ariaBusy,
  'aria-live': ariaLive,
  children,
  className,
  icon,
  role,
  title,
}: EmptyStateProps) => (
  <div
    aria-busy={ariaBusy}
    aria-live={ariaLive}
    className={['empty-state', className].filter(Boolean).join(' ')}
    role={role}
  >
    {icon && <div className="empty-state__icon">{icon}</div>}
    <h2 className="empty-state__title">{title}</h2>
    <p className="empty-state__body">{children}</p>
    {actions && <div className="empty-state__actions">{actions}</div>}
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
