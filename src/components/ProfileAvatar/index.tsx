import type { ProfileIdentity } from '../../auth/profileDisplay';
import { getProfileInitials } from '../../auth/profileDisplay';

import './ProfileAvatar.css';

type ProfileAvatarProps = {
  className?: string;
  profile: ProfileIdentity | null;
  size?: 'sm' | 'md' | 'lg';
};

const ProfileAvatar = ({
  className,
  profile,
  size = 'md',
}: ProfileAvatarProps) => (
  <span
    aria-hidden="true"
    className={['profile-avatar', `profile-avatar--${size}`, className]
      .filter(Boolean)
      .join(' ')}
  >
    {profile?.avatarUrl ? (
      <img alt="" src={profile.avatarUrl} />
    ) : (
      <span>{getProfileInitials(profile)}</span>
    )}
  </span>
);

export default ProfileAvatar;
