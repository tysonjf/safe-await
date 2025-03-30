# Releasing New Versions

This guide outlines the process for making changes, versioning, and publishing updates for the `@diemantra/safe-await` package.

## Development Workflow

1.  **Make Code Changes:** Edit the source files in the `src/` directory as needed.
2.  **Write/Update Tests:** If adding features or fixing bugs, add or update corresponding tests in `src/safe-await.test.ts`.
3.  **Run Tests:** Ensure all tests pass locally:
    ```bash
    pnpm test
    ```
    _(You can use `pnpm test:watch` during development for faster feedback.)_
4.  **Build Locally (Optional but Recommended):** Verify that the package builds correctly:
    ```bash
    pnpm build
    ```
5.  **Commit Changes:** Stage and commit your changes using Git. Use clear commit messages (following [Conventional Commits](https://www.conventionalcommits.org/) is good practice):
    ```bash
    git add . # Stage relevant changes
    git commit -m "feat: Add feature X" # Or fix:, chore:, docs:, etc.
    ```
6.  **Push Changes:** Push your commit(s) to the main branch on GitHub:
    ```bash
    git push origin main # Or your default branch name
    ```

## Publishing a New Release

Publishing is automated via GitHub Actions, triggered by pushing a Git tag that starts with `v`.

1.  **Ensure Main Branch is Up-to-Date:** Make sure you have the latest changes from the `main` branch and that all your local changes are committed and pushed.
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Increment Version & Tag:** Use `npm version` to automatically:

    - Increment the `version` in `package.json`.
    - Create a Git commit for the version bump.
    - Create a Git tag matching the new version (e.g., `v0.1.1`).

    Choose the correct command based on the type of changes (Semantic Versioning):

    - **Patch Release (Bug fixes):**
      ```bash
      npm version patch -m "chore: Release version %s"
      ```
      _(Example: 0.1.0 -> 0.1.1)_
    - **Minor Release (New features, non-breaking):**
      ```bash
      npm version minor -m "feat: Release version %s"
      ```
      _(Example: 0.1.1 -> 0.2.0)_
    - **Major Release (Breaking changes):**
      ```bash
      npm version major -m "feat!: Release version %s"
      ```
      _(Example: 0.2.0 -> 1.0.0)_

    _(Note: `%s` in the commit message is automatically replaced with the new version number.)_

3.  **Push Commit and Tag:** Push the commit created by `npm version` _and_ the new tag to GitHub. This triggers the release workflow.

    ```bash
    git push && git push --tags
    ```

4.  **Verify Publish:** Check the "Actions" tab in your GitHub repository to monitor the workflow. Once it completes successfully, verify the new version is available on [npmjs.com](https://www.npmjs.com/package/@diemantra/safe-await).

This process ensures that versions are managed consistently and releases are automated.
