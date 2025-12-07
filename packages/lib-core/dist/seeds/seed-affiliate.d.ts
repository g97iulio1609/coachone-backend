import { PrismaClient } from '@prisma/client';
export declare function seedAffiliate(prisma: PrismaClient, adminUserId: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    registrationCredit: number;
    baseCommissionRate: import("@prisma/client/runtime/client").Decimal;
    maxLevels: number;
    subscriptionGraceDays: number;
    rewardPendingDays: number;
    lifetimeCommissions: boolean;
}>;
