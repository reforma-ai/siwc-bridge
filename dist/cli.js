#!/usr/bin/env node
import { DEFAULT_REDIRECT_URI, parseRedirectUri, parseWebhook, startRedirect } from './listen.js';
function arg(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
}
async function main() {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`Usage: siwc-bridge --api https://example.com/your/webhook [--redirect-uri ${DEFAULT_REDIRECT_URI}]`);
        return;
    }
    const redirectUri = arg('--redirect-uri') ?? DEFAULT_REDIRECT_URI;
    let listen;
    try {
        listen = parseRedirectUri(redirectUri);
    }
    catch (err) {
        console.error(err instanceof Error ? err.message : 'Bad redirect URI.');
        process.exitCode = 1;
        return;
    }
    const api = arg('--api');
    if (!api) {
        console.error('Pass --api https://example.com/your/webhook');
        process.exitCode = 1;
        return;
    }
    let webhook;
    try {
        webhook = parseWebhook(api);
    }
    catch (err) {
        console.error(err instanceof Error ? err.message : 'Bad webhook URL.');
        process.exitCode = 1;
        return;
    }
    console.log(`Forwarding ${redirectUri} to ${webhook}`);
    try {
        await startRedirect({ webhook, ...listen });
    }
    catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? err.code : undefined;
        console.error(code === 'EADDRINUSE'
            ? `Port ${listen.port} is already in use.`
            : 'Could not listen.');
        process.exitCode = 1;
    }
}
await main();
