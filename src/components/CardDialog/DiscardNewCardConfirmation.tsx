import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';

type DiscardNewCardConfirmationProps = {
  onCancel: () => void;
  onDiscard: () => void;
};

const DiscardNewCardConfirmation = ({
  onCancel,
  onDiscard,
}: DiscardNewCardConfirmationProps) => (
  <>
    <Dialog.Title className="dialog-title">Discard new card?</Dialog.Title>
    <Dialog.Description className="dialog-description">
      This will close the new card without saving its title, content, or tags.
    </Dialog.Description>
    <div className="dialog-actions">
      <Button
        className="button button--subtle"
        onClick={onCancel}
        type="button"
      >
        Cancel
      </Button>
      <Button
        className="button button--danger"
        onClick={onDiscard}
        type="button"
      >
        Discard card
      </Button>
    </div>
  </>
);

export default DiscardNewCardConfirmation;
