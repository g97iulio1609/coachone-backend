/**
 * Stripe Client for Frontend
 *
 * Client Stripe per operazioni client-side (Stripe Elements)
 */
import { loadStripe } from '@stripe/stripe-js';
let stripePromise = null;
/**
 * Inizializza e restituisce l'istanza Stripe client-side.
 * Usa lazy loading per evitare di caricare Stripe finché non necessario.
 */
export function getStripeClient() {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY non configurata');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
