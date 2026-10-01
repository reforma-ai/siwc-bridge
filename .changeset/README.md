# Changesets

Run `bun run changeset` for every user-facing change and commit the generated file with your pull request.

After changes reach `main`, the release workflow keeps a version pull request up to date. Merging that pull request publishes the package to npm through OIDC trusted publishing.
