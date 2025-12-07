/**
 * Coach Analytics Top Plans API
 * GET /api/coach/analytics/top-plans - Get top plans by sales for coach
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, roleSatisfies } from '@OneCoach/lib-core/auth';
import { prisma } from '@OneCoach/lib-core/prisma';
import { getTopPlans } from '@OneCoach/lib-analytics/coach-analytics.service';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

/**
 * GET /api/coach/analytics/top-plans
 * Get top plans by sales for coach
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a coach
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !roleSatisfies('COACH', user.role)) {
      return NextResponse.json({ error: 'Coach role required' }, { status: 403 });
    }

    const { searchParams } = new URL(_request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const plans = await getTopPlans(session.user.id, limit);

    return NextResponse.json({ plans });
  } catch (error: unknown) {
    logError('Internal server error', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
