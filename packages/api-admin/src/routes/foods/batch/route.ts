import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@OneCoach/lib-core/auth/guards';
import { prisma } from '@OneCoach/lib-core/prisma';
import { logError, mapErrorToApiResponse } from '@OneCoach/lib-shared/utils/error';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  const userOrError = await requireAdmin();
  if (userOrError instanceof NextResponse) return userOrError;

  try {
    const body = await _req.json();
    const action = body?.action as 'delete';
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || ids.length === 0) {
      return NextResponse.json({ error: 'Parametri non validi' }, { status: 400 });
    }

    if (action === 'delete') {
      const result = await prisma.food_items.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ deleted: result.count });
    }

    return NextResponse.json({ error: 'Azione non supportata' }, { status: 400 });
  } catch (error: unknown) {
    logError('Errore operazione batch', error);
    const { response, status } = mapErrorToApiResponse(error);
    return NextResponse.json(response, { status });
  }
}
