import { Columns3 } from 'lucide-react';
import type { RefObject } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import { COLUMN_TITLE_LIMIT } from '../../board/constants';
import ContentDialog from '../ContentDialog';

type AddColumnDialogProps = {
  finalFocus?: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => string | void;
  open: boolean;
};

const AddColumnDialog = ({
  onOpenChange,
  onSave,
  open,
  finalFocus,
}: AddColumnDialogProps) => {
  const { messages } = useLocalization();

  return (
    <ContentDialog
      description={messages.board.addColumnDescription}
      finalFocus={finalFocus}
      hideCancel
      label={messages.board.columnTitle}
      leadingIcon={<Columns3 size={15} />}
      maxLength={COLUMN_TITLE_LIMIT}
      onOpenChange={onOpenChange}
      onSave={onSave}
      open={open}
      placeholder={messages.board.readyForReview}
      submitLabel={messages.board.addColumn}
      title={messages.board.addColumn}
    />
  );
};

export default AddColumnDialog;
