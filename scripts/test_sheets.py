"""Regression checks for linked TOC labels and renamed spreadsheet tabs."""
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from sheets import load_topics, SheetCells, render_table, table_headers, is_grey_fill
import xml.etree.ElementTree as ET


class SheetLinksTest(unittest.TestCase):
    def workbook(self, target="'1.1'!A1"):
        namespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        def worksheet(content):
            return f'<worksheet xmlns="{namespace}">{content}</worksheet>'
        def cell(ref, value):
            return f'<c r="{ref}" t="inlineStr"><is><t>{value}</t></is></c>'
        data = io.BytesIO()
        with zipfile.ZipFile(data, 'w') as archive:
            archive.writestr('xl/workbook.xml', f'<workbook xmlns="{namespace}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Table of Contents" r:id="a"/><sheet name="1.1" r:id="b"/></sheets></workbook>')
            archive.writestr('xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="a" Target="worksheets/sheet1.xml"/><Relationship Id="b" Target="worksheets/sheet2.xml"/></Relationships>')
            archive.writestr('xl/styles.xml', f'<styleSheet xmlns="{namespace}"><fonts><font/></fonts><cellXfs><xf/></cellXfs></styleSheet>')
            archive.writestr('xl/worksheets/sheet1.xml', worksheet('<sheetData><row>' + cell('C6', 'Genre') + cell('E6', 'Sheet') + '</row><row>' + cell('C7', 'Apologetics') + cell('E7', 'Readable title') + f'</row></sheetData><hyperlinks><hyperlink ref="E7" location="{target}"/></hyperlinks>'))
            archive.writestr('xl/worksheets/sheet2.xml', worksheet('<sheetData><row>' + cell('B6', 'Table content') + '</row></sheetData>'))
        return data.getvalue()

    def load(self, data):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'workbook.xlsx'
            path.write_bytes(data)
            return load_topics(path)

    def test_link_resolves_numbered_tab_and_keeps_display_title(self):
        topics = self.load(self.workbook())
        title, cells = topics['Apologetics'][0]
        self.assertEqual(title, 'Readable title')
        self.assertEqual(cells[(6, 2)][0], 'Table content')

    def test_broken_mapping_fails_instead_of_silently_omitting_button(self):
        with self.assertRaisesRegex(ValueError, 'Unknown sheet.*E7'):
            self.load(self.workbook("'missing'!A1"))


class TableLayoutTest(unittest.TestCase):
    def test_grey_headers_split_tables_and_keep_content(self):
        cells = SheetCells()
        for row, title in [(6, 'The Torah'), (12, 'Kings of Judah')]:
            for col, text in [(2, title), (3, 'Period'), (5, 'Description')]:
                cells[(row, col)] = (text, False, True)
                cells.grey_cells.add((row, col))
        cells[(7, 3)] = ('900 BC', False, False)
        cells[(7, 5)] = ('Long archaeological description. ' * 30, False, False)
        cells[(13, 3)] = ('800 BC', False, False)
        self.assertEqual(table_headers(cells), [6, 12])
        page = render_table('Archaeological', cells)
        self.assertEqual(page.count('<table '), 2)
        self.assertEqual(page.count('<col style='), 6)  # Empty spacer column is omitted.
        self.assertIn('900 BC', page)
        self.assertIn('800 BC', page)
        import re
        widths = [float(w) for w in re.findall(r'<col style="width:([\d.]+)rem">', page)]
        self.assertGreater(widths[2], widths[1])

    def test_grey_fill_excludes_white_and_colored_fills(self):
        ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
        for rgb, expected in [('FFF3F3F3', True), ('FF666666', True), ('FFFFFFFF', False), ('FFD9EAD3', False)]:
            fill = ET.fromstring(f'<fill xmlns="{ns}"><patternFill patternType="solid"><fgColor rgb="{rgb}"/></patternFill></fill>')
            self.assertEqual(is_grey_fill(fill), expected)


if __name__ == '__main__':
    unittest.main()
