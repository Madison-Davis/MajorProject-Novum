#!/usr/bin/env python3
"""Build the Novum notes site from the Christian - Novum Obsidian folder."""

from __future__ import annotations

import argparse
import html
import hashlib
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote

from markdown_it import MarkdownIt
from mdit_py_plugins.dollarmath import dollarmath_plugin

from sheets import load_topics, render_table


def stylesheet_version() -> str:
    stylesheet = Path(__file__).resolve().parents[1] / "styles.css"
    return hashlib.sha256(stylesheet.read_bytes() + stylesheet.with_name("shared-compaulo.css").read_bytes()).hexdigest()[:12]


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def strip_frontmatter(raw: str) -> str:
    match = re.match(r"\A---\s*\n.*?\n---[ \t]*(?:\n|$)", raw, re.DOTALL)
    return raw[match.end() :] if match else raw


def render_math(content, options):
    opening, closing = (r'\[', r'\]') if options['display_mode'] else (r'\(', r'\)')
    return opening + html.escape(content) + closing


markdown = MarkdownIt('commonmark', {'html': False, 'breaks': True}).enable('table')
markdown.use(dollarmath_plugin, renderer=render_math, allow_labels=False)


def strip_editing_separators(body):
    # Inspect source ranges before cleaning so literal code and math are preserved.
    protected = set()
    for token in markdown.parse(body):
        if token.type in ('fence', 'code_block', 'math_block', 'math_block_label') and token.map:
            protected.update(range(*token.map))
    marker = re.compile(r'(?:##\s*<wbr\s*/?>|(?:\.\s*)+|-{2,})', re.IGNORECASE)
    return '\n'.join(
        '' if i not in protected and marker.fullmatch(line.strip()) else line
        for i, line in enumerate(body.splitlines())
    )


def parse_chapters(body, title="Notes"):
    # Parse before splitting so headings inside code/math blocks stay untouched.
    tokens = markdown.parse(strip_editing_separators(body))
    starts = [i for i, token in enumerate(tokens)
              if token.type == 'heading_open' and token.tag == 'h4' and token.level == 0]
    chapters = []
    for number, start in enumerate(starts):
        end = starts[number + 1] if number + 1 < len(starts) else len(tokens)
        chapters.append({'title': tokens[start + 1].content, 'tokens': tokens[start + 3:end]})
    if not chapters:
        chapters = [{'title': title, 'tokens': tokens}]
    return chapters


def split_sections(tokens):
    starts = [i for i, token in enumerate(tokens)
              if token.type == 'heading_open' and token.tag in ('h3', 'h5') and token.level == 0]
    sections = []
    if not starts:
        return [{'title': 'Overview', 'tokens': tokens}]
    if starts[0]:
        sections.append({'title': 'Overview', 'tokens': tokens[:starts[0]]})
    for number, start in enumerate(starts):
        end = starts[number + 1] if number + 1 < len(starts) else len(tokens)
        sections.append({'title': tokens[start + 1].content, 'tokens': tokens[start + 3:end]})
    return sections


def render_body(tokens):
    for token in tokens:
        if token.type in ('heading_open', 'heading_close') and token.tag == 'h5':
            token.tag = 'h3'
            if token.type == 'heading_open':
                token.attrSet('class', 'tpl-chapter-subtitle')
        # Unpublished Obsidian references display their label without broken links.
        for child in token.children or []:
            if child.type == 'text':
                child.content = re.sub(r'\[\[([^]\n]+)\]\]',
                                       lambda m: m.group(1).split('|')[-1], child.content)
    return markdown.renderer.render(tokens, markdown.options, {})



def render_page(title: str, chapters: list[dict[str, object]]) -> str:
    toc = []
    rendered_chapters = []

    for index, chapter in enumerate(chapters, start=1):
        active = " is-active" if index == 1 else ""
        chapter_title = str(chapter["title"])
        chapter_id = f'ch-{index}'
        expanded = str(index == 1).lower()
        hidden = '' if index == 1 else ' hidden'
        section_links = []
        body = []
        for section_index, section in enumerate(split_sections(chapter.get('tokens', [])), start=1):
            section_id = f'{chapter_id}-section-{section_index}'
            opened = index == 1 and section_index == 1
            section_title = html.escape(section['title'])
            section_links.append(
                f'<button class="toc-section-link" data-section="{section_id}" '
                f'aria-controls="{section_id}" aria-expanded="{str(opened).lower()}">'
                f'{section_title}</button>'
            )
            body.append(
                f'<details class="tpl-section" id="{section_id}"' + (' open' if opened else '') + '>'
                f'<summary><h3 class="tpl-chapter-subtitle">{section_title}</h3></summary>'
                f'<div class="tpl-section-body">{render_body(section["tokens"])}</div></details>'
            )
        if 'body_html' in chapter:
            body = [chapter['body_html']]
            section_links = []
        toc.append(
            f'<button class="toc-link{active}" data-target="{chapter_id}" '
            f'aria-controls="{chapter_id}-subsections" aria-expanded="{expanded}">'
            f'<span class="toc-num">{index}</span><span>{html.escape(chapter_title)}</span>'
            f'<span class="toc-chevron" aria-hidden="true">›</span></button>'
            f'<div class="toc-subsections" id="{chapter_id}-subsections"{hidden}>'
            + ''.join(section_links) + '</div>'
        )

        rendered_chapters.append(
            f'<div class="tpl-chapter{active}" id="ch-{index}">'
            f'<div class="tpl-chapter-header"><p class="kicker">CHAPTER {index}</p>'
            f'<h2 class="tpl-chapter-title">{html.escape(chapter_title)}</h2></div>'
            f'<div class="tpl-chapter-body">{"".join(body) or "<p>This chapter is empty.</p>"}</div>'
            "</div>"
        )

    title_html = html.escape(title)
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090909">
  <title>{title_html} — Novum</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;400;500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../styles.css?v={stylesheet_version()}">
  <script>
    window.MathJax = {{
      tex: {{ inlineMath: [['\\\\(', '\\\\)']], displayMath: [['\\\\[', '\\\\]']] }},
      options: {{ skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }}
    }};
  </script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js"></script>
</head>
<body>
    <header class="site-header"><div class="container nav-wrap">
        <a class="brand" href="../../index.html">NOVUM</a>
        <nav class="nav-pill" aria-label="Site navigation"><a class="nav-pill-link" href="../../index.html">LIBRARY</a></nav>
    </div></header>
    <div class="tpl-layout">
        <aside class="tpl-toc"><a class="tpl-back-btn" href="../../index.html">← Back</a>
            <p class="tpl-toc-label">CHAPTERS</p><nav>{"".join(toc)}</nav>
    </aside>
        <main class="tpl-content"><div class="tpl-content-header">
            <h1>NOVUM</h1><h3 class="tpl-content-title">{title_html}</h3>
        </div>{"".join(rendered_chapters)}</main>
  </div>
  <script src="../../chapter-viewer.js?v={stylesheet_version()}"></script>
</body>
</html>
'''


def build(source_root: Path, output_root: Path, sheets_workbook: Path | None = None, include_sheets: bool = False) -> int:
    if not source_root.is_dir():
        raise SystemExit(f"Source folder not found: {source_root}")

    sheet_topics = load_topics(sheets_workbook) if include_sheets or sheets_workbook else {}

    if output_root.exists():
        shutil.rmtree(output_root)
    output_root.mkdir(parents=True)
    assets = Path(__file__).resolve().parents[1]
    for name in ('styles.css', 'shared-compaulo.css'):
        shutil.copy2(assets / name, output_root / name)
    shutil.copy2(assets / 'scripts' / 'chapter-viewer.js', output_root / 'chapter-viewer.js')

    categories = sorted(
        (path for path in source_root.iterdir() if path.is_dir() and path.name.startswith("Novum - ")),
        key=lambda path: path.name.casefold(),
    )
    if not categories:
        raise SystemExit(f"No 'Novum - X' category folders found under: {source_root}")

    accordions = []
    total_pages = 0
    for category_index, category_dir in enumerate(categories, start=1):
        category = category_dir.name.removeprefix("Novum - ").strip()
        category_slug = slugify(category)
        note_files = sorted(category_dir.rglob("*.md"), key=lambda path: path.as_posix().casefold())
        cards = []

        for note_path in note_files:
            stem = note_path.stem
            card_title = re.sub(r"^[^-]+\s*-\s*", "", stem, count=1).strip() or stem
            if card_title.casefold() == "template":
                continue
            relative_stem = note_path.relative_to(category_dir).with_suffix("")
            note_slug = "-".join(slugify(part) for part in relative_stem.parts).strip("-")
            if not note_slug:
                continue
            output_path = output_root / "pages" / category_slug / f"{note_slug}.html"
            output_path.parent.mkdir(parents=True, exist_ok=True)

            chapters = parse_chapters(strip_frontmatter(note_path.read_text(encoding="utf-8")), card_title)
            output_path.write_text(render_page(stem.upper(), chapters), encoding="utf-8")

            href = quote(f"pages/{category_slug}/{note_slug}.html", safe="/-")
            cards.append(
                f'<a class="course-card" href="{html.escape(href, quote=True)}">'
                f'<h3>{html.escape(card_title)}</h3></a>'
            )
            total_pages += 1

        for sheet_name, cells in sheet_topics.pop(category, []):
            sheet_slug = "sheet-" + slugify(sheet_name)
            output_path = output_root / "pages" / category_slug / f"{sheet_slug}.html"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            page = render_page(sheet_name, [{"title": sheet_name, "body_html": render_table(sheet_name, cells)}])
            page = page.replace('>CHAPTERS</p>', '>CONTENTS</p>').replace('CHAPTER 1</p>', 'REFERENCE</p>')
            page = page.replace('<body>', '<body class="sheet-page">')
            output_path.write_text(page, encoding="utf-8")
            cards.append(f'<a class="course-card" href="pages/{category_slug}/{sheet_slug}.html">'
                         f'<h3>{html.escape(sheet_name)}</h3></a>')
            total_pages += 1

        if not cards:
            cards.append(f'<p class="course-empty">No {html.escape(category)} notes yet.</p>')
        accordions.append(
            f'<div class="lab-accord-item"><button class="lab-accord-header" aria-expanded="false">'
            f'<span class="lab-accord-num">{category_index:02d}</span>'
            f'<span class="lab-accord-title">{html.escape(category.upper())}</span>'
            f'<span class="lab-accord-chevron" aria-hidden="true">›</span></button>'
            f'<div class="lab-accord-body"><div class="lab-accord-inner">'
            f'<div class="course-grid lab-accord-grid">{"".join(cards)}</div>'
            f'</div></div></div>'
        )

    if sheet_topics:
        raise ValueError(f"Spreadsheet categories have no matching Obsidian folder: {', '.join(sheet_topics)}")

    index = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090909">
  <meta name="description" content="A living library of Christian theology notes and chapter summaries.">
  <title>Novum — Christian Studies</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;400;500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css?v={stylesheet_version()}">
</head>
<body>
    <header class="site-header"><div class="container nav-wrap">
        <a class="brand" href="#top">NOVUM</a>
        <nav class="nav-pill" aria-label="Site navigation"><a class="nav-pill-link" href="#top">LIBRARY</a></nav>
    </div></header>
    <main id="top"><section class="section reveal" style="padding-top:12rem;">
        <div class="container">
            <p class="kicker">CHRISTIAN STUDIES EXPLORER</p>
            <h1>NOVUM</h1>
            <p class="lead" style="margin-bottom:3.5rem;">A growing collection of notes across Christian theology. Pick a category to explore.</p>
            <div class="lab-accordion">{''.join(accordions)}</div>
        </div>
    </section></main>
  <script>
        document.addEventListener('click', function(e) {{
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.charAt(0) === '#' || link.target === '_blank' || href.indexOf('://') !== -1) return;
            e.preventDefault();
            document.body.classList.add('page-transitioning');
            setTimeout(function() {{ window.location.href = href; }}, 300);
        }}, true);

        document.querySelectorAll('.lab-accord-header').forEach((button) => {{
            button.addEventListener('click', () => {{
                const item = button.closest('.lab-accord-item');
                const open = item.classList.contains('is-open');
                item.classList.toggle('is-open', !open);
                button.setAttribute('aria-expanded', String(!open));
            }});
    }});

        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {{
            entry.isIntersecting
                ? entry.target.classList.add('is-visible')
                : entry.target.classList.remove('is-visible');
        }}), {{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }});
        document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  </script>
</body>
</html>
'''
    (output_root / "index.html").write_text(index, encoding="utf-8")
    print(f"Built {total_pages} note page(s) in {len(categories)} category/categories: {output_root}")
    return total_pages


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_folder", type=Path)
    parser.add_argument("output_folder", type=Path)
    parser.add_argument("--google-sheets", action="store_true", help="Download the Novum workbook")
    parser.add_argument("--sheets-workbook", type=Path, help="Use a local XLSX workbook instead")
    args = parser.parse_args()
    build(args.source_folder, args.output_folder, args.sheets_workbook, args.google_sheets)
