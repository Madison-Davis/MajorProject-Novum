# Novum

## How to push new content to website

- Edit notes in the local `compaulo-codex` Obsidian vault.
    - Put Novum notes under `Personal/Personal - Christian/Christian - Novum/Novum - <Category>/`.
    - The builder imports Markdown notes from those category folders, including subfolders.
- Push vault changes to `Madison-Davis/MajorProject-Compaulo-Codex` on `main`.
- Novum (its website and content from the vault) gets updated:
    - Every Monday at 8 a.m. Pacific.
    - When you manually run Novum’s workflow.
    - When you push a change to Novum (`Madison-Davis/MajorProject-Novum` on `main`)

## GitHub secrets

- Add secrets under **Novum repository → Settings → Secrets and variables → Actions**.
- `CODEX_TOKEN`: a GitHub token with read access to the private `MajorProject-Compaulo-Codex` repository.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: the complete Google service account JSON key described below.
- A vault workflow that sends `codex-updated` needs its own token with permission to dispatch to Novum; the existing convention is `NOVUM_TOKEN` in the vault repository.

## How we set up private Google Cloud

- [Console for Cloud Project](https://console.cloud.google.com/welcome?_gl=1*nlvxro*_up*MQ..*_gs*MQ..&gclid=CjwKCAiA2MDXBhBUEiwAD-YB-7WbYsVfF3bRbPoPK90gxNW_9b05CVxouY8zGoCqP236uGSYK0E3rxoCf6MQAvD_BwE&gclsrc=aw.ds&project=novum-514203)
    - Google Cloud project: `novum-514203`.
- This downloads our spreadsheet to update content on the page.
    - Keep the [Novum spreadsheet](https://docs.google.com/spreadsheets/d/1lw2LpiM2jEvmdq0Gztmu4ftWzAi2UwILexoBLGTPfcA/edit) set to **Share → General access → Restricted**.
    - Share that spreadsheet with the cloud project's service account email as **Viewer**.
- How this was set up:
    - Enable **Google Drive API** in that project.
    - Service account: `novum-reader@novum-514203.iam.gserviceaccount.com`.
    - Keep the [Novum spreadsheet](https://docs.google.com/spreadsheets/d/1lw2LpiM2jEvmdq0Gztmu4ftWzAi2UwILexoBLGTPfcA/edit) set to **Share → General access → Restricted**.
    - Share that spreadsheet with the service account email as **Viewer**.
    - Allow that viewer to download the workbook.
    - The service account does not need a Google Cloud project role to read the shared spreadsheet.
    - Under **Google Cloud → IAM & Admin → Service Accounts → novum-reader → Keys**, create a JSON key.
    - Store the entire JSON file in the GitHub Actions secret `GOOGLE_SERVICE_ACCOUNT_JSON`.
    - Keep the key out of Git and chat. To replace it, create a new key, update the secret, verify a successful build, then delete the old key in Google Cloud.
    - The workflow authenticates with that key and requests read-only Drive access.
    - It exports the spreadsheet as Excel into the runner's temporary folder, then builds with `--sheets-workbook`.
    - The key and original workbook are not included in the published `site/` folder.
    - If export returns **403**, check the workflow's Google error message, API enablement, spreadsheet sharing, and download permissions.
    - If Google setup changes, update `.github/workflows/pages.yml` and the GitHub secret as needed.

## How content from Google Sheets pages gets put on website

- In **Table of Contents**, set **Genre** to an existing Novum category.
- In a **Sheet** column, link to the tab to import. The cell label becomes the page title.
    - Prefix an entry with `*` to exclude it (ex: not ready yet, still in draft). Remove `*` to publish it.
    - Tabs without mappings are omitted. Repeated mappings in one category produce one card.
- Styling:
    - Text, line breaks, bold, italic, and formula results are imported.
    - Grey-filled header rows start separate tables. Empty spacer columns are omitted.
    - Other colors, merged cells, images, and interactive formulas are not reproduced.
    - Failed downloads or broken mappings stop deployment and leave the previous website online.

## How to stay up-to-date with Compaulo styling

- Source: [MajorProject-Compaulo](https://github.com/Madison-Davis/MajorProject-Compaulo).
- `shared-compaulo.css`: downloaded snapshot of Compaulo's shared Portfolio, Codex, and Cortex styles.
- `styles.css`: Novum's spreadsheet table styles; keep these when refreshing shared styles.
- To refresh only the shared CSS, run from this repository:

```sh
curl -L --fail \
  https://raw.githubusercontent.com/Madison-Davis/MajorProject-Compaulo/main/styles.css \
  --output shared-compaulo.css
```