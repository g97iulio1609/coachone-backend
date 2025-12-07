/**
 * Deep Clone Utility
 *
 * Centralized deep cloning utility to ensure DRY principle.
 * Provides both generic and type-safe deep clone functions.
 *
 * @module lib-workout/helpers/utils/deep-clone
 */

/**
 * Creates a deep clone of an object using JSON serialization.
 * Fast and simple for plain objects without circular references.
 *
 * @param obj - The object to clone
 * @returns A deep clone of the object
 *
 * @example
 * const program = { weeks: [...] };
 * const clone = deepClone(program);
 * // clone is completely independent from program
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates a shallow clone with specific nested paths deep cloned.
 * More efficient when only certain paths need deep cloning.
 *
 * @param obj - The object to clone
 * @param deepPaths - Array of paths to deep clone (dot notation)
 * @returns A mixed shallow/deep clone
 *
 * @example
 * const clone = selectiveDeepClone(program, ['weeks', 'metadata']);
 */
export function selectiveDeepClone<T extends Record<string, unknown>>(
  obj: T,
  deepPaths: string[]
): T {
  const result = { ...obj };

  for (const path of deepPaths) {
    if (path in result && result[path] !== undefined) {
      result[path as keyof T] = deepClone(result[path as keyof T]) as T[keyof T];
    }
  }

  return result;
}

/**
 * Checks if an object has any circular references.
 * Useful for debugging when JSON.stringify fails.
 *
 * @param obj - The object to check
 * @returns true if circular references exist
 */
export function hasCircularReference(obj: unknown): boolean {
  const seen = new WeakSet();

  function detect(value: unknown): boolean {
    if (value !== null && typeof value === 'object') {
      if (seen.has(value)) {
        return true;
      }
      seen.add(value);

      if (Array.isArray(value)) {
        return value.some(detect);
      }

      return Object.values(value).some(detect);
    }
    return false;
  }

  return detect(obj);
}

export default deepClone;
