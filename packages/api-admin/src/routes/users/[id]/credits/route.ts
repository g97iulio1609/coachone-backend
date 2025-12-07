/**
 * Admin User Credits API Route
 *
 * POST: Modifica crediti utente (solo admin)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@OneCoach/lib-core/auth/guards';
import { CreditService } from '@OneCoach/lib-core/credit.service';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminOrError = await requireAdmin();

  if (adminOrError instanceof NextResponse) {
    return adminOrError;
  }

  try {
    const { id: userId } = await params;
    const { amount, reason } = await _req.json();

    if (!amount || !reason) {
      return NextResponse.json({ error: 'Amount e reason richiesti' }, { status: 400 });
    }

    // Add or remove credits
    if (amount > 0) {
      await CreditService.addCredits({
        userId,
        amount,
        type: 'ADMIN_ADJUSTMENT',
        description: reason,
        metadata: {
          adjustedBy: adminOrError.id,
          adjustedByEmail: adminOrError.email,
        },
      });
    } else {
      await CreditService.consumeCredits({
        userId,
        amount: Math.abs(amount),
        type: 'ADMIN_ADJUSTMENT',
        description: reason,
        metadata: {
          adjustedBy: adminOrError.id,
          adjustedByEmail: adminOrError.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Crediti aggiornati con successo',
    });
  } catch (error: unknown) {
    logError('Errore nell', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
