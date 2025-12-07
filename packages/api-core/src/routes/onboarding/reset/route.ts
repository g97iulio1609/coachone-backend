/**
 * Onboarding Reset API Route
 *
 * POST: Resetta l'onboarding dell'utente (utile per testing o re-onboarding)
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@OneCoach/lib-core/auth/guards';
import { onboardingService } from '@OneCoach/lib-core';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userOrError = await requireAuth();

    if (userOrError instanceof NextResponse) {
      return userOrError;
    }

    if (!userOrError.id || typeof userOrError.id !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.error('[ONBOARDING RESET] User ID non valido:', userOrError);
      }
      return NextResponse.json(
        { error: 'Errore di autenticazione: ID utente non valido' },
        { status: 401 }
      );
    }

    const progress = await onboardingService.reset(userOrError.id);

    return NextResponse.json({
      success: true,
      progress,
      message: 'Onboarding resetted successfully',
    });
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      logError("Impossibile resettare l'onboarding", error);
      if (error instanceof Error) {
        console.error('[ONBOARDING RESET] Error message:', error.message);
        console.error('[ONBOARDING RESET] Error stack:', error.stack);
      }
    }

    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
