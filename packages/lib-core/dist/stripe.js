/**
 * Stripe Server Client
 *
 * Client Stripe per operazioni server-side
 */
import Stripe from 'stripe';
/**
 * Restituisce un'istanza Stripe inizializzata
 */
export function getStripe() {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
        throw new Error('STRIPE_SECRET_KEY non configurata');
    }
    return new Stripe(secret, {
        apiVersion: '2025-10-29.clover',
        typescript: true,
        appInfo: {
            name: 'OneCoach',
            version: '0.1.0',
        },
    });
}
