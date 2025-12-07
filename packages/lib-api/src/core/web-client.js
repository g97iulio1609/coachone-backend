/**
 * Web API Client
 *
 * Implementazione web di BaseApiClient per Next.js
 */
import { BaseApiClient } from './base-client';
export class WebApiClient extends BaseApiClient {
    getDefaultBaseUrl() {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    }
    async getAuthToken() {
        // NextAuth handles auth via cookies, no token needed
        return null;
    }
    async saveAuthToken(_token) {
        // Not used in web - NextAuth handles this
    }
}
