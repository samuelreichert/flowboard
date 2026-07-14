import type { AuthenticatedUser } from './supabaseAuth.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';

const MAX_DISPLAY_NAME_LENGTH = 80;
const MAX_AVATAR_URL_LENGTH = 2048;
const MAX_AVATAR_STORAGE_PATH_LENGTH = 512;

type ProfileRecord = Awaited<
  ReturnType<FlowboardPrismaClient['profile']['findUniqueOrThrow']>
>;

export type FlowboardProfile = {
  avatarStoragePath: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  id: string;
};

export type ProfileUpdateInput = {
  avatarStoragePath?: unknown;
  avatarUrl?: unknown;
  displayName?: unknown;
};

const trimNullableString = (value: unknown) => {
  if (value === null) {
    return null;
  }

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error('Expected a string value.');
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const assertMaxLength = (
  value: string | null | undefined,
  maxLength: number,
  fieldName: string
) => {
  if (value && value.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }
};

const assertHttpUrl = (value: string | null | undefined) => {
  if (!value) {
    return;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('Avatar URL is invalid.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Avatar URL must use http or https.');
  }
};

export const serializeProfile = (
  profile: ProfileRecord,
  email: string | null
): FlowboardProfile => ({
  avatarStoragePath: profile.avatarStoragePath,
  avatarUrl: profile.avatarUrl,
  displayName: profile.displayName,
  email,
  id: profile.id,
});

export const ensureProfile = async (
  prisma: FlowboardPrismaClient,
  user: AuthenticatedUser
) => {
  const existingProfile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!existingProfile) {
    return prisma.profile.create({
      data: {
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        id: user.id,
      },
    });
  }

  const seedUpdates = {
    ...(existingProfile.displayName || !user.displayName
      ? {}
      : { displayName: user.displayName }),
    ...(existingProfile.avatarUrl || !user.avatarUrl
      ? {}
      : { avatarUrl: user.avatarUrl }),
  };

  if (Object.keys(seedUpdates).length === 0) {
    return existingProfile;
  }

  return prisma.profile.update({
    data: seedUpdates,
    where: {
      id: user.id,
    },
  });
};

export const getProfile = async (
  prisma: FlowboardPrismaClient,
  user: AuthenticatedUser
) => serializeProfile(await ensureProfile(prisma, user), user.email);

export const validateProfileUpdate = (input: ProfileUpdateInput) => {
  const displayName = trimNullableString(input.displayName);
  const avatarUrl = trimNullableString(input.avatarUrl);
  const avatarStoragePath = trimNullableString(input.avatarStoragePath);

  assertMaxLength(displayName, MAX_DISPLAY_NAME_LENGTH, 'Display name');
  assertMaxLength(avatarUrl, MAX_AVATAR_URL_LENGTH, 'Avatar URL');
  assertMaxLength(
    avatarStoragePath,
    MAX_AVATAR_STORAGE_PATH_LENGTH,
    'Avatar storage path'
  );
  assertHttpUrl(avatarUrl);

  return {
    ...(displayName === undefined ? {} : { displayName }),
    ...(avatarUrl === undefined ? {} : { avatarUrl }),
    ...(avatarStoragePath === undefined ? {} : { avatarStoragePath }),
  };
};

export const updateProfile = async (
  prisma: FlowboardPrismaClient,
  user: AuthenticatedUser,
  input: ProfileUpdateInput
) => {
  await ensureProfile(prisma, user);

  const data = validateProfileUpdate(input);

  const profile = await prisma.profile.update({
    data: {
      ...data,
      ...(data.avatarUrl === null ? { avatarStoragePath: null } : {}),
    },
    where: {
      id: user.id,
    },
  });

  return serializeProfile(profile, user.email);
};
