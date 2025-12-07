/**
 * Centralized Error Handler (React Native)
 *
 * Provides consistent error responses for React Native.
 * Returns plain objects instead of NextResponse.
 * Following SOLID principles - Single Responsibility for error handling.
 */

import { ERROR_CODES, HTTP_STATUS } from './ai/constants';
import type { ApiResponse } from './error-handler/core';
import { createErrorResponseObject, createApiResponseObject } from './error-handler/core';

type NativeApiResponse = ApiResponse<unknown>;

// Re-export core types for convenience
export type { ApiErrorResponse, ApiResponse } from './error-handler/core';

/**
 * Creates a standardized error response (React Native)
 *
 * @param error - Error message
 * @param code - Error code from ERROR_CODES
 * @param status - HTTP status code
 * @param details - Optional additional details
 * @returns ApiResponse with error
 */
export function createErrorResponse(
  error: string,
  code: string,
  status: number,
  details?: unknown
): NativeApiResponse {
  const errorResponse = createErrorResponseObject({ error, code, status, details });
  return createApiResponseObject<unknown>(undefined, errorResponse, status);
}

/**
 * Creates an insufficient credits error
 */
export function insufficientCreditsError(required: number): NativeApiResponse {
  return createErrorResponse(
    'Crediti insufficienti per questa operazione',
    ERROR_CODES.INSUFFICIENT_CREDITS,
    HTTP_STATUS.PAYMENT_REQUIRED,
    { required }
  );
}

/**
 * Creates an invalid input error
 */
export function invalidInputError(message: string, details?: unknown): NativeApiResponse {
  return createErrorResponse(message, ERROR_CODES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST, details);
}

/**
 * Creates an unauthorized error
 */
export function unauthorizedError(message: string = 'Non autorizzato'): NativeApiResponse {
  return createErrorResponse(message, ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Creates a forbidden error
 */
export function forbiddenError(message: string = 'Accesso negato'): NativeApiResponse {
  return createErrorResponse(message, ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
}

/**
 * Creates a not found error
 */
export function notFoundError(resource: string): NativeApiResponse {
  return createErrorResponse(
    `${resource} non trovato`,
    ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Creates an AI generation failed error
 */
export function aiGenerationError(message: string, details?: unknown): NativeApiResponse {
  return createErrorResponse(
    message,
    ERROR_CODES.AI_GENERATION_FAILED,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details
  );
}

/**
 * Creates a parse error
 */
export function parseError(
  message: string = 'Errore nel parsing della risposta'
): NativeApiResponse {
  return createErrorResponse(message, ERROR_CODES.PARSE_ERROR, HTTP_STATUS.UNPROCESSABLE_ENTITY);
}

/**
 * Creates a validation error
 */
export function validationError(message: string, details?: unknown): NativeApiResponse {
  return createErrorResponse(
    message,
    ERROR_CODES.VALIDATION_ERROR,
    HTTP_STATUS.BAD_REQUEST,
    details
  );
}

/**
 * Creates a rate limit error
 */
export function rateLimitError(
  message: string = 'Troppi tentativi, riprova più tardi'
): NativeApiResponse {
  return createErrorResponse(
    message,
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    HTTP_STATUS.TOO_MANY_REQUESTS
  );
}

/**
 * Handles Zod validation errors
 */
export function handleZodError(error: unknown): NativeApiResponse {
  return validationError('Dati di input non validi', (error as { errors?: unknown }).errors);
}

/**
 * Generic error handler that determines appropriate error type
 */
export function handleError(error: unknown): NativeApiResponse {
  // Zod validation error
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    return handleZodError(error);
  }

  // Error with message
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('crediti')) {
      return insufficientCreditsError(0);
    }
    if (error.message.includes('non autorizzato')) {
      return unauthorizedError(error.message);
    }
    if (error.message.includes('non trovato')) {
      return notFoundError('Risorsa');
    }

    // Generic error
    return createErrorResponse(error.message, 'INTERNAL_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // Unknown error
  return createErrorResponse(
    'Errore sconosciuto',
    'UNKNOWN_ERROR',
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}
