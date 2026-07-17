import { Button } from '@base-ui/react/button';
import { History, Home } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useLocalization } from '../LocalizationProvider';
import './AuthGate.css';
import './RouteFallbacks.css';

type AuthRedirectProps = {
  destination: string;
};

export const AuthRedirect = ({ destination }: AuthRedirectProps) => {
  const navigate = useNavigate();
  const { messages } = useLocalization();

  useEffect(() => {
    navigate(destination, { replace: true });
  }, [destination, navigate]);

  return (
    <main className="app app--auth">
      <section
        className="auth-panel"
        aria-label={messages.app.auth.openingFlowboardLabel}
      >
        <p className="auth-panel__message">{messages.app.auth.openingBoard}</p>
      </section>
    </main>
  );
};

type NotFoundViewProps = {
  onBoardClick: () => void;
  onHistoryClick: () => void;
  requestedPath: string;
  iconSrc?: string;
};

export const NotFoundView = ({
  iconSrc = '/icon-light.svg',
  onBoardClick,
  onHistoryClick,
  requestedPath,
}: NotFoundViewProps) => {
  const { messages } = useLocalization();

  return (
    <main className="app app--not-found">
      <section
        className="not-found-panel"
        aria-label={messages.app.notFound.ariaLabel}
      >
        <div className="not-found-panel__mark" aria-hidden="true">
          <img alt="" className="not-found-panel__brand-icon" src={iconSrc} />
          <span>404</span>
        </div>
        <p className="app__eyebrow">{messages.app.notFound.eyebrow}</p>
        <h1 className="not-found-panel__title">
          {messages.app.notFound.title}
        </h1>
        <p className="not-found-panel__body">{messages.app.notFound.body}</p>
        <code className="not-found-panel__path">{requestedPath}</code>
        <div className="not-found-panel__actions">
          <Button className="button button--primary" onClick={onBoardClick}>
            <Home aria-hidden="true" size={15} />
            {messages.app.notFound.openBoard}
          </Button>
          <Button className="button button--subtle" onClick={onHistoryClick}>
            <History aria-hidden="true" size={15} />
            {messages.app.notFound.viewHistory}
          </Button>
        </div>
      </section>
    </main>
  );
};
