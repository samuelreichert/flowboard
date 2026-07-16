import { describe, expect, test } from 'vitest';

import {
  getProfileFromSession,
  getProfileDisplayName,
  getProfileInitials,
  getProfileSubtitle,
} from './profileDisplay';
import type { SupabaseSession } from './supabase';

describe('profile display helpers', () => {
  test('uses saved display name before email fallback', () => {
    expect(
      getProfileDisplayName({
        avatarUrl: null,
        displayName: 'Samuel Reichert',
        email: 'samuel@example.com',
      })
    ).toBe('Samuel Reichert');
  });

  test('falls back to email name and initials', () => {
    const profile = {
      avatarUrl: null,
      displayName: null,
      email: 'samuel@example.com',
    };

    expect(getProfileDisplayName(profile)).toBe('samuel');
    expect(getProfileInitials(profile)).toBe('S');
    expect(getProfileSubtitle(profile)).toBe('samuel@example.com');
  });

  test('uses local mode subtitle without email', () => {
    expect(getProfileSubtitle(null)).toBe('Local mode');
  });

  test('builds a signed-in fallback profile from Supabase session metadata', () => {
    const profile = getProfileFromSession({
      user: {
        email: 'samuel@example.com',
        id: 'user-1',
        user_metadata: {
          avatar_url: 'https://example.com/avatar.png',
          full_name: 'Samuel Reichert',
        },
      },
    } as unknown as SupabaseSession);

    expect(profile).toEqual({
      avatarStoragePath: null,
      avatarUrl: 'https://example.com/avatar.png',
      displayName: 'Samuel Reichert',
      email: 'samuel@example.com',
      id: 'user-1',
    });
    expect(getProfileSubtitle(profile)).toBe('samuel@example.com');
  });
});
