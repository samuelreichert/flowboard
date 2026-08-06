import { Button } from '@base-ui/react/button';
import { Tooltip } from '@base-ui/react/tooltip';
import { CalendarDays, Copy } from 'lucide-react';
import { useState } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { ArchivedBoardCard } from '../../types';
import { CardContentViewer } from '../CardContentEditor';
import { PriorityBadge, TagChip } from '../CardMetadata';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';

type ArchivedCardDialogProps = {
  copyStatus: string;
  onCopyMarkdown: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  selectedCard: ArchivedBoardCard | null;
  selectedTagNames: string[];
};

const ArchivedCardDialog = ({
  copyStatus,
  onCopyMarkdown,
  onOpenChange,
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
      open={Boolean(selectedCard)}
      onOpenChange={onOpenChange}
      popupClassName="dialog-popup--card"
      size="wide"
      title={selectedCard?.title ?? messages.history.archivedCard}
      viewportRef={setTooltipPortalContainer}
    >
      {selectedCard && (
        <div className="history-card-detail__body">
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
          {selectedCard.content ? (
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
                ariaLabel={`${selectedCard.title} content`}
                value={selectedCard.content}
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
