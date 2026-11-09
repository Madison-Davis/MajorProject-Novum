"""Read the public Novum workbook without API keys or third-party packages."""
from __future__ import annotations

import html
import io
import math
import posixpath
import re
import warnings
import zipfile
import xml.etree.ElementTree as ET
from urllib.request import urlopen

WORKBOOK_URL = 'https://docs.google.com/spreadsheets/d/1lw2LpiM2jEvmdq0Gztmu4ftWzAi2UwILexoBLGTPfcA/export?format=xlsx'
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
ALIASES = {"paul's three missions": 'Pauls Journeys', 'comparative religion apolgetics': 'Comparative Religion'}


class SheetCells(dict):
    """Cell values with spreadsheet header-format metadata."""
    def __init__(self):
        super().__init__()
        self.grey_cells = set()


def is_grey_fill(fill):
    pattern = fill.find('s:patternFill', NS)
    if pattern is None or pattern.get('patternType') != 'solid':
        return False
    color = pattern.find('s:fgColor', NS)
    rgb = color.get('rgb', '')[-6:] if color is not None else ''
    if len(rgb) != 6:
        return False
    channels = [int(rgb[i:i + 2], 16) for i in (0, 2, 4)]
    return max(channels) - min(channels) <= 12 and 40 <= sum(channels) / 3 <= 248


def read_workbook(data: bytes, hyperlinks: dict | None = None) -> dict[str, dict]:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        def xml(path):
            return ET.fromstring(archive.read(path))
        strings = []
        if 'xl/sharedStrings.xml' in archive.namelist():
            strings = [''.join(node.itertext()) for node in xml('xl/sharedStrings.xml').findall('s:si', NS)]
        styles = xml('xl/styles.xml')
        fills = list(styles.find('s:fills', NS) or [])
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
            cells = SheetCells()
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
                    fill_id = int(style.get('fillId', '0'))
                    if fill_id < len(fills) and is_grey_fill(fills[fill_id]):
                        cells.grey_cells.add((int(row), col))
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
                # A leading asterisk keeps draft entries out of the site.
                if label.startswith('*'):
                    draft_label = label.lstrip('*').strip()
                    draft_name = names.get((target or ALIASES.get(draft_label.casefold(), draft_label)).casefold())
                    if draft_name:
                        used.add(draft_name)
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


def table_headers(cells):
    rows = sorted({r for r, c in cells})
    grey = getattr(cells, 'grey_cells', set())
    headers = []
    for row in rows:
        positions = [pos for pos in cells if pos[0] == row]
        if len(positions) >= 2 and sum(pos in grey for pos in positions) / len(positions) >= .6:
            headers.append(row)
    if not headers:
        headers = [next((r for r in rows if r >= rows[0] + 2 and
                        sum(rr == r for rr, c in cells) >= 2), rows[0])]
    return headers


def render_table(name, cells):
    if not cells:
        return '<p>This sheet is empty.</p>'
    rows = sorted({r for r, c in cells})
    headers = table_headers(cells)
    first_col = min(c for r, c in cells)

    def content(cell):
        value, italic, bold = cell
        value = html.escape(value)
        if italic:
            value = f'<em>{value}</em>'
        if bold:
            value = f'<strong>{value}</strong>'
        return value

    notes = [f'<span>{content(cell)}</span>' for (row, col), cell in sorted(cells.items())
             if row < headers[0] and col != first_col]
    output = ['<div class="sheet-legend">' + ''.join(notes) + '</div>'] if notes else []
    for index, header in enumerate(headers):
        end = headers[index + 1] if index + 1 < len(headers) else rows[-1] + 1
        # Drop entirely empty spacer columns, retaining every populated cell.
        columns = sorted({col for row, col in cells if header <= row < end})
        widths = []
        for col in columns:
            heading = cells.get((header, col), ('',))[0]
            lengths = sorted(len(cell[0]) for (row, c), cell in cells.items()
                             if header < row < end and c == col and cell[0].strip())
            typical = lengths[max(0, math.ceil(len(lengths) * .85) - 1)] if lengths else 0
            # Include padding and uppercase header lettering in the minimum width.
            heading_width = 3 + max((len(line) for line in heading.splitlines()), default=0) * .62
            content_width = min(60, 6 + math.sqrt(typical) * 2.5)
            if heading.strip().casefold() in {'description', 'notes', 'quote', 'verse', 'summary', 'definition', 'answer'} and typical > 80:
                content_width = max(36, content_width)
            widths.append(round(max(8, heading_width, content_width), 1))
        colgroup = '<colgroup>' + ''.join(f'<col style="width:{w}rem">' for w in widths) + '</colgroup>'
        headings = ''.join(f'<th scope="col">{content(cells.get((header, col), ("", False, False)))}</th>' for col in columns)
        body = []
        for row in rows:
            if not header < row < end:
                continue
            row_cells = {col: cell for (r, col), cell in cells.items() if r == row}
            if len(row_cells) == 1 and columns[0] in row_cells:
                body.append(f'<tr class="sheet-section"><th colspan="{len(columns)}">{content(row_cells[columns[0]])}</th></tr>')
                continue
            parts = []
            for col in columns:
                cell = cells.get((row, col), ('', False, False))
                tag = 'th scope="row"' if col == columns[0] else 'td'
                close_tag = 'th' if col == columns[0] else 'td'
                parts.append(f'<{tag}>{content(cell)}</{close_tag}>')
            body.append('<tr>' + ''.join(parts) + '</tr>')
        label = f'{name} — {cells.get((header, columns[0]), (name,))[0]}' if len(headers) > 1 else name
        output.append(f'<div class="sheet-table-wrap" role="region" aria-label="{html.escape(label, quote=True)} table" tabindex="0">'
                      f'<table class="sheet-table" style="width:{sum(widths):.1f}rem"><caption>{html.escape(label)}</caption>'
                      f'{colgroup}<thead><tr>{headings}</tr></thead><tbody>{"".join(body)}</tbody></table></div>')
    return ''.join(output)
