import { PrismaClient } from '@prisma/client';
export declare function seedExerciseCatalog(
  prisma: PrismaClient,
  adminUserId: string
): Promise<void>;
