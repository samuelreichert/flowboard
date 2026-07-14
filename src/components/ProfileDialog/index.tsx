import { Button } from '@base-ui/react/button';
import { Camera, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import type { AuthenticatedProfile } from '../../storage/authenticatedApi';
import ProfileAvatar from '../ProfileAvatar';
import DialogShell from '../DialogShell';

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

  const avatarProfile = avatarPreviewUrl
    ? { ...profile, avatarUrl: avatarPreviewUrl }
    : removeAvatar
      ? { ...profile, avatarUrl: null }
      : profile;

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
      closeLabel="Close profile"
      onOpenChange={onOpenChange}
      open={open}
      popupClassName="profile-dialog"
      title="Edit profile"
    >
      <form className="profile-dialog__content" onSubmit={submit}>
        <div className="profile-dialog__avatar-field">
          <ProfileAvatar
            className="profile-dialog__avatar"
            profile={avatarProfile}
            size="lg"
          />
          <Button
            aria-label="Choose profile image"
            className="icon-button profile-dialog__avatar-button"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Camera size={17} />
          </Button>
          <input
            accept="image/gif,image/jpeg,image/png,image/webp"
            aria-label="Profile image file"
            className="profile-dialog__file-input"
            onChange={(event) => chooseAvatar(event.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <label className="dialog-field">
          <span className="dialog-label">Display name</span>
          <input
            className="dialog-input"
            maxLength={80}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            type="text"
            value={displayName}
          />
        </label>
        <div className="dialog-field">
          <span className="dialog-label">Email</span>
          <p className="profile-dialog__email">{profile?.email}</p>
        </div>
        {(profile?.avatarUrl || avatarPreviewUrl) && (
          <Button
            className="button button--subtle profile-dialog__remove-avatar"
            onClick={removeCurrentAvatar}
            type="button"
          >
            <Trash2 size={15} />
            <span>Remove image</span>
          </Button>
        )}
        <p className="profile-dialog__hint">
          Your profile helps identify your Flowboard workspace.
        </p>
        {error && <p className="profile-dialog__error">{error}</p>}
        <div className="dialog-actions">
          <Button
            className="button button--subtle"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button className="button button--primary" disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </DialogShell>
  );
};

export default ProfileDialog;
export type { ProfileDialogValues };
