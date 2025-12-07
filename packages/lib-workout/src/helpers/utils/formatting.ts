/**
 * Formatting Utilities
 *
 * Utility functions per formattazione testo
 */

/**
 * Formatta una label muscolo in Title Case
 */
export function formatMuscleLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed
    .split(/\s+|_/)
    .filter(Boolean)
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Converte una stringa in Title Case
 */
export function toTitleCase(value: string): string {
  return value
    .split(/\s+|_|-/)
    .filter(Boolean)
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
