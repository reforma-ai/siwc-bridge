# Releasing

This repository uses Changesets for versions and GitHub Actions with npm trusted publishing for releases. No npm token is stored in GitHub.

## One-time bootstrap

The package must exist on npm before a trusted publisher can be attached to it. Publish the current `0.0.1` version once from a maintainer account:

```bash
npm login
bun install --frozen-lockfile
bun run build
npm publish --access public
```

Then open the `@reforma/siwc-bridge` package settings on npm and add a GitHub Actions trusted publisher with these values:

- Organization or user: `reforma-ai`
- Repository: `siwc-bridge`
- Workflow filename: `release.yml`
- Environment: leave empty
- Allowed actions: allow `npm publish`

In the GitHub repository settings, under **Actions → General → Workflow permissions**, enable read and write permissions and allow GitHub Actions to create pull requests.

## Normal release flow

1. Run `bun run changeset` in a feature branch and commit the generated file.
2. Merge the feature pull request into `main`.
3. The Release workflow creates or updates the version pull request.
4. Merge the version pull request when the accumulated changes are ready to publish.
5. The Release workflow publishes through npm OIDC, creates the git tag, and creates the GitHub release.

The initial changeset promotes `0.0.1` to `0.1.0`. Publish `0.0.1` manually before merging that first version pull request.
