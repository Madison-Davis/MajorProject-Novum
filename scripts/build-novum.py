#!/usr/bin/env python3
"""Build the Novum notes site from the Christian - Novum Obsidian folder."""

from __future__ import annotations

import html
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def strip_frontmatter(raw: str) -> str:
    match = re.match(r"\A---\s*\n.*?\n---[ \t]*(?:\n|$)", raw, re.DOTALL)
    return raw[match.end() :] if match else raw


def clean_line(line: str) -> str:
    line = line.strip()
    if line.startswith("**") and line.endswith("**") and len(line) >= 4:
        return line[2:-2].strip()
    return line


def parse_chapters(body: str) -> list[dict[str, object]]:
    """Use the Codex heading convention: #### chapters, ##### subsections."""
    chapters: list[dict[str, object]] = []
    chapter: dict[str, object] | None = None
    section: dict[str, object] | None = None
    pending: list[str] = []

    def flush() -> None:
        nonlocal pending
        text = " ".join(part.strip() for part in pending if part.strip())
        if text and section is not None:
            paragraphs = section["paragraphs"]
            assert isinstance(paragraphs, list)
            paragraphs.append(text)
        pending = []

    for original in body.splitlines():
        line = clean_line(original)

        if line.startswith("##### "):
            flush()
            section = {"subtitle": line[6:].strip(), "paragraphs": []}
            if chapter is not None:
                sections = chapter["sections"]
                assert isinstance(sections, list)
                sections.append(section)
        elif line.startswith("#### "):
            flush()
            section = {"subtitle": None, "paragraphs": []}
            chapter = {"title": line[5:].strip(), "sections": [section]}
            chapters.append(chapter)
        elif (
            not line
            or line == "---"
            or re.fullmatch(r"#{2,3}\s*<wbr\s*/?>", line, re.IGNORECASE)
        ):
            flush()
        elif chapter is not None:
            pending.append(line)

    flush()

    # Keep useful notes visible when a file has content but no chapter headings.
    if not chapters:
        paragraphs: list[str] = []
        pending_lines: list[str] = []
        for line in body.splitlines():
            if line.strip(" .\t"):
                pending_lines.append(line.strip())
            elif pending_lines:
                paragraphs.append(" ".join(pending_lines))
                pending_lines = []
        if pending_lines:
            paragraphs.append(" ".join(pending_lines))
        chapters = [
            {
                "title": "Notes",
                "sections": [{"subtitle": None, "paragraphs": paragraphs}],
            }
        ]
    return chapters


def render_page(title: str, chapters: list[dict[str, object]]) -> str:
    toc = []
    rendered_chapters = []

    for index, chapter in enumerate(chapters, start=1):
        active = " is-active" if index == 1 else ""
        chapter_title = str(chapter["title"])
        toc.append(
            f'<button class="toc-link{active}" data-target="ch-{index}" '
            f'aria-controls="ch-{index}">'
            f'<span class="toc-num">{index}</span>'
            f"<span>{html.escape(chapter_title)}</span></button>"
        )

        sections = chapter["sections"]
        assert isinstance(sections, list)
        body = []
        for section in sections:
            assert isinstance(section, dict)
            subtitle = section["subtitle"]
            if subtitle:
                body.append(f'<h3 class="tpl-chapter-subtitle">{html.escape(str(subtitle))}</h3>')
            paragraphs = section["paragraphs"]
            assert isinstance(paragraphs, list)
            body.extend(f"<p>{html.escape(str(paragraph))}</p>" for paragraph in paragraphs)

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
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../styles.css">
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
  <script>
        const links = document.querySelectorAll('.toc-link');
        links.forEach((link) => link.addEventListener('click', () => {{
            const target = document.getElementById(link.dataset.target);
            const current = document.querySelector('.tpl-chapter.is-active');
      if (!target || current === target) return;
            links.forEach((item) => item.classList.remove('is-active'));
            link.classList.add('is-active');
            current.style.opacity = '0';
            setTimeout(() => {{
                current.classList.remove('is-active');
                current.style.opacity = '';
                target.style.opacity = '0';
                target.classList.add('is-active');
                requestAnimationFrame(() => requestAnimationFrame(() => {{ target.style.opacity = '1'; }}));
            }}, 260);
    }}));
  </script>
</body>
</html>
'''


def build(source_root: Path, output_root: Path) -> int:
    if not source_root.is_dir():
        raise SystemExit(f"Source folder not found: {source_root}")

    if output_root.exists():
        shutil.rmtree(output_root)
    output_root.mkdir(parents=True)
    shutil.copy2(Path(__file__).resolve().parents[1] / "styles.css", output_root / "styles.css")

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
            relative_stem = note_path.relative_to(category_dir).with_suffix("")
            note_slug = "-".join(slugify(part) for part in relative_stem.parts).strip("-")
            if not note_slug:
                continue
            output_path = output_root / "pages" / category_slug / f"{note_slug}.html"
            output_path.parent.mkdir(parents=True, exist_ok=True)

            stem = note_path.stem
            card_title = re.sub(r"^[^-]+\s*-\s*", "", stem, count=1).strip() or stem
            chapters = parse_chapters(strip_frontmatter(note_path.read_text(encoding="utf-8")))
            output_path.write_text(render_page(stem.upper(), chapters), encoding="utf-8")

            href = quote(f"pages/{category_slug}/{note_slug}.html", safe="/-")
            cards.append(
                f'<a class="course-card" href="{html.escape(href, quote=True)}">'
                f'<h3>{html.escape(card_title)}</h3></a>'
            )
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
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
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
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-novum.py SOURCE_FOLDER OUTPUT_FOLDER")
    build(Path(sys.argv[1]), Path(sys.argv[2]))