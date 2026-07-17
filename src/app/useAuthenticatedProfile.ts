import { useState } from 'react';
import type { Dispatch } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getProfileFromSession } from '../auth/profileDisplay';
import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from '../auth/profileAvatar';
import {
  saveAuthenticatedProfile,
  type AuthenticatedProfile,
} from '../storage/authenticatedApi';
import type { Messages } from '../localization';
import type { AppAction } from './appTypes';
import type { AuthState } from './useAuthSession';
import { queryKeys } from './queryKeys';
import { useAuthenticatedProfileQuery } from './useFlowboardQueries';

const useAuthenticatedProfile = (
  authState: AuthState,
  dispatch: Dispatch<AppAction>,
  messages: Messages['app']['persistence']
) => {
  const queryClient = useQueryClient();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const accessToken =
    authState.status === 'signedIn' ? authState.session.access_token : undefined;
  const profileQuery = useAuthenticatedProfileQuery(accessToken);

  const sessionProfile =
    authState.status === 'signedIn'
      ? getProfileFromSession(authState.session)
      : null;
  const activeAuthenticatedProfile =
    profileQuery.data?.profile ?? sessionProfile;

  const clearProfileError = () => setProfileError(null);

  const saveProfile = async ({
    avatarFile,
    displayName,
    removeAvatar,
  }: {
    avatarFile: File | null;
    displayName: string;
    removeAvatar: boolean;
  }) => {
    if (authState.status !== 'signedIn' || !activeAuthenticatedProfile) {
      return;
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const profileUpdate: {
        avatarStoragePath?: string | null;
        avatarUrl?: string | null;
        displayName: string;
      } = {
        displayName,
      };

      if (avatarFile) {
        const uploadedAvatar = await uploadProfileAvatar(
          avatarFile,
          activeAuthenticatedProfile.id,
          activeAuthenticatedProfile.avatarStoragePath
        );

        profileUpdate.avatarStoragePath = uploadedAvatar.avatarStoragePath;
        profileUpdate.avatarUrl = uploadedAvatar.avatarUrl;
      } else if (removeAvatar) {
        await removeProfileAvatar(activeAuthenticatedProfile.avatarStoragePath);
        profileUpdate.avatarStoragePath = null;
        profileUpdate.avatarUrl = null;
      }

      const payload = await saveAuthenticatedProfile(
        profileUpdate,
        authState.session.access_token
      );

      queryClient.setQueryData<{ profile: AuthenticatedProfile }>(
        queryKeys.profile,
        payload
      );
      dispatch({ open: false, type: 'profileDialogOpenChanged' });
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : messages.profileSaveFailure
      );
    } finally {
      setProfileSaving(false);
    }
  };

  return {
    authenticatedProfile: activeAuthenticatedProfile,
    clearProfileError,
    profileError:
      profileError ??
      (profileQuery.isError ? messages.profileUnavailable : null),
    profileSaving,
    saveProfile,
  };
};

export default useAuthenticatedProfile;
