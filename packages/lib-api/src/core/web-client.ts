/**
 * Web API Client
 *
 * Implementazione web di BaseApiClient per Next.js
 */

import { BaseApiClient } from './base-client';

export class WebApiClient extends BaseApiClient {
  protected getDefaultBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  protected async getAuthToken(): Promise<string | null> {
    // NextAuth handles auth via cookies, no token needed
    return null;
  }

  protected async saveAuthToken(_token: string): Promise<void> {
    // Not used in web - NextAuth handles this
  }
}
