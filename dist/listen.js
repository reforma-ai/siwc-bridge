import http from 'node:http';
/** Loopback callback from OpenAI's sign-in example. */
export const DEFAULT_REDIRECT_URI = 'http://127.0.0.1:1455/auth/callback';
/** `--api` is the full webhook, not a host. The callback query is added to it. */
export function parseWebhook(webhook) {
    let url;
    try {
        url = new URL(webhook);
    }
    catch {
        throw new Error('--api must be the full webhook URL');
    }
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.pathname === '/' || url.pathname === '') {
        throw new Error('--api must be the full webhook URL, not only the host');
    }
    return webhook;
}
export function callbackTarget(webhook, search) {
    const url = new URL(webhook);
    const incoming = new URLSearchParams(search);
    for (const [key, value] of incoming) {
        url.searchParams.append(key, value);
    }
    return url.toString();
}
/** Loopback URL to listen on. The port is part of the URL. */
export function parseRedirectUri(redirectUri) {
    let url;
    try {
        url = new URL(redirectUri);
    }
    catch {
        throw new Error('redirect URI must be http://127.0.0.1:<port>/<path>');
    }
    const port = Number(url.port);
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('redirect URI must be http://127.0.0.1:<port>/<path>');
    }
    return { port, pathname: url.pathname };
}
/**
 * Listens on loopback and redirects one path to the webhook.
 * Stays up until `close`.
 */
export function startRedirect(options) {
    const { port } = options;
    const pathname = options.pathname ?? '/auth/callback';
    const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1');
        if (url.pathname !== pathname) {
            res.writeHead(404);
            res.end();
            return;
        }
        console.log('Received callback, forwarding.');
        res.writeHead(302, {
            location: callbackTarget(options.webhook, url.search),
        });
        res.end();
    });
    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => {
            const address = server.address();
            resolve({
                port: address.port,
                close: () => new Promise((done) => {
                    server.close(() => done());
                }),
            });
        });
    });
}
