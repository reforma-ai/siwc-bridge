# @reforma/siwc-bridge

A small callback bridge for [Sign in with ChatGPT](https://developers.openai.com/siwc/token-sharing-open-source).

OpenAI redirects the browser to an approved URL or to a loopback address such as `http://127.0.0.1:<port>/auth/callback`. That can be inconvenient when the backend handling the authorization flow runs somewhere else—for example, in Docker, on a development hostname, or on a remote VM.

`@reforma/siwc-bridge` runs a small HTTP listener on the machine where the browser is open. It receives the loopback callback and redirects the browser to your backend endpoint, preserving the complete query string, including parameters such as `code` and `state`.

It is useful for:

- remote and self-hosted development environments;
- applications running in Docker or on VMs;
- development hostnames that cannot receive the OpenAI callback directly;
- architectures where the browser and the backend completing authorization run on different machines.

```text
OpenAI
   ↓
http://127.0.0.1:1455/auth/callback
   ↓
@reforma/siwc-bridge
   ↓
https://your-backend.example/auth/openai/callback
```

The package does not exchange, store, or modify credentials. It only redirects the callback from the local loopback listener to the endpoint you configure.

## Usage

Start the bridge and point `--api` at the full URL of your backend callback endpoint:

```bash
npx @reforma/siwc-bridge \
  --api https://api.example/auth/openai/connect/callback
```

By default, the bridge listens at:

```text
http://127.0.0.1:1455/auth/callback
```

If your authorization request uses a different loopback URI, pass the same value with `--redirect-uri`:

```bash
npx @reforma/siwc-bridge \
  --redirect-uri http://127.0.0.1:3000/auth/callback \
  --api https://api.example/auth/openai/connect/callback
```

Your application must use the same loopback URI as its `redirect_uri` when starting the OpenAI authorization flow.

## How it works

1. Your application starts the Sign in with ChatGPT flow with a loopback `redirect_uri`.
2. The user signs in and approves access.
3. OpenAI redirects the browser to the loopback callback on the browser's machine.
4. `@reforma/siwc-bridge` receives the callback.
5. It redirects the browser to the configured `--api` endpoint with the original query string intact.
6. Your backend validates `state` and exchanges the authorization code as usual.

This follows the general pattern in OpenAI's [guide for remote and self-hosted environments](https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms).

> Use Sign in with ChatGPT only where permitted by OpenAI's terms and documentation. This package is intended for open-source projects, development, testing, and supported remote-environment workflows.

## Requirements

Node.js 24 or newer.

## Development

Install dependencies and run the CLI directly from its TypeScript source:

```bash
bun install
bun run dev --api https://api.example/auth/openai/connect/callback
```

CLI arguments such as `--redirect-uri` work the same way as with the published package.
