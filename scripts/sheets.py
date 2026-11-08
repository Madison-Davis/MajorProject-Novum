"""Read the public Novum workbook without API keys or third-party packages."""
from __future__ import annotations

import html
import io
import posixpath
import re
import warnings
import zipfile
import xml.etree.ElementTree as ET
from urllib.request import urlopen

WORKBOOK_URL = 'https://docs.google.com/spreadsheets/d/1lw2LpiM2jEvmdq0Gztmu4ftWzAi2UwILexoBLGTPfcA/export?format=xlsx'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ALIASES = {"paul's three missions": 'Pauls Journeys', 'comparative religion apolgetics': 'Comparative Religion'}


def read_workbook(data: bytes, hyperlinks: dict | None = None) -> dict[str, dict]:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        def xml(path):
            return ET.fromstring(archive.read(path))
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings = [''.join(node.itertext()) for node in xml('xl/sharedStrings.xml').findall('s:si', NS)]
        styles = xml('xl/styles.xml')
        fonts = styles.find('s:fonts', NS)
        formats = {int(n.get('numFmtId')): n.get('formatCode', '') for n in styles.findall('s:numFmts/s:numFmt', NS)}
        xfs = list(styles.find('s:cellXfs', NS))
        relationships = {r.get('Id'): posixpath.normpath('xl/' + r.get('Target')) for r in xml('xl/_rels/workbook.xml.rels')}
        result = {}
        for sheet in xml('xl/workbook.xml').findall('s:sheets/s:sheet', NS):
            if sheet.get('state', 'visible') != 'visible':
                continue
            relation = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            document = xml(relationships[relation])
            if hyperlinks is not None:
                hyperlinks[sheet.get('name')] = {
                    link.get('ref'): link.get('location', '')
                    for link in document.findall('s:hyperlinks/s:hyperlink', NS)
                }
            cells = {}
            for cell in document.findall('s:sheetData/s:row/s:c', NS):
                value = cell.findtext('s:v', '', NS)
                kind = cell.get('t')
                if kind == 's':
                    value = strings[int(value)]
                elif kind == 'inlineStr':
                    value = ''.join(cell.find('s:is', NS).itertext())
                style = xfs[int(cell.get('s', '0'))]
                fmt_id = int(style.get('numFmtId', '0'))
                fmt = formats.get(fmt_id, '')
                # Sheets sometimes interprets Bible verses as a clock time.
                if value and kind not in ('s', 'inlineStr') and (fmt_id in (20, 21) or re.fullmatch(r'hh?:mm(?::ss)?', fmt, re.I)):
                    minutes = round(float(value) * 24 * 60)
                    value = f'{minutes // 60}:{minutes % 60:02d}'
                if value.strip():
                    letters, row = re.fullmatch(r'([A-Z]+)(\d+)', cell.get('r')).groups()
                    col = 0
                    for char in letters:
                        col = col * 26 + ord(char) - 64
                    font = fonts[int(style.get('fontId', '0'))]
                    cells[(int(row), col)] = (value, font.find('s:i', NS) is not None, font.find('s:b', NS) is not None)
            result[sheet.get('name')] = cells
        return result


def load_topics(workbook_path=None):
    if workbook_path:
        data = workbook_path.read_bytes()
    else:
        with urlopen(WORKBOOK_URL, timeout=60) as response:
            data = response.read()
    hyperlinks = {}
    sheets = read_workbook(data, hyperlinks)
    toc_name = next((name for name in sheets if name.casefold() == 'table of contents'), None)
    toc = sheets.get(toc_name)
    if toc is None:
        raise ValueError('Workbook has no Table of Contents sheet')
    header_row, genre_col = next((pos for pos, cell in toc.items() if cell[0].casefold() == 'genre'), (None, None))
    if header_row is None:
        raise ValueError('Table of Contents has no Genre column')
    sheet_cols = [col for (row, col), cell in toc.items() if row == header_row and cell[0].casefold() == 'sheet']
    if not sheet_cols:
        raise ValueError('Table of Contents has no Sheet columns')
    topics = {}
    used = set()
    category_sheets = set()
    names = {name.casefold(): name for name in sheets}
    for (row, col), cell in sorted(toc.items()):
        if row <= header_row or col != genre_col or not any((row, c) in toc for c in sheet_cols):
            continue
        category = cell[0].strip()
        if category.casefold() == 'soteirology':
            category = 'Soteriology'
        for c in sheet_cols:
            column = ''
            number = c
            while number:
                number, remainder = divmod(number - 1, 26)
                column = chr(65 + remainder) + column
            location = hyperlinks.get(toc_name, {}).get(f'{column}{row}', '')
            # Internal XLSX hyperlinks identify the actual tab even after renaming it.
            target = location.rsplit('!', 1)[0].strip("'").replace("''", "'") if '!' in location else ''
            text = toc.get((row, c), ('',))[0].strip()
            labels = [text.splitlines()[0]] if target and text else text.splitlines()
            for label in labels:
                label = label.strip()
                if not label:
                    continue
                name = names.get((target or ALIASES.get(label.casefold(), label)).casefold())
                if name is None or name == toc_name:
                    raise ValueError(f'Unknown sheet in Table of Contents at {column}{row}: {target or label}')
                if (category, name) not in category_sheets:
                    topics.setdefault(category, []).append((label, sheets[name]))
                    category_sheets.add((category, name))
                used.add(name)
    for name, cells in sheets.items():
        if name.casefold() != 'table of contents' and cells and name not in used:
            warnings.warn(f'Sheet is not mapped in Table of Contents: {name}')
    return topics


def render_table(name, cells):
    if not cells:
        return '<p>This sheet is empty.</p>'
    rows = sorted({r for r, c in cells})
    cols = [c for r, c in cells]
    first_col, last_col = min(cols), max(cols)
    # The workbook has a title/legend above each table, separated by a blank row.
    header = next((r for r in rows if r >= rows[0] + 2 and
                   sum(rr == r for rr, c in cells) >= 2), rows[0])

    def content(cell):
        value, italic, bold = cell
        value = html.escape(value)
        if italic:
            value = f'<em>{value}</em>'
        if bold:
            value = f'<strong>{value}</strong>'
        return value

    notes = []
    for (row, col), cell in sorted(cells.items()):
        if row < header and col != first_col:
            notes.append(f'<span>{content(cell)}</span>')
    legend = '<div class="sheet-legend">' + ''.join(notes) + '</div>' if notes else ''
    headings = ''.join(f'<th scope="col">{content(cells.get((header, col), ("", False, False)))}</th>'
                       for col in range(first_col, last_col + 1))
    output = []
    for row in rows:
        if row <= header:
            continue
        row_cells = {col: cell for (r, col), cell in cells.items() if r == row}
        if len(row_cells) == 1 and first_col in row_cells:
            output.append(f'<tr class="sheet-section"><th colspan="{last_col - first_col + 1}" scope="rowgroup">{content(row_cells[first_col])}</th></tr>')
            continue
        parts = []
        for col in range(first_col, last_col + 1):
            cell = cells.get((row, col), ('', False, False))
            tag = 'th scope="row"' if col == first_col else 'td'
            close_tag = 'th' if col == first_col else 'td'
            parts.append(f'<{tag}>{content(cell)}</{close_tag}>')
        output.append('<tr>' + ''.join(parts) + '</tr>')
    return (legend + f'<div class="sheet-table-wrap" role="region" aria-label="{html.escape(name, quote=True)} table" tabindex="0">'
            f'<table class="sheet-table"><caption>{html.escape(name)}</caption><thead><tr>{headings}</tr></thead>'
            f'<tbody>{"".join(output)}</tbody></table></div>')
