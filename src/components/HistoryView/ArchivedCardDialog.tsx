import { Button } from '@base-ui/react/button';
import { CalendarDays, Copy } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import type { ArchivedBoardCard } from '../../types';
import { CardContentViewer } from '../CardContentEditor';
import { PriorityBadge, TagChip } from '../CardMetadata';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';

type ArchivedCardDialogProps = {
  copyStatus: string;
  onCopyMarkdown: () => void;
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
      title={selectedCard?.title ?? messages.history.archivedCard}
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
            <Button
              aria-label={messages.history.copyMarkdown}
              className="button button--subtle history-card-detail__copy"
              onClick={onCopyMarkdown}
              type="button"
            >
              <Copy size={15} />
              <span>{messages.history.copyMarkdown}</span>
              {copyStatus && (
                <span className="history-card-detail__copy-status">
                  {copyStatus}
                </span>
              )}
            </Button>
          </div>
          {selectedCard.content ? (
            <div className="history-card-detail__content">
              <CardContentViewer
                ariaLabel={`${selectedCard.title} content`}
                value={selectedCard.content}
              />
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
