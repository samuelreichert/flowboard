import { Button } from '@base-ui/react/button';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState, InlineEmptyState } from '../EmptyState';

import './RemoteDataState.css';

export type RemoteDataStateVariant = 'loading' | 'error';

type RetryProps = {
  onRetry?: () => void;
  retryLabel?: string;
};

type RemoteDataPanelProps = RetryProps & {
  description: ReactNode;
  title: string;
  variant: RemoteDataStateVariant;
};

type InlineRemoteDataStateProps = RetryProps & {
  children: ReactNode;
  variant: RemoteDataStateVariant;
};

const StateIcon = ({ variant }: { variant: RemoteDataStateVariant }) =>
  variant === 'loading' ? (
    <LoaderCircle
      aria-hidden="true"
      className="remote-data-state__spinner"
      size={22}
    />
  ) : (
    <CircleAlert aria-hidden="true" size={22} />
  );

const RetryButton = ({ onRetry, retryLabel }: Required<RetryProps>) => (
  <Button className="button button--subtle" onClick={onRetry} type="button">
    {retryLabel}
  </Button>
);

export const RemoteDataPanel = ({
  description,
  onRetry,
  retryLabel,
  title,
  variant,
}: RemoteDataPanelProps) => (
  <EmptyState
    actions={
      onRetry && retryLabel ? (
        <RetryButton onRetry={onRetry} retryLabel={retryLabel} />
      ) : undefined
    }
    aria-busy={variant === 'loading' || undefined}
    className={`remote-data-state remote-data-state--${variant}`}
    icon={<StateIcon variant={variant} />}
    role={variant === 'loading' ? 'status' : 'alert'}
    title={title}
  >
    {description}
  </EmptyState>
);

export const InlineRemoteDataState = ({
  children,
  onRetry,
  retryLabel,
  variant,
}: InlineRemoteDataStateProps) => (
  <div
    aria-busy={variant === 'loading' || undefined}
    className={`remote-data-state__inline remote-data-state__inline--${variant}`}
    role={variant === 'loading' ? 'status' : 'alert'}
  >
    <InlineEmptyState
      className="remote-data-state__inline-message"
      variant="surface"
    >
      <span className="remote-data-state__inline-content">
        <span className="remote-data-state__inline-icon">
          <StateIcon variant={variant} />
        </span>
        <span>{children}</span>
      </span>
    </InlineEmptyState>
    {onRetry && retryLabel && (
      <RetryButton onRetry={onRetry} retryLabel={retryLabel} />
    )}
  </div>
);
