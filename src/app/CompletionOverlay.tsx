import { CheckCircle2 } from 'lucide-react';

type CompletionOverlayProps = {
  description: string;
  title: string;
};

const CompletionOverlay = ({ description, title }: CompletionOverlayProps) => (
  <div
    aria-atomic="true"
    aria-live="polite"
    className="completion-overlay"
    role="status"
  >
    <div className="completion-overlay__scrim" />
    <div className="completion-overlay__stage">
      <div className="completion-overlay__stack" aria-hidden="true">
        <span className="completion-overlay__card completion-overlay__card--one" />
        <span className="completion-overlay__card completion-overlay__card--two" />
        <span className="completion-overlay__card completion-overlay__card--three" />
        <span className="completion-overlay__card completion-overlay__card--four" />
      </div>
      <div className="completion-overlay__mark" aria-hidden="true">
        <CheckCircle2 size={34} strokeWidth={2.2} />
      </div>
      <div className="completion-overlay__copy">
        <p className="completion-overlay__title">{title}</p>
        <p className="completion-overlay__description">{description}</p>
      </div>
    </div>
  </div>
);

export default CompletionOverlay;
