/**
 * Admin Promotion Apply API Route
 *
 * POST: Applica promozione manualmente a un utente (solo admin)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@OneCoach/lib-core/auth/guards';
import { PromotionService } from '@OneCoach/lib-marketplace/promotion.service';
import { prisma } from '@OneCoach/lib-core/prisma';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminOrError = await requireAdmin();

  if (adminOrError instanceof NextResponse) {
    return adminOrError;
  }

  try {
    const { id: promotionId } = await params;
    const { userId } = await _req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId richiesto' }, { status: 400 });
    }

    // Verifica che l'utente esista
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    // Verifica che la promozione esista
    const promotion = await prisma.promotions.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      return NextResponse.json({ error: 'Promozione non trovata' }, { status: 404 });
    }

    // Applica promozione (solo BONUS_CREDITS può essere applicata manualmente)
    if (promotion.type === 'BONUS_CREDITS') {
      await PromotionService.applyBonusCredits(promotionId, userId, adminOrError.id);
    } else {
      return NextResponse.json(
        { error: 'Solo promozioni BONUS_CREDITS possono essere applicate manualmente' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promozione applicata con successo',
    });
  } catch (error: unknown) {
    logError("Errore nell'applicazione della promozione", error);
    const { response, status } = mapErrorToApiResponse(
      error,
      "Errore nell'applicazione della promozione"
    );
    return NextResponse.json(response, { status });
  }
}
