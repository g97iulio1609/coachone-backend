/**
 * Imported Workout Schema
 *
 * Schema Zod intermedio per parsing file di workout.
 * Questo schema normalizza i dati da qualsiasi formato (XLSX, CSV, DOCX, immagini)
 * in una struttura uniforme prima della conversione in WorkoutProgram.
 *
 * @module lib-workout/schemas/imported-workout
 */

import { createId } from '@onecoach/lib-shared/utils';
import { cuid2Schema } from '@onecoach/schemas';
import { z } from 'zod';

/**
 * Schema per una singola serie importata (formato semplificato)
 */
export const ImportedSetSchema = z.object({
  reps: z.number().int().positive().optional(),
  repsMin: z.number().int().positive().optional(),
  repsMax: z.number().int().positive().optional(),
  duration: z.number().positive().optional(), // secondi
  weight: z.number().nonnegative().optional(), // kg
  weightMin: z.number().nonnegative().optional(),
  weightMax: z.number().nonnegative().optional(),
  rest: z.number().int().nonnegative().optional(), // secondi
  rpe: z.number().min(1).max(10).optional(),
  intensityPercent: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type ImportedSet = z.infer<typeof ImportedSetSchema>;

/**
 * Schema per un esercizio importato
 * Formato semplificato per facilitare il parsing AI
 */
export const ImportedExerciseSchema = z.object({
  /** Nome originale dall'import (verrà matchato con DB) */
  name: z.string().min(1),
  /** Nome alternativo/variante */
  variant: z.string().optional(),
  /** ID esercizio database (popolato dopo matching) */
  catalogExerciseId: z.string().optional(),
  /** Confidence del match (0-1) */
  matchConfidence: z.number().min(0).max(1).optional(),
  /** Flag se l'esercizio non è stato trovato nel DB */
  notFound: z.boolean().optional(),
  /** Gruppo/superset opzionale (es: "A", "B", "A1", "A2") */
  group: z.string().optional(),
  /** Formato compatto serie: "4x8" o "3x10-12" o "5x5 @80%" */
  setsNotation: z.string().optional(),
  /** Numero di serie */
  sets: z.number().int().positive().optional(),
  /** Ripetizioni (singolo valore o range) */
  reps: z.union([z.number().int().positive(), z.string()]).optional(),
  /** Peso in kg (singolo valore o range) */
  weight: z.union([z.number().nonnegative(), z.string()]).optional(),
  /** Recupero in secondi */
  rest: z.number().int().nonnegative().optional(),
  /** RPE (1-10) */
  rpe: z.number().min(1).max(10).optional(),
  /** Percentuale intensità 1RM */
  intensityPercent: z.number().min(0).max(100).optional(),
  /** Tempo sotto tensione (es: "3-1-2-0") */
  tempo: z.string().optional(),
  /** Note aggiuntive */
  notes: z.string().optional(),
  /** Serie dettagliate (se disponibili) */
  detailedSets: z.array(ImportedSetSchema).optional(),
  /** Attrezzatura richiesta */
  equipment: z.array(z.string()).optional(),
});

export type ImportedExercise = z.infer<typeof ImportedExerciseSchema>;

/**
 * Schema per un giorno di allenamento importato
 */
export const ImportedDaySchema = z.object({
  /** Numero del giorno (1-based) */
  dayNumber: z.number().int().positive(),
  /** Nome del giorno (es: "Push Day", "Giorno A", "Lunedì") */
  name: z.string().optional(),
  /** Tipo di allenamento */
  type: z.string().optional(),
  /** Muscoli target */
  targetMuscles: z.array(z.string()).optional(),
  /** Esercizi del giorno */
  exercises: z.array(ImportedExerciseSchema),
  /** Note del giorno */
  notes: z.string().optional(),
  /** Durata stimata in minuti */
  duration: z.number().int().positive().optional(),
  /** Warmup */
  warmup: z.string().optional(),
  /** Cooldown */
  cooldown: z.string().optional(),
});

export type ImportedDay = z.infer<typeof ImportedDaySchema>;

/**
 * Schema per una settimana importata
 */
export const ImportedWeekSchema = z.object({
  /** Numero della settimana (1-based) */
  weekNumber: z.number().int().positive(),
  /** Nome/focus della settimana */
  name: z.string().optional(),
  /** Focus della settimana (es: "Volume", "Intensità", "Deload") */
  focus: z.string().optional(),
  /** Giorni della settimana */
  days: z.array(ImportedDaySchema),
  /** Note della settimana */
  notes: z.string().optional(),
});

export type ImportedWeek = z.infer<typeof ImportedWeekSchema>;

/**
 * Schema principale per un programma importato
 */
export const ImportedWorkoutProgramSchema = z.object({
  /** ID del programma */
  id: cuid2Schema('ID programma non valido').default(() => createId()),
  /** Nome del programma */
  name: z.string().min(1),
  /** Descrizione */
  description: z.string().optional(),
  /** Difficoltà */
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  /** Durata in settimane */
  durationWeeks: z.number().int().positive().optional(),
  /** Obiettivi */
  goals: z.array(z.string()).optional(),
  /** Tipo di programma */
  programType: z.string().optional(),
  /** Settimane del programma */
  weeks: z.array(ImportedWeekSchema),
  /** Autore originale */
  originalAuthor: z.string().optional(),
  /** Fonte del file */
  sourceFile: z.string().optional(),
  /** Metadata aggiuntivi */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ImportedWorkoutProgram = z.infer<typeof ImportedWorkoutProgramSchema>;

/**
 * Schema per il risultato del parsing
 */
export const ParseResultSchema = z.object({
  /** Programma parsato */
  program: ImportedWorkoutProgramSchema,
  /** Warnings durante il parsing */
  warnings: z.array(z.string()),
  /** Esercizi non trovati nel DB */
  unmatchedExercises: z.array(
    z.object({
      name: z.string(),
      weekNumber: z.number(),
      dayNumber: z.number(),
      suggestions: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          confidence: z.number(),
        })
      ),
    })
  ),
  /** Statistiche parsing */
  stats: z.object({
    totalWeeks: z.number(),
    totalDays: z.number(),
    totalExercises: z.number(),
    matchedExercises: z.number(),
    unmatchedExercises: z.number(),
  }),
});

export type ParseResult = z.infer<typeof ParseResultSchema>;

/**
 * Schema per le opzioni di import
 */
export const ImportOptionsSchema = z.object({
  /** Modalità: auto (AI fa tutto) o review (utente conferma) */
  mode: z.enum(['auto', 'review']).default('auto'),
  /** Se creare esercizi non trovati nel DB */
  createMissingExercises: z.boolean().default(true),
  /** Soglia minima di confidence per match automatico (0-1) */
  matchThreshold: z.number().min(0).max(1).default(0.8),
  /** Lingua preferita per i nomi esercizi */
  locale: z.string().default('en'),
  /** Se preservare le progressioni originali */
  preserveProgressions: z.boolean().default(true),
  /** Se normalizzare i pesi (convertire lbs in kg) */
  normalizeWeights: z.boolean().default(true),
  /** Unità peso del file sorgente */
  sourceWeightUnit: z.enum(['kg', 'lbs']).default('kg'),
});

export type ImportOptions = z.infer<typeof ImportOptionsSchema>;

/**
 * Schema per un file da importare
 * NOTA: Schema flessibile - l'AI interpreterà qualsiasi contenuto
 */
export const ImportFileSchema = z.object({
  /** Nome del file */
  name: z.string(),
  /** Tipo MIME (opzionale, verrà dedotto se non presente) */
  mimeType: z.string().optional(),
  /** Contenuto base64 */
  content: z.string(),
  /** Dimensione in bytes (opzionale) */
  size: z.number().int().positive().optional(),
  /** Indice del foglio/pagina (per file multi-foglio) */
  sheetIndex: z.number().int().nonnegative().optional(),
  /** Nome del foglio (per file multi-foglio) */
  sheetName: z.string().optional(),
});

export type ImportFile = z.infer<typeof ImportFileSchema>;

/**
 * Schema per la richiesta di import completa
 */
export const ImportRequestSchema = z.object({
  /** File da importare (max 10) */
  files: z.array(ImportFileSchema).min(1).max(10),
  /** Opzioni di import */
  options: ImportOptionsSchema.optional(),
  /** ID utente */
  userId: z.string(),
});

export type ImportRequest = z.infer<typeof ImportRequestSchema>;

/**
 * MIME types supportati
 */
export const SUPPORTED_MIME_TYPES = {
  // Spreadsheet
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/csv': 'csv',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',

  // Documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/pdf': 'pdf',

  // Images
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_MIME_TYPES;

/**
 * Estensioni file supportate
 */
export const SUPPORTED_EXTENSIONS = [
  '.xlsx',
  '.xls',
  '.csv',
  '.ods',
  '.docx',
  '.doc',
  '.odt',
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

/**
 * Limiti di default per l'import
 */
export const IMPORT_LIMITS = {
  /** Dimensione massima file singolo in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Numero massimo di file per import */
  MAX_FILES: 10,
  /** Costo in crediti per import */
  DEFAULT_CREDIT_COST: 10,
  /** Rate limit: max import per ora */
  RATE_LIMIT_PER_HOUR: 5,
} as const;
