import http from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';

import {
    callbackTarget,
    DEFAULT_REDIRECT_URI,
    parseRedirectUri,
    parseWebhook,
    startRedirect,
} from '../src/listen.js';

describe('siwc-bridge', () => {
    let close: (() => Promise<void>) | undefined;

    afterEach(async() => {
        await close?.();
        close = undefined;
    });

    it('should redirect the loopback callback to the API with the same query', async() => {
        const server = await startRedirect({
            webhook: 'https://api.localtest.me/auth/openai/connect/callback',
            port: 0,
        });

        close = server.close;

        const status = await new Promise<{ status: number; location: string | undefined }>((resolve, reject) => {
            const req = http.get(
                `http://127.0.0.1:${ server.port }/auth/callback?code=auth-code&state=abc&client_id=oaiapp_issued`,
                (res) => {
                    res.resume();
                    resolve({
                        status: res.statusCode ?? 0,
                        location: res.headers.location,
                    });
                }
            );

            req.on('error', reject);
        });

        expect(status.status).toBe(302);
        expect(status.location).toBe(callbackTarget(
            'https://api.localtest.me/auth/openai/connect/callback',
            '?code=auth-code&state=abc&client_id=oaiapp_issued'
        ));
    });

    it('should read the port and path from the redirect URI', () => {
        expect(parseRedirectUri(DEFAULT_REDIRECT_URI)).toEqual({
            port: 1455,
            pathname: '/auth/callback',
        });
        expect(parseRedirectUri('http://127.0.0.1:54321/auth/callback')).toEqual({
            port: 54321,
            pathname: '/auth/callback',
        });
        expect(() => parseRedirectUri('http://localhost:1455/auth/callback')).toThrow(/127\.0\.0\.1/);
        expect(() => parseRedirectUri('http://127.0.0.1/auth/callback')).toThrow(/127\.0\.0\.1/);
    });

    it('should reject a webhook that is only a host', () => {
        expect(parseWebhook('https://api.example/auth/openai/connect/callback')).toBe(
            'https://api.example/auth/openai/connect/callback'
        );
        expect(() => parseWebhook('https://api.example')).toThrow(/full webhook/);
    });
});
