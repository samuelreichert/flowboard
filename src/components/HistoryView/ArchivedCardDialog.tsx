import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import { CalendarDays, Copy } from 'lucide-react';
import { useState } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { RemoteDataState } from '../../app/remoteDataState';
import type { CompletedHistoryCardSummary } from '../../storage/authenticatedApi';
import { CardContentViewer } from '../CardContentEditor';
import { PriorityBadge, TagChip } from '../CardMetadata';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';
import { InlineRemoteDataState } from '../RemoteDataState';

type ArchivedCardDialogProps = {
  copyStatus: string;
  detailContent: string | undefined;
  detailState: RemoteDataState;
  onCopyMarkdown: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  open: boolean;
  selectedCard: CompletedHistoryCardSummary | null;
  selectedTagNames: string[];
};

const ArchivedCardDialog = ({
  copyStatus,
  detailContent,
  detailState,
  onCopyMarkdown,
  onOpenChange,
  onRetry,
  open,
  selectedCard,
  selectedTagNames,
}: ArchivedCardDialogProps) => {
  const { formatDate, messages } = useLocalization();
  const [copyTooltipOpen, setCopyTooltipOpen] = useState(false);
  const [copyFeedbackPending, setCopyFeedbackPending] = useState(false);
  const [tooltipPortalContainer, setTooltipPortalContainer] =
    useState<HTMLDivElement | null>(null);
  const copyFeedbackActive = copyFeedbackPending || Boolean(copyStatus);

  const copyMarkdown = async () => {
    setCopyFeedbackPending(true);
    setCopyTooltipOpen(true);

    let copied = false;

    try {
      copied = await onCopyMarkdown();
    } catch {
      copied = false;
    } finally {
      setCopyFeedbackPending(false);
    }

    if (!copied) {
      setCopyTooltipOpen(false);
    }
  };

  return (
    <DialogShell
      closeLabel={messages.history.closeArchivedCard}
      description={
        selectedCard
          ? messages.history.created(formatDate(selectedCard.createdAt))
          : undefined
      }
      onCloseClick={() => onOpenChange(false)}
      open={open}
      onOpenChange={onOpenChange}
      popupClassName="dialog-popup--card"
      size="wide"
      title={
        selectedCard?.title ??
        (detailState === 'loading'
          ? messages.history.archivedCardLoadingTitle
          : detailState === 'error'
            ? messages.history.archivedCardUnavailableTitle
            : messages.history.archivedCard)
      }
      viewportRef={setTooltipPortalContainer}
    >
      {open && (
        <div className="history-card-detail__body">
          {selectedCard && (
            <div className="history-card-detail__toolbar">
              <div className="history-card-detail__metadata">
                <div className="history-card-detail__metadata-row">
                  <span className="history-card-detail__metadata-label">
                    {messages.card.priority}
                  </span>
                  <span className="history-card-detail__metadata-chips">
                    <PriorityBadge priority={selectedCard.priority} />
                  </span>
                </div>
                <div className="history-card-detail__metadata-row">
                  <span className="history-card-detail__metadata-label">
                    {messages.card.tags}
                  </span>
                  <span className="history-card-detail__metadata-chips">
                    {selectedTagNames.length > 0 ? (
                      selectedTagNames.map((tagName) => (
                        <TagChip key={tagName}>{tagName}</TagChip>
                      ))
                    ) : (
                      <InlineEmptyState variant="soft">
                        {messages.card.noTags}
                      </InlineEmptyState>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          {detailState === 'loading' ? (
            <InlineRemoteDataState variant="loading">
              {messages.history.archivedCardLoadingBody}
            </InlineRemoteDataState>
          ) : detailState === 'error' ? (
            <InlineRemoteDataState
              onRetry={onRetry}
              retryLabel={messages.common.retry}
              variant="error"
            >
              {messages.history.archivedCardUnavailableBody}
            </InlineRemoteDataState>
          ) : detailContent ? (
            <div className="history-card-detail__content">
              <div className="history-card-detail__copy-anchor">
                <Tooltip.Root
                  onOpenChange={(nextOpen, eventDetails) => {
                    if (!nextOpen && copyFeedbackActive) {
                      eventDetails.preventUnmountOnClose();
                      return;
                    }

                    setCopyTooltipOpen(nextOpen);
                  }}
                  open={copyTooltipOpen || copyFeedbackActive}
                >
                  <Tooltip.Trigger
                    delay={300}
                    render={
                      <Button
                        aria-label={messages.history.copyMarkdown}
                        className="history-card-detail__copy icon-button"
                        onClick={() => void copyMarkdown()}
                        type="button"
                      >
                        <Copy size={16} />
                      </Button>
                    }
                  />
                  <Tooltip.Portal container={tooltipPortalContainer}>
                    <Tooltip.Positioner
                      className="history-card-detail__copy-tooltip-positioner"
                      sideOffset={6}
                    >
                      <Tooltip.Popup className="history-card-detail__copy-tooltip">
                        {copyStatus || messages.history.copyMarkdown}
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              <CardContentViewer
                ariaLabel={`${selectedCard?.title ?? messages.history.archivedCard} content`}
                value={detailContent}
              />
              <span
                aria-live="polite"
                className="history-card-detail__copy-status"
                role="status"
              >
                {copyStatus}
              </span>
            </div>
          ) : (
            <InlineEmptyState>
              {messages.history.archivedCardNoContent}
            </InlineEmptyState>
          )}
        </div>
      )}
      {selectedCard && (
        <div className="history-card-detail__meta">
          <CalendarDays size={14} />
          <span>
            {messages.history.archived(formatDate(selectedCard.archivedAt))}
          </span>
        </div>
      )}
    </DialogShell>
  );
};

export default ArchivedCardDialog;
