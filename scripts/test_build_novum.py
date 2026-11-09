"""Check the shared Compaulo Markdown conventions and generated assets."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('build_novum', Path(__file__).with_name('build-novum.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class MarkdownRenderingTest(unittest.TestCase):
    def test_chapters_sections_and_markdown(self):
        chapters = builder.parse_chapters('#### Faith\nIntro **bold**.\n### Context\n- One\n- Two\n##### Evidence\n[[Private note|Label]]\n#### Hope\nText')
        self.assertEqual([c['title'] for c in chapters], ['Faith', 'Hope'])
        page = builder.render_page('Study', chapters)
        self.assertIn('<strong>bold</strong>', page)
        self.assertIn('<li>One</li>', page)
        self.assertIn('<p>Label</p>', page)
        self.assertIn('id="ch-1-section-1" open', page)
        self.assertIn('id="ch-2-subsections" hidden', page)
        self.assertIn('aria-controls="ch-1-section-3"', page)

    def test_editing_markers_removed_but_code_and_math_preserved(self):
        source = '#### Faith\n## <wbr>\n...\n---\n```text\n#### Literal heading\n## <wbr>\n```\n$$\nx^2\n$$\n<script>alert(1)</script>'
        chapters = builder.parse_chapters(source)
        self.assertEqual(len(chapters), 1)
        page = builder.render_page('Study', chapters)
        self.assertEqual(page.count('## &lt;wbr&gt;'), 1)
        self.assertIn('#### Literal heading', page)
        self.assertIn(r'\[x^2', page)
        self.assertNotIn('<script>alert(1)</script>', page)

    def test_build_copies_assets_and_keeps_sheet_tables(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'vault'
            category = source / 'Novum - Apologetics'
            category.mkdir(parents=True)
            (category / 'Study.md').write_text('#### Faith\n##### Evidence\nText')
            output = Path(folder) / 'site'
            cells = {(1, 1): ('Header', False, True), (2, 1): ('Content', False, False)}
            with patch.object(builder, 'load_topics', return_value={'Apologetics': [('Reference', cells)]}):
                count = builder.build(source, output, include_sheets=True)
            self.assertEqual(count, 2)
            self.assertTrue((output / 'shared-compaulo.css').is_file())
            self.assertTrue((output / 'chapter-viewer.js').is_file())
            page = (output / 'pages/apologetics/sheet-reference.html').read_text()
            self.assertIn('<table ', page)
            self.assertIn('Content', page)
            self.assertNotIn('<details ', page)


if __name__ == '__main__':
    unittest.main()
