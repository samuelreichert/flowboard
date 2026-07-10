import type { AuthenticatedUser } from './supabaseAuth.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';

export const ensureProfile = async (
  prisma: FlowboardPrismaClient,
  user: AuthenticatedUser
) => {
  await prisma.profile.upsert({
    create: {
      id: user.id,
    },
    update: {},
    where: {
      id: user.id,
    },
  });
};
