/**
 * Admin Policy History API Route
 *
 * GET: Ottiene lo storico di una policy
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@OneCoach/lib-core/auth/guards';
import { PolicyService } from '@OneCoach/lib-core/policy.service';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userOrError = await requireAdmin();

  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  try {
    const { id } = await params;

    const history = await PolicyService.getPolicyHistory(id);

    return NextResponse.json({ history });
  } catch (error: unknown) {
    logError('Errore nel recupero dello storico della policy', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
