import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Trash2 } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';

type CardDialogFooterProps = {
  error: string;
  onDeleteClick: () => void;
};

const CardDialogFooter = ({ error, onDeleteClick }: CardDialogFooterProps) => (
  <CardDialogFooterContent error={error} onDeleteClick={onDeleteClick} />
);

const CardDialogFooterContent = ({
  error,
  onDeleteClick,
}: CardDialogFooterProps) => {
  const { messages } = useLocalization();

  return (
    <>
      <Field.Root className="dialog-form-error" invalid={Boolean(error)}>
        <Field.Error className="dialog-error" match={Boolean(error)}>
          {error}
        </Field.Error>
      </Field.Root>
      <div className="dialog-actions dialog-actions--spread">
        <div />
        <div className="dialog-actions__group">
          <Button
            className="button button--danger"
            onClick={onDeleteClick}
            type="button"
          >
            <Trash2 size={16} />
            {messages.card.deleteCard}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CardDialogFooter;
