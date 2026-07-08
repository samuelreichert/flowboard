import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Field } from '@base-ui/react/field';
import { Trash2 } from 'lucide-react';

import type { BoardCard } from '../../types';

type CardDialogFooterProps = {
  card: BoardCard | undefined;
  error: string;
  onDeleteClick: () => void;
};

const CardDialogFooter = ({
  card,
  error,
  onDeleteClick,
}: CardDialogFooterProps) => (
  <>
    <Field.Root className="dialog-form-error" invalid={Boolean(error)}>
      <Field.Error className="dialog-error" match={Boolean(error)}>
        {error}
      </Field.Error>
    </Field.Root>
    {card ? (
      <div className="dialog-actions dialog-actions--spread">
        <div />
        <div className="dialog-actions__group">
          <Button
            className="button button--danger"
            onClick={onDeleteClick}
            type="button"
          >
            <Trash2 size={16} />
            Delete card
          </Button>
        </div>
      </div>
    ) : (
      <div className="dialog-actions">
        <Dialog.Close className="button button--subtle" render={<Button />}>
          Cancel
        </Dialog.Close>
        <Button className="button button--primary" type="submit">
          Create
        </Button>
      </div>
    )}
  </>
);

export default CardDialogFooter;
