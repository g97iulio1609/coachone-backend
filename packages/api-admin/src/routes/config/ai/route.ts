/**
 * Admin AI Config API Route
 *
 * GET: Ottiene tutte le configurazioni AI
 * PUT: Aggiorna configurazione AI (solo admin)
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@onecoach/lib-core/auth/guards';
import { AIConfigService } from '@onecoach/lib-ai/ai-config.service';
import { OperationType, AIModel } from '@onecoach/types';
import { logError, mapErrorToApiResponse } from '@onecoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const configs = await AIConfigService.getAllConfigs();

    return NextResponse.json({
      configs,
    });
  } catch (error: unknown) {
    logError('Errore nel recupero delle configurazioni AI', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}

export async function PUT(_req: Request) {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const body = await _req.json();
    const {
      operationType,
      model,
      creditCost,
      maxTokens,
      thinkingBudget,
      recalculateCreditsCost,
      changeReason,
    } = body;

    if (!operationType || !model) {
      return NextResponse.json({ error: 'operationType e model richiesti' }, { status: 400 });
    }

    const updatedConfig = await AIConfigService.updateConfig({
      operationType: operationType as OperationType,
      model: model as AIModel,
      creditCost,
      maxTokens,
      thinkingBudget,
      recalculateCreditsCost,
      changedBy: userOrError.id,
      changeReason,
    });

    return NextResponse.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error: unknown) {
    logError("Errore nell'aggiornamento della configurazione AI", error);
    const { response, status } = mapErrorToApiResponse(
      error,
      "Errore nell'aggiornamento della configurazione"
    );
    return NextResponse.json(response, { status });
  }
}
