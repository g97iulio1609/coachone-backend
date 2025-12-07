/**
 * Database Initialization Utility
 *
 * Verifica e inizializza il database con dati necessari se mancanti.
 * Funzione idempotente che può essere eseguita più volte senza problemi.
 */
import { PrismaClient } from '@prisma/client';
interface InitResult {
  success: boolean;
  initialized: string[];
  skipped: string[];
  errors: string[];
}
/**
 * Inizializza il database con dati necessari se mancanti
 * Funzione idempotente - può essere eseguita più volte senza problemi
 */
export declare function initializeDatabase(
  prisma: PrismaClient,
  options?: {
    skipIfInitialized?: boolean;
  }
): Promise<InitResult>;
export {};
