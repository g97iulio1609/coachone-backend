/**
 * Centralized Error Handler (Web)
 *
 * Provides consistent error responses across all API endpoints for Next.js.
 * Following SOLID principles - Single Responsibility for error handling.
 *
 * For React Native, use error-handler.native.ts instead.
 */

import { NextResponse } from 'next/server';
import { ERROR_CODES, HTTP_STATUS } from './ai/constants';
import type { ApiErrorResponse } from './error-handler/core';
import { createErrorResponseObject } from './error-handler/core';

// Re-export core types for convenience
export type { ApiErrorResponse } from './error-handler/core';

/**
 * Creates a standardized error response (Next.js)
 *
 * @param error - Error message
 * @param code - Error code from ERROR_CODES
 * @param status - HTTP status code
 * @param details - Optional additional details
 * @returns NextResponse with error
 */
export function createErrorResponse(
  error: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorResponse = createErrorResponseObject({ error, code, status, details });
  return NextResponse.json(errorResponse, { status });
}

/**
 * Creates an insufficient credits error
 */
export function insufficientCreditsError(required: number) {
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
export function invalidInputError(message: string, details?: unknown) {
  return createErrorResponse(message, ERROR_CODES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST, details);
}

/**
 * Creates an unauthorized error
 */
export function unauthorizedError(message: string = 'Non autorizzato') {
  return createErrorResponse(message, ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Creates a forbidden error
 */
export function forbiddenError(message: string = 'Accesso negato') {
  return createErrorResponse(message, ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
}

/**
 * Creates a not found error
 */
export function notFoundError(resource: string) {
  return createErrorResponse(
    `${resource} non trovato`,
    ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
}

/**
 * Creates an AI generation failed error
 */
export function aiGenerationError(message: string, details?: unknown) {
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
export function parseError(message: string = 'Errore nel parsing della risposta') {
  return createErrorResponse(message, ERROR_CODES.PARSE_ERROR, HTTP_STATUS.UNPROCESSABLE_ENTITY);
}

/**
 * Creates a validation error
 */
export function validationError(message: string, details?: unknown) {
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
export function rateLimitError(message: string = 'Troppi tentativi, riprova più tardi') {
  return createErrorResponse(
    message,
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    HTTP_STATUS.TOO_MANY_REQUESTS
  );
}

/**
 * Handles Zod validation errors
 */
export function handleZodError(error: unknown) {
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ message: string; path: (string | number)[] }> };
    return validationError(
      'Dati di input non validi',
      zodError.issues.map((issue: { message: string }) => issue.message)
    );
  }
  return validationError('Dati di input non validi', ['Errore di validazione sconosciuto']);
}

/**
 * Generic error handler that determines appropriate error type
 */
export function handleError(error: unknown): NextResponse {
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
