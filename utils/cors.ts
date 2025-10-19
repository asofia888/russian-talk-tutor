import type { VercelResponse } from '@vercel/node';

/**
 * List of allowed origins for CORS
 */
const ALLOWED_ORIGINS = [
    'https://russian-talk-tutor.vercel.app',
    'https://russian-talk-tutor-asofia888s-projects.vercel.app', // Preview deployments
    'http://localhost:3000', // Local development
    'http://localhost:5173', // Vite dev server
] as const;

/**
 * Determines the appropriate CORS origin based on the request origin and environment
 *
 * @param origin - The origin from the request headers
 * @returns The allowed CORS origin to be set in the response header
 */
export function getCorsOrigin(origin: string | undefined): string {
    const isDevelopment = process.env['NODE_ENV'] === 'development';

    // In development mode, allow any origin or default to wildcard
    if (isDevelopment) {
        return origin ?? '*';
    }

    // In production, only allow origins from the whitelist
    if (typeof origin === 'string' && ALLOWED_ORIGINS.includes(origin as any)) {
        return origin;
    }

    // Default to the first allowed origin
    return ALLOWED_ORIGINS[0];
}

/**
 * Sets all necessary CORS headers on the response
 *
 * @param res - The Vercel response object
 * @param origin - The origin from the request headers
 */
export function setCorsHeaders(res: VercelResponse, origin: string | undefined): void {
    res.setHeader('Access-Control-Allow-Origin', getCorsOrigin(origin));
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handles OPTIONS preflight requests
 *
 * @param res - The Vercel response object
 */
export function handleCorsPreFlight(res: VercelResponse): void {
    res.status(200).end();
}
