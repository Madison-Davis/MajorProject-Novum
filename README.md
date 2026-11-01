# MajorProject-Novum

Novum is a static, chapter-based reader generated from the Obsidian vault at
`Personal/Personal - Christian/Christian - Novum` in
`Madison-Davis/MajorProject-Compaulo-Codex`.

## Content conventions

- Every folder named `Novum - X` becomes a category accordion on the landing
  page.
- Every Markdown file inside one of those category folders becomes its own
  reader page. Files may use `####` for chapters and `#####` for subsections,
  matching the Compaulo Codex convention. Frontmatter is ignored.
- The site is built into the temporary `site/` folder; source-vault files are
  not included in the Pages artifact.

## Automatic publishing

The Codex vault's `main` branch workflow triggers this repository's Pages
workflow after each push.
GitHub Actions checks out the latest vault, rebuilds the category and chapter
pages, and deploys them to GitHub Pages. Pushes to this repository and manual
workflow dispatches also build and deploy the current vault content.

Novum source notes must be committed to `MajorProject-Compaulo-Codex` under
`Personal/Personal - Christian/Christian - Novum`; local Obsidian files that
are ignored or uncommitted are not available to the Actions build.

The site imports `https://compaulo.com/styles.css` so the landing page and
chapter reader use the same stylesheet as the Compaulo Codex page.

Configure these repository settings once:

1. In `MajorProject-Novum`, add the Actions secret `CODEX_TOKEN` with read
   access to the private `MajorProject-Compaulo-Codex` repository.
2. In `MajorProject-Compaulo-Codex`, add the Actions secret `NOVUM_TOKEN` with
	access to `MajorProject-Novum` and the **Actions: Read and write** permission
	so it can trigger the Novum deployment workflow.
3. In `MajorProject-Novum`, enable GitHub Pages with **GitHub Actions** as the
   build and deployment source.

The existing Codex-to-Compaulo dispatch remains in place. The Novum dispatch
is an additional notification, so the existing Compaulo publishing flow is not
replaced.

## Local build

Run `python3 scripts/build-novum.py SOURCE_FOLDER site`, where `SOURCE_FOLDER`
is the vault's `Personal/Personal - Christian/Christian - Novum` directory.
