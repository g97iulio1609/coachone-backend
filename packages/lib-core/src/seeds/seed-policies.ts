import { PrismaClient } from '@prisma/client';
import { createId } from '@OneCoach/lib-shared/utils/id-generator';

export async function seedPolicies(prisma: PrismaClient, adminUserId: string) {
  const basePolicies = [
    {
      type: 'PRIVACY',
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      metaDescription: 'Informativa sulla privacy di OneCoach',
      content: '# Privacy Policy\n\nContenuto di default. Aggiorna dal pannello Admin.',
      status: 'PUBLISHED',
    },
    {
      type: 'TERMS',
      slug: 'terms-conditions',
      title: 'Termini e Condizioni',
      metaDescription: 'Termini e condizioni di servizio di OneCoach',
      content: '# Termini e Condizioni\n\nContenuto di default. Aggiorna dal pannello Admin.',
      status: 'PUBLISHED',
    },
    {
      type: 'GDPR',
      slug: 'gdpr',
      title: 'GDPR',
      metaDescription: 'Conformità GDPR di OneCoach',
      content: '# GDPR\n\nContenuto di default. Aggiorna dal pannello Admin.',
      status: 'PUBLISHED',
    },
    {
      type: 'CONTENT',
      slug: 'content-policy',
      title: 'Content Policy',
      metaDescription: 'Policy sui contenuti di OneCoach',
      content: '# Content Policy\n\nContenuto di default. Aggiorna dal pannello Admin.',
      status: 'PUBLISHED',
    },
  ] as const;

  for (const p of basePolicies) {
    const policy = await prisma.policies.upsert({
      where: { type: p.type as any },
      update: {
        slug: p.slug,
        title: p.title,
        content: p.content,
        metaDescription: p.metaDescription,
        status: p.status as any,
        updatedAt: new Date(),
        updatedById: adminUserId,
        publishedAt: new Date(),
      },
      create: {
        id: createId(),
        slug: p.slug,
        type: p.type as any,
        title: p.title,
        content: p.content,
        metaDescription: p.metaDescription,
        status: p.status as any,
        version: 1,
        createdById: adminUserId,
        updatedById: adminUserId,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.policy_history.upsert({
      where: { policyId_version: { policyId: policy.id, version: 1 } },
      update: {
        title: policy.title,
        content: policy.content,
        status: policy.status as any,
        changeReason: 'Creazione iniziale',
      },
      create: {
        id: createId(),
        policyId: policy.id,
        version: 1,
        slug: policy.slug,
        type: policy.type as any,
        title: policy.title,
        content: policy.content,
        metaDescription: policy.metaDescription ?? undefined,
        status: policy.status as any,
        changedBy: adminUserId,
        changeReason: 'Creazione iniziale',
        createdAt: new Date(),
      },
    });
  }
}
