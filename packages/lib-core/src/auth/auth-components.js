/**
 * Auth UI Components
 *
 * Reusable components for common auth states
 * Follows DRY - no duplication of loading/error states
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@onecoach/lib-api-client/hooks';
/**
 * Loading state component for auth
 */
export function AuthLoading() {
  return _jsx('div', {
    className: 'flex min-h-screen items-center justify-center',
    children: _jsx(Loader2, { className: 'h-8 w-8 animate-spin text-blue-500' }),
  });
}
/**
 * Component that renders children only if authenticated
 * Shows loading or login required message otherwise
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return _jsx(AuthLoading, {});
  }
  if (!isAuthenticated) {
    return _jsx('div', {
      className: 'flex min-h-screen items-center justify-center',
      children: _jsxs('div', {
        className: 'text-center',
        children: [
          _jsx('p', {
            className: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
            children: 'Autenticazione richiesta',
          }),
          _jsx('p', {
            className: 'mt-2 text-gray-600 dark:text-gray-400',
            children: 'Effettua il login per accedere a questa pagina',
          }),
        ],
      }),
    });
  }
  return _jsx(_Fragment, { children: children });
}
/**
 * Component that renders children only if user has required role
 */
export function RequireRole({ role, children, fallback }) {
  const { isLoading, hasRole } = useAuth();
  if (isLoading) {
    return _jsx(AuthLoading, {});
  }
  if (!hasRole(role)) {
    return (
      fallback ??
      _jsx('div', {
        className: 'flex min-h-screen items-center justify-center',
        children: _jsxs('div', {
          className: 'text-center',
          children: [
            _jsx('p', {
              className: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
              children: 'Accesso negato',
            }),
            _jsx('p', {
              className: 'mt-2 text-gray-600 dark:text-gray-400',
              children: 'Non hai i permessi necessari per accedere a questa pagina',
            }),
          ],
        }),
      })
    );
  }
  return _jsx(_Fragment, { children: children });
}
