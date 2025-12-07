/**
 * Auth Interceptor
 *
 * Interceptor per aggiungere automaticamente il token di autenticazione
 */

import type { RequestInterceptor, RequestConfig } from '../core/types';

export class AuthInterceptor implements RequestInterceptor {
  constructor(private getToken: () => Promise<string | null>) {}

  async onRequest(config: RequestConfig): Promise<RequestConfig> {
    if (!config.skipAuth) {
      const token = await this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  }
}
