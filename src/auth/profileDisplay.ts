import type { AuthenticatedProfile } from '../storage/authenticatedApi';
import type { SupabaseSession } from './supabase';

export type ProfileIdentity = Pick<
  AuthenticatedProfile,
  'avatarUrl' | 'displayName' | 'email'
>;

export const LOCAL_PROFILE_IDENTITY: ProfileIdentity = {
  avatarUrl: null,
  displayName: 'Local user',
  email: null,
};

const getMetadataString = (
  metadata: Record<string, unknown>,
  keys: string[]
) => {
  for (const key of keys) {
    const value = metadata[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

export const getProfileFromSession = (
  session: SupabaseSession
): AuthenticatedProfile => {
  const metadata =
    session.user.user_metadata &&
    typeof session.user.user_metadata === 'object'
      ? (session.user.user_metadata as Record<string, unknown>)
      : {};

  return {
    avatarStoragePath: null,
    avatarUrl: getMetadataString(metadata, ['avatar_url', 'picture']),
    displayName: getMetadataString(metadata, [
      'full_name',
      'name',
      'display_name',
    ]),
    email: session.user.email ?? null,
    id: session.user.id,
  };
};

export const getProfileDisplayName = (profile: ProfileIdentity | null) => {
  const displayName = profile?.displayName?.trim();

  if (displayName) {
    return displayName;
  }

  const emailName = profile?.email?.split('@')[0]?.trim();

  return emailName || 'Flowboard user';
};

export const getProfileSubtitle = (profile: ProfileIdentity | null) =>
  profile?.email ?? 'Local mode';

export const getProfileInitials = (profile: ProfileIdentity | null) => {
  const displayName = getProfileDisplayName(profile);
  const words = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return 'F';
  }

  return words.map((word) => word[0]?.toUpperCase()).join('');
};
