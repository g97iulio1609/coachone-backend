/**
 * Error Handler Core - Cross-Platform Interfaces
 *
 * Common interfaces and types for error handling across platforms.
 * This module contains only types and interfaces, no platform-specific code.
 */

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  readonly error: string;
  readonly code: string;
  readonly details?: unknown;
  readonly timestamp: string;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  readonly data?: T;
  readonly error?: ApiErrorResponse;
  readonly status: number;
}

/**
 * Error response creation parameters
 */
export interface CreateErrorResponseParams {
  error: string;
  code: string;
  status: number;
  details?: unknown;
}

/**
 * Create a standardized error response object (cross-platform)
 *
 * This function returns a plain object that can be used on any platform.
 * Platform-specific wrappers (like NextResponse) should wrap this result.
 */
export function createErrorResponseObject(params: CreateErrorResponseParams): ApiErrorResponse {
  return {
    error: params.error,
    code: params.code,
    details: params.details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a standardized API response object (cross-platform)
 */
export function createApiResponseObject<T>(
  data?: T,
  error?: ApiErrorResponse,
  status: number = 200
): ApiResponse<T> {
  return {
    data,
    error,
    status,
  };
}
