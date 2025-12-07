/**
 * Retry Interceptor
 *
 * Interceptor per gestire retry automatico su errori 401 con refresh token
 */

import type { ResponseInterceptor, ApiError, ResponseConfig, RequestConfig } from '../core/types';

export class RetryInterceptor implements ResponseInterceptor {
  constructor(
    private refreshToken: () => Promise<void>,
    private retryRequest: (config: RequestConfig) => Promise<unknown>
  ) {}

  async onResponse<T>(response: ResponseConfig<T>): Promise<ResponseConfig<T>> {
    return response;
  }

  async onError(error: ApiError): Promise<unknown> {
    if (error.status === 401 && error.config && !error.config.skipAuth) {
      try {
        await this.refreshToken();
        return await this.retryRequest(error.config);
      } catch (refreshError: unknown) {
        throw error;
      }
    }
    throw error;
  }
}
