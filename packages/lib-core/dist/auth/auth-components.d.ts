/**
 * Auth UI Components
 *
 * Reusable components for common auth states
 * Follows DRY - no duplication of loading/error states
 */
/**
 * Loading state component for auth
 */
export declare function AuthLoading(): import("react/jsx-runtime").JSX.Element;
/**
 * Component that renders children only if authenticated
 * Shows loading or login required message otherwise
 */
export declare function RequireAuth({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Component that renders children only if user has required role
 */
export declare function RequireRole({ role, children, fallback, }: {
    role: 'ATHLETE' | 'COACH' | 'ADMIN' | 'SUPER_ADMIN';
    children: React.ReactNode;
    fallback?: React.ReactNode;
}): string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined>;
