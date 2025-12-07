import { describe, it, expect, vi } from 'vitest';
import { createMimeRouter } from '../mime-router';

describe('createMimeRouter', () => {
  it('instrada immagini, pdf, spreadsheet e fallback', async () => {
    const calls: string[] = [];
    const router = createMimeRouter<string>({
      image: async () => {
        calls.push('image');
        return 'img';
      },
      pdf: async () => {
        calls.push('pdf');
        return 'pdf';
      },
      spreadsheet: async () => {
        calls.push('sheet');
        return 'sheet';
      },
      document: async () => {
        calls.push('doc');
        return 'doc';
      },
    });

    expect(await router('x', 'image/png')).toBe('img');
    expect(await router('x', 'application/pdf')).toBe('pdf');
    expect(await router('x', 'text/csv')).toBe('sheet');
    expect(await router('x', 'application/vnd.ms-excel')).toBe('sheet');
    expect(
      await router('x', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    ).toBe('sheet');
    expect(await router('x', 'application/msword')).toBe('doc');
    expect(calls).toEqual(['image', 'pdf', 'sheet', 'sheet', 'sheet', 'doc']);
  });

  it('usa fallback se definito', async () => {
    const fallback = vi.fn().mockResolvedValue('fallback');
    const router = createMimeRouter<string>({ fallback });
    await router('x', 'unknown/type');
    expect(fallback).toHaveBeenCalledOnce();
  });
});
