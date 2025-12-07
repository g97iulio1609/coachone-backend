/**
 * Error Handler Core - Cross-Platform Interfaces
 *
 * Re-exports from lib-shared for backwards compatibility.
 * The actual implementation now lives in @onecoach/lib-shared/utils/error/core-types
 * to avoid cyclic dependencies.
 */

export type {
  ApiErrorResponse,
  ApiResponse,
  CreateErrorResponseParams,
  ErrorCode,
  HttpStatus,
} from '@onecoach/lib-shared/utils/error/core-types';

export {
  createErrorResponseObject,
  createApiResponseObject,
  ERROR_CODES,
  HTTP_STATUS,
} from '@onecoach/lib-shared/utils/error/core-types';

