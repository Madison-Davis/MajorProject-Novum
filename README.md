# Novum

## Where this gets published
- novvum.web.app on Firebase
  - Console site: https://console.firebase.google.com/project/novvum/overview?fb_utm_source=chatgpt.com

## How to push new content to website

- Edit notes in the iCloud `compaulo-codex` Obsidian vault.
    - When ready to insert, do `rsync -av --delete \
  --exclude '/.git/' --exclude '/.github/' --exclude '/.gitignore' \
  "$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/compaulo-codex/" \
  "$HOME/Desktop/Personal/Projects/compaulo-codex/"` to sync the local Desktop foler.
- Push changes from this local to remote `Madison-Davis/MajorProject-Compaulo-Codex` on `main`.
- Novum (its website and content from the vault) gets updated:
    - When you push to `Madison-Davis/MajorProject-Compaulo-Codex` (for the Obsidian notes)
    - When you push to `Madison-Davis/MajorProject-Novum`
    - Compaulo also updates when you push to the content repo or its website repo.

## GitHub secrets

- Add secrets under **Novum repository → Settings → Secrets and variables → Actions**.
- `CODEX_TOKEN`: a GitHub token with read access to the private `MajorProject-Compaulo-Codex` repository.
- A vault workflow that sends `codex-updated` needs its own token with permission to dispatch to Novum; the existing convention is `NOVUM_TOKEN` in the vault repository.

## How to stay up-to-date with Compaulo styling

- Source: [MajorProject-Compaulo](https://github.com/Madison-Davis/MajorProject-Compaulo).
- `shared-compaulo.css`: downloaded snapshot of Compaulo's shared Portfolio, Codex, and Cortex styles.
- `styles.css`: Novum's spreadsheet table styles; keep these when refreshing shared styles.
- The Novum atlas globe renderer and its required local texture assets are included in this repository and copied into the generated site by the builder. Its story types are present, but map data is intentionally empty until it is added.
- To refresh only the shared CSS, run from this repository:

```sh
curl -L --fail \
  https://raw.githubusercontent.com/Madison-Davis/MajorProject-Compaulo/main/styles.css \
  --output shared-compaulo.css
```
