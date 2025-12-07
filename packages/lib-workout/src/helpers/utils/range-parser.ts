/**
 * Range Parser
 *
 * Utility per parsing e formatting di input range come "8-10"
 * Gestisce edge cases: valori singoli, trattini invalidi, numeri decimali
 *
 * KISS: Funzioni pure, nessun side effect
 * DRY: Logica centralizzata per tutti i campi range
 *
 * @module lib-workout/helpers/utils/range-parser
 */

// =====================================================
// Types
// =====================================================

/**
 * Risultato del parsing di un range
 */
export interface ParsedRange {
  min: number;
  max?: number;
}

/**
 * Opzioni per il parsing
 */
export interface ParseRangeOptions {
  /** Valore minimo consentito (default: 0) */
  minValue?: number;
  /** Valore massimo consentito (default: Infinity) */
  maxValue?: number;
  /** Consenti decimali (default: true) */
  allowDecimals?: boolean;
  /** Arrotonda a N decimali (default: 1) */
  decimalPlaces?: number;
}

// =====================================================
// Constants
// =====================================================

const DEFAULT_OPTIONS: Required<ParseRangeOptions> = {
  minValue: 0,
  maxValue: Infinity,
  allowDecimals: true,
  decimalPlaces: 1,
};

// =====================================================
// Core Functions
// =====================================================

/**
 * Parsifica un input range nel formato "min-max" o "valore"
 *
 * Gestione sicura del trattino:
 * - "8-10" → { min: 8, max: 10 }
 * - "8" → { min: 8 }
 * - "-10" → { min: 10 } (trattino iniziale ignorato)
 * - "8-" → { min: 8 }
 * - "" → null
 *
 * @param input - Stringa input (es. "8-10", "80", "6.5-8")
 * @param options - Opzioni di parsing
 * @returns ParsedRange o null se input invalido
 *
 * @example
 * parseRange("8-10") // { min: 8, max: 10 }
 * parseRange("80") // { min: 80 }
 * parseRange("6.5-8.5", { decimalPlaces: 1 }) // { min: 6.5, max: 8.5 }
 */
export function parseRange(
  input: string | number | null | undefined,
  options: ParseRangeOptions = {}
): ParsedRange | null {
  // Gestione input non-stringa
  if (input === null || input === undefined) return null;

  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (typeof input === 'number') {
    return validateAndClamp(input, undefined, opts);
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Rimuovi trattini iniziali (valori negativi non hanno senso per fitness)
  const sanitized = trimmed.replace(/^-+/, '');
  if (!sanitized) return null;

  // Cerca il separatore "-" ma non all'inizio
  // Pattern: numero opzionalmente seguito da "-numero"
  const match = sanitized.match(/^(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?$/);

  if (!match) {
    // Fallback: prova a estrarre solo numeri
    const numbers = sanitized.match(/\d+(?:\.\d+)?/g);
    if (!numbers || numbers.length === 0) return null;

    const min = parseFloat(numbers[0]!);
    const max = numbers[1] ? parseFloat(numbers[1]) : undefined;
    return validateAndClamp(min, max, opts);
  }

  const min = parseFloat(match[1]!);
  const max = match[2] ? parseFloat(match[2]) : undefined;

  return validateAndClamp(min, max, opts);
}

/**
 * Formatta un range in stringa "min-max" o "min"
 *
 * @param min - Valore minimo
 * @param max - Valore massimo (opzionale)
 * @param decimalPlaces - Decimali da mostrare (default: auto)
 * @returns Stringa formattata
 *
 * @example
 * formatRange(8, 10) // "8-10"
 * formatRange(80) // "80"
 * formatRange(6.5, 8.5) // "6.5-8.5"
 */
export function formatRange(
  min: number | null | undefined,
  max?: number | null,
  decimalPlaces?: number
): string {
  if (min === null || min === undefined) return '';

  const formatNumber = (n: number): string => {
    if (decimalPlaces !== undefined) {
      return n.toFixed(decimalPlaces).replace(/\.?0+$/, '');
    }
    // Auto: rimuovi decimali se sono .0
    return Number.isInteger(n) ? n.toString() : n.toFixed(1).replace(/\.?0+$/, '');
  };

  const minStr = formatNumber(min);

  if (max !== null && max !== undefined && max !== min) {
    return `${minStr}-${formatNumber(max)}`;
  }

  return minStr;
}

/**
 * Parsifica e ritorna i valori separati per min e max
 * Utile per aggiornare campi del database
 *
 * @param input - Input range
 * @param fieldName - Nome campo base (es. "reps", "weight")
 * @returns Oggetto con campi min e max nominati
 *
 * @example
 * parseRangeToFields("8-10", "reps")
 * // { reps: 8, repsMax: 10 }
 */
export function parseRangeToFields<T extends string>(
  input: string | number | null | undefined,
  fieldName: T,
  options: ParseRangeOptions = {}
): Record<T | `${T}Max`, number | undefined> | null {
  const parsed = parseRange(input, options);
  if (!parsed) return null;

  const result = {
    [fieldName]: parsed.min,
    [`${fieldName}Max`]: parsed.max,
  } as Record<T | `${T}Max`, number | undefined>;

  return result;
}

/**
 * Verifica se un input rappresenta un range (min ≠ max)
 */
export function isRange(input: string | number | null | undefined): boolean {
  const parsed = parseRange(input);
  return parsed !== null && parsed.max !== undefined && parsed.max !== parsed.min;
}

/**
 * Ottiene il valore medio di un range
 */
export function getRangeMidpoint(input: string | number | null | undefined): number | null {
  const parsed = parseRange(input);
  if (!parsed) return null;

  if (parsed.max !== undefined) {
    return (parsed.min + parsed.max) / 2;
  }
  return parsed.min;
}

// =====================================================
// Preset Validators (DRY)
// =====================================================

/** Opzioni per parsing reps (intero, 1-100) */
export const REPS_OPTIONS: ParseRangeOptions = {
  minValue: 1,
  maxValue: 100,
  allowDecimals: false,
  decimalPlaces: 0,
};

/** Opzioni per parsing weight (decimale, 0-1000) */
export const WEIGHT_OPTIONS: ParseRangeOptions = {
  minValue: 0,
  maxValue: 1000,
  allowDecimals: true,
  decimalPlaces: 1,
};

/** Opzioni per parsing intensity % (decimale, 0-100) */
export const INTENSITY_OPTIONS: ParseRangeOptions = {
  minValue: 0,
  maxValue: 100,
  allowDecimals: true,
  decimalPlaces: 1,
};

/** Opzioni per parsing RPE (decimale, 1-10) */
export const RPE_OPTIONS: ParseRangeOptions = {
  minValue: 1,
  maxValue: 10,
  allowDecimals: true,
  decimalPlaces: 1,
};

/** Opzioni per parsing rest in secondi */
export const REST_OPTIONS: ParseRangeOptions = {
  minValue: 0,
  maxValue: 600,
  allowDecimals: false,
  decimalPlaces: 0,
};

// =====================================================
// Helper Shortcut Functions
// =====================================================

export const parseReps = (input: string | number | null | undefined) =>
  parseRange(input, REPS_OPTIONS);

export const parseWeight = (input: string | number | null | undefined) =>
  parseRange(input, WEIGHT_OPTIONS);

export const parseIntensity = (input: string | number | null | undefined) =>
  parseRange(input, INTENSITY_OPTIONS);

export const parseRPE = (input: string | number | null | undefined) =>
  parseRange(input, RPE_OPTIONS);

export const parseRest = (input: string | number | null | undefined) =>
  parseRange(input, REST_OPTIONS);

// =====================================================
// Private Helpers
// =====================================================

function validateAndClamp(
  min: number,
  max: number | undefined,
  options: Required<ParseRangeOptions>
): ParsedRange | null {
  if (isNaN(min)) return null;

  // Clamp min
  let clampedMin = Math.max(options.minValue, Math.min(options.maxValue, min));

  // Round if needed
  if (!options.allowDecimals) {
    clampedMin = Math.round(clampedMin);
  } else {
    clampedMin = roundTo(clampedMin, options.decimalPlaces);
  }

  // Process max
  let clampedMax: number | undefined;
  if (max !== undefined && !isNaN(max)) {
    clampedMax = Math.max(options.minValue, Math.min(options.maxValue, max));

    if (!options.allowDecimals) {
      clampedMax = Math.round(clampedMax);
    } else {
      clampedMax = roundTo(clampedMax, options.decimalPlaces);
    }

    // Ensure max >= min
    if (clampedMax < clampedMin) {
      // Swap values
      [clampedMin, clampedMax] = [clampedMax, clampedMin];
    }

    // If equal, treat as single value
    if (clampedMax === clampedMin) {
      clampedMax = undefined;
    }
  }

  return { min: clampedMin, max: clampedMax };
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export default parseRange;
