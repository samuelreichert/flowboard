import { supabase } from './supabase';

export const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_AVATAR_BUCKET =
  import.meta.env.VITE_SUPABASE_AVATAR_BUCKET?.trim() ||
  'flowboard-profile-avatars';

const SUPPORTED_AVATAR_TYPES = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const AVATAR_EXTENSION_BY_TYPE: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type UploadedProfileAvatar = {
  avatarStoragePath: string;
  avatarUrl: string;
};

export const validateProfileAvatarFile = (file: File) => {
  if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
    throw new Error('Choose a PNG, JPG, WebP, or GIF image.');
  }

  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    throw new Error('Avatar image must be 5 MB or smaller.');
  }
};

export const createProfileAvatarStoragePath = (
  file: File,
  userId: string
) => {
  const extension = AVATAR_EXTENSION_BY_TYPE[file.type] ?? 'png';
  const uniqueId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

  return `${userId}/avatar-${uniqueId}.${extension}`;
};

export const uploadProfileAvatar = async (
  file: File,
  userId: string,
  previousStoragePath?: string | null
): Promise<UploadedProfileAvatar> => {
  if (!supabase) {
    throw new Error('Avatar upload is only available when Supabase is configured.');
  }

  validateProfileAvatarFile(file);

  const avatarStoragePath = createProfileAvatarStoragePath(file, userId);
  const { data, error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(avatarStoragePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (error || !data?.path) {
    throw error ?? new Error('Unable to upload avatar.');
  }

  if (previousStoragePath) {
    await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([
      previousStoragePath,
    ]);
  }

  const { data: publicUrlData } = supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .getPublicUrl(data.path);

  return {
    avatarStoragePath: data.path,
    avatarUrl: publicUrlData.publicUrl,
  };
};

export const removeProfileAvatar = async (avatarStoragePath?: string | null) => {
  if (!supabase || !avatarStoragePath) {
    return;
  }

  await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([avatarStoragePath]);
};
