/**
 * Onboarding Progress API Route
 *
 * GET:  Ottiene lo stato corrente dell'onboarding per l'utente autenticato
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@OneCoach/lib-core/auth/guards';
import { onboardingService } from '@OneCoach/lib-core';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userOrError = await requireAuth();

    if (userOrError instanceof NextResponse) {
      return userOrError;
    }

    if (!userOrError.id || typeof userOrError.id !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.error('[ONBOARDING GET] User ID non valido:', userOrError);
      }
      return NextResponse.json(
        { error: 'Errore di autenticazione: ID utente non valido' },
        { status: 401 }
      );
    }

    // Ottieni o crea il progresso onboarding
    const progress = await onboardingService.getOrCreate(userOrError.id);

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: unknown) {
    logError('Impossibile recuperare lo stato onboarding', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
