import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const getPublicUrl = vi.fn(() => ({
    data: {
      publicUrl: 'https://flowboard.supabase.co/storage/avatar.png',
    },
  }));
  const remove = vi.fn().mockResolvedValue({ data: [], error: null });
  const upload = vi.fn().mockResolvedValue({
    data: {
      path: 'user-1/avatar-test.png',
    },
    error: null,
  });
  const from = vi.fn(() => ({
    getPublicUrl,
    remove,
    upload,
  }));
  const createClient = vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
    },
    storage: {
      from,
    },
  }));

  return {
    createClient,
    from,
    getPublicUrl,
    remove,
    upload,
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}));

const resetAuthEnv = () => {
  Object.assign(import.meta.env, {
    VITE_SUPABASE_AVATAR_BUCKET: '',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    VITE_SUPABASE_URL: 'https://flowboard.supabase.co',
  });
};

const loadProfileAvatar = async () => {
  vi.resetModules();
  mocks.createClient.mockClear();
  mocks.from.mockClear();
  mocks.getPublicUrl.mockClear();
  mocks.remove.mockClear();
  mocks.upload.mockClear();

  return import('./profileAvatar');
};

beforeEach(() => {
  resetAuthEnv();
});

describe('profile avatar storage helpers', () => {
  test('rejects oversized avatar files', async () => {
    const { validateProfileAvatarFile } = await loadProfileAvatar();
    const file = new File(['x'.repeat(10)], 'avatar.png', {
      type: 'image/png',
    });

    Object.defineProperty(file, 'size', {
      value: 5 * 1024 * 1024 + 1,
    });

    expect(() => validateProfileAvatarFile(file)).toThrow(
      'Avatar image must be 5 MB or smaller.'
    );
  });

  test('rejects unsupported avatar files', async () => {
    const { validateProfileAvatarFile } = await loadProfileAvatar();
    const file = new File(['hello'], 'avatar.txt', {
      type: 'text/plain',
    });

    expect(() => validateProfileAvatarFile(file)).toThrow(
      'Choose a PNG, JPG, WebP, or GIF image.'
    );
  });

  test('uploads avatar files and returns public profile metadata', async () => {
    const { PROFILE_AVATAR_BUCKET, uploadProfileAvatar } =
      await loadProfileAvatar();
    const file = new File(['avatar'], 'avatar.png', {
      type: 'image/png',
    });

    const result = await uploadProfileAvatar(
      file,
      'user-1',
      'user-1/old-avatar.png'
    );

    expect(PROFILE_AVATAR_BUCKET).toBe('flowboard-profile-avatars');
    expect(mocks.from).toHaveBeenCalledWith('flowboard-profile-avatars');
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/avatar-.+\.png$/),
      file,
      {
        cacheControl: '3600',
        contentType: 'image/png',
        upsert: false,
      }
    );
    expect(mocks.remove).toHaveBeenCalledWith(['user-1/old-avatar.png']);
    expect(mocks.getPublicUrl).toHaveBeenCalledWith('user-1/avatar-test.png');
    expect(result).toEqual({
      avatarStoragePath: 'user-1/avatar-test.png',
      avatarUrl: 'https://flowboard.supabase.co/storage/avatar.png',
    });
  });

  test('removes existing avatar storage objects', async () => {
    const { removeProfileAvatar } = await loadProfileAvatar();

    await removeProfileAvatar('user-1/avatar.png');

    expect(mocks.remove).toHaveBeenCalledWith(['user-1/avatar.png']);
  });
});
