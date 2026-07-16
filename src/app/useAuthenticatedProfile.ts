import { useEffect, useState } from 'react';
import type { Dispatch } from 'react';

import { getProfileFromSession } from '../auth/profileDisplay';
import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from '../auth/profileAvatar';
import {
  fetchAuthenticatedProfile,
  saveAuthenticatedProfile,
  type AuthenticatedProfile,
} from '../storage/authenticatedApi';
import type { Messages } from '../localization';
import type { AppAction } from './appTypes';
import type { AuthState } from './useAuthSession';

const useAuthenticatedProfile = (
  authState: AuthState,
  dispatch: Dispatch<AppAction>,
  messages: Messages['app']['persistence']
) => {
  const [authenticatedProfile, setAuthenticatedProfile] =
    useState<AuthenticatedProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (authState.status !== 'signedIn') {
      setAuthenticatedProfile(null);
      return;
    }

    let active = true;

    void fetchAuthenticatedProfile(authState.session.access_token)
      .then((payload) => {
        if (!active) {
          return;
        }

        setAuthenticatedProfile(payload.profile);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setProfileError(messages.profileUnavailable);
      });

    return () => {
      active = false;
    };
  }, [authState, messages]);

  const sessionProfile =
    authState.status === 'signedIn'
      ? getProfileFromSession(authState.session)
      : null;
  const activeAuthenticatedProfile = authenticatedProfile ?? sessionProfile;

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

      setAuthenticatedProfile(payload.profile);
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
    profileError,
    profileSaving,
    saveProfile,
  };
};

export default useAuthenticatedProfile;
