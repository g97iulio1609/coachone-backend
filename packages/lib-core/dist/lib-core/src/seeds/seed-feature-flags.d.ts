/**
 * Seed Feature Flags
 *
 * Inizializza i feature flags di default nel database.
 * Idempotente: può essere eseguito più volte senza problemi.
 */
import type { PrismaClient } from '@prisma/client';
export declare function seedFeatureFlags(prisma: PrismaClient, adminUserId: string): Promise<{
    invitationRegistrationFlag: {
        description: string | null;
        name: string;
        id: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        updatedBy: string | null;
        config: import("@prisma/client/runtime/client").JsonValue | null;
        key: string;
        enabled: boolean;
        strategy: import("@prisma/client").$Enums.RolloutStrategy;
    };
}>;
