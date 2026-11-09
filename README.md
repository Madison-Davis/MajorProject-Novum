# Compaulo Content Pipeline

This document describes how content flows from the Obsidian vault in `compaulo-codex` to the live site served out of `MajorProject-Novum`.

## Repositories involved

| Repo | Visibility | Role |
|---|---|---|
| `compaulo-codex` | — | Obsidian vault (`.obsidian/`) — source of notes/content |
| `MajorProject-Novum` | **Private** | Produces the site |
| `MajorProject-Compaulo-Codex` | Private | A sync of the Obsidian Vault hoisted onto GitHub |

## How to Add More Pages

1. Step 1: Notes are edited in the `compaulo-codex` Obsidian vault. All notes must follow the format Compaulo - Title.md and be located within Learn - Compaulo.
2. Step 2: Open the `MajorProject-Compaulo-Codex` repo.  It'll show the changes you made in Obsidian.
2. Step 3: Push the `MajorProject-Compaulo-Codex` repo to main.
3. Step 4: `MajorProject-Compaulo` will be notified of this change and update its pages.

## Repository Settings

1. Make a PAT `Novum & Codex`
1. In `MajorProject-Novum`, add the Actions secret `CODEX_TOKEN` with this PAT.
2. In `MajorProject-Compaulo-Codex`, add the Actions secret `NOVUM_TOKEN` with this PAT.

## Google Sheets tables

The Pages build also imports the [Novum workbook](https://docs.google.com/spreadsheets/d/1lw2LpiM2jEvmdq0Gztmu4ftWzAi2UwILexoBLGTPfcA/edit). It must remain readable without signing in. No API key is required. Each mapped tab becomes a table page with a card beside the Obsidian notes in its category. Text, line breaks, bold, and italic formatting are retained; grey header fills identify separate tables; other spreadsheet colors, merged cells, images, and interactive formulas are not reproduced (formula results are imported).

In **Table of Contents**, use the **Genre** column for an existing Novum category and any **Sheet** column for a link to its tab. The linked tab determines which table is imported; the cell label becomes the card title, so numbered tabs such as `1.1` work. Without a link, the label must match an exact tab name. Multiple unlinked names in one cell can be separated with line breaks. Repeated mappings within a category produce one card. The current spelling `Soteirology` and tab references `Paul's Three Missions` and `Comparative Religion Apolgetics` are supported as aliases. Prefer exact names for new entries.

Prefix a Table of Contents entry with `*` to exclude it from the site (for example, `*Comparative Religion Apolgetics`). Remove the asterisk when it is ready to publish. Other entries in the same cell remain eligible for import.

Tabs without mappings are reported in build logs and omitted from the library. Broken sheet mappings and unknown category names fail the build so misplaced content does not silently disappear. Download failures also stop deployment, preserving the previously deployed site.

Sheets refresh on each site build, including a daily scheduled build at 08:17 UTC and manual **Run workflow** runs in GitHub Actions. GitHub schedules may be delayed. Changes appear after these changes are pushed to `main` and the workflow succeeds.

For a local build with live Sheets data:

```sh
python3 scripts/build-novum.py /path/to/Christian\ -\ Novum site --google-sheets
```

For an offline build, download the workbook as Excel and use `--sheets-workbook /path/to/workbook.xlsx` instead. Omitting both flags builds only Obsidian notes.

## Open Novum locally

From this repository, run:

```sh
python3 scripts/build-local.py
```

This finds the adjacent `compaulo-codex` vault and downloads the current spreadsheet. Then open the repository's `index.html`, which forwards to the generated `site/index.html`. Rebuild after editing the vault or spreadsheet to refresh local content. For another vault location, pass `--source /path/to/Christian-Novum`. For an offline build, pass `--sheets-workbook /path/to/workbook.xlsx`.

The generated `site/` directory is ignored by Git. The deployed site continues to use the GitHub Actions build.

Grey-filled header rows start new tables within a sheet. Each table sizes its columns from its own content and omits entirely empty spacer columns.
