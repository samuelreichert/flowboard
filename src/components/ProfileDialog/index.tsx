import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Camera, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import type { ProfileIdentity } from '../../auth/profileDisplay';
import { useLocalization } from '../../LocalizationProvider';
import type { AuthenticatedProfile } from '../../storage/authenticatedApi';
import ProfileAvatar from '../ProfileAvatar';
import DialogShell from '../DialogShell';

import './ProfileDialog.css';

type ProfileDialogValues = {
  avatarFile: File | null;
  displayName: string;
  removeAvatar: boolean;
};

type ProfileDialogProps = {
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProfileDialogValues) => Promise<void>;
  open: boolean;
  profile: AuthenticatedProfile | null;
  saving: boolean;
};

const ProfileDialog = ({
  error,
  onOpenChange,
  onSave,
  open,
  profile,
  saving,
}: ProfileDialogProps) => {
  const { messages } = useLocalization();
  const [displayName, setDisplayName] = useState('');
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const avatarFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDisplayName(profile?.displayName ?? '');
    avatarFileRef.current = null;
    setAvatarPreviewUrl(null);
    setRemoveAvatar(false);
  }, [open, profile]);

  useEffect(
    () => () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    },
    [avatarPreviewUrl]
  );

  const avatarProfile: ProfileIdentity | null = profile
    ? {
        avatarUrl:
          avatarPreviewUrl ?? (removeAvatar ? null : profile.avatarUrl),
        displayName: profile.displayName,
        email: profile.email,
      }
    : null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSave({
      avatarFile: avatarFileRef.current,
      displayName,
      removeAvatar,
    });
  };

  const chooseAvatar = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    avatarFileRef.current = file;
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const removeCurrentAvatar = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    avatarFileRef.current = null;
    setAvatarPreviewUrl(null);
    setRemoveAvatar(true);
  };

  return (
    <DialogShell
      closeLabel={messages.profile.closeProfile}
      onOpenChange={onOpenChange}
      open={open}
      popupClassName="profile-dialog"
      title={messages.profile.editProfile}
    >
      <form className="profile-dialog__content" onSubmit={submit}>
        <div className="profile-dialog__avatar-field">
          <ProfileAvatar
            className="profile-dialog__avatar"
            profile={avatarProfile}
            size="lg"
          />
          <Button
            aria-label={messages.profile.chooseImage}
            className="icon-button profile-dialog__avatar-button"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Camera size={17} />
          </Button>
          <input
            accept="image/gif,image/jpeg,image/png,image/webp"
            aria-label={messages.profile.imageFile}
            className="profile-dialog__file-input"
            onChange={(event) => chooseAvatar(event.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <Field.Root className="dialog-field">
          <Field.Label className="dialog-label">
            {messages.profile.displayName}
          </Field.Label>
          <Field.Control
            className="dialog-input"
            maxLength={80}
            onValueChange={setDisplayName}
            required
            type="text"
            value={displayName}
          />
        </Field.Root>
        <div className="dialog-field">
          <span className="dialog-label">{messages.profile.email}</span>
          <p className="profile-dialog__email">{profile?.email}</p>
        </div>
        {(profile?.avatarUrl || avatarPreviewUrl) && (
          <Button
            className="button button--subtle profile-dialog__remove-avatar"
            onClick={removeCurrentAvatar}
            type="button"
          >
            <Trash2 size={15} />
            <span>{messages.profile.removeImage}</span>
          </Button>
        )}
        <p className="profile-dialog__hint">{messages.profile.hint}</p>
        {error && <p className="profile-dialog__error">{error}</p>}
        <div className="dialog-actions">
          <Button
            className="button button--subtle"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            {messages.common.cancel}
          </Button>
          <Button
            className="button button--primary"
            disabled={saving}
            type="submit"
          >
            {saving ? messages.common.saving : messages.common.save}
          </Button>
        </div>
      </form>
    </DialogShell>
  );
};

export default ProfileDialog;
export type { ProfileDialogValues };
