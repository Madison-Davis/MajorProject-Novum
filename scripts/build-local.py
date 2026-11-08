#!/usr/bin/env python3
"""Build a local Novum library from the adjacent Obsidian vault and Google Sheets."""
import argparse
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=root.parent / 'compaulo-codex' / 'Personal' / 'Personal - Christian' / 'Christian - Novum', help='Path to the Christian - Novum vault folder')
parser.add_argument('--sheets-workbook', type=Path, help='Use a downloaded XLSX workbook for an offline build')
args = parser.parse_args()
if not args.source.is_dir():
    parser.error('Vault folder not found. Pass --source /path/to/Christian-Novum')
command = [sys.executable, str(root / 'scripts' / 'build-novum.py'), str(args.source), str(root / 'site')]
command += ['--sheets-workbook', str(args.sheets_workbook)] if args.sheets_workbook else ['--google-sheets']
subprocess.run(command, check=True)
print(f'Open {root / "index.html"} to view Novum.')
