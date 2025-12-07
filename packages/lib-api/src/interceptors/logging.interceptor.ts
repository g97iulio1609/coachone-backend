/**
 * Logging Interceptor
 *
 * Interceptor per logging di richieste e risposte (solo in development)
 */

import type {
  RequestInterceptor,
  ResponseInterceptor,
  RequestConfig,
  ResponseConfig,
} from '../core/types';

export class LoggingInterceptor implements RequestInterceptor, ResponseInterceptor {
  async onRequest(config: RequestConfig): Promise<RequestConfig> {
    return config;
  }

  async onResponse<T>(response: ResponseConfig<T>): Promise<ResponseConfig<T>> {
    return response;
  }
}
