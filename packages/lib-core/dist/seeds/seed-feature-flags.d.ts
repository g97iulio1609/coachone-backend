/**
 * Seed Feature Flags
 *
 * Inizializza i feature flags di default nel database.
 * Idempotente: può essere eseguito più volte senza problemi.
 */
import type { PrismaClient } from '@prisma/client';
export declare function seedFeatureFlags(prisma: PrismaClient, adminUserId: string): Promise<{
    invitationRegistrationFlag: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        createdBy: string;
        updatedBy: string | null;
        config: import("@prisma/client/runtime/client").JsonValue | null;
        key: string;
        enabled: boolean;
        strategy: import("@prisma/client").$Enums.RolloutStrategy;
    };
}>;
