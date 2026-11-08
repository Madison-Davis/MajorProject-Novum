"""Regression checks for linked TOC labels and renamed spreadsheet tabs."""
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from sheets import load_topics


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


if __name__ == '__main__':
    unittest.main()
