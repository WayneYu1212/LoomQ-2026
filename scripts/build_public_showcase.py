"""Build the existing LoomQ competition Web site as a public static bundle."""

from __future__ import annotations

import argparse
from pathlib import Path
import shutil


PUBLIC_ORIGIN = "https://loomq.yuyuying.com/"
PUBLIC_MARKER = 'data-public-showcase="true"'
PUBLIC_METADATA = """  <link rel="canonical" href="https://loomq.yuyuying.com/">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <meta name="robots" content="index,follow">
  <meta property="og:url" content="https://loomq.yuyuying.com/">
  <meta property="og:title" content="LoomQ · See It, Run It, Understand It">
  <meta property="og:description" content="LoomQ：先看见一个量子实验的结果，再亲手运行并理解它。">
"""
FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" role="img" aria-label="LoomQ">
  <circle cx="14" cy="14" r="2.25" fill="#0D0D0D"/>
  <ellipse cx="14" cy="14" rx="11" ry="4.5" fill="none" stroke="#0D0D0D" stroke-width="1.25"/>
  <ellipse cx="14" cy="14" rx="11" ry="4.5" fill="none" stroke="#0D0D0D" stroke-width="1.25" transform="rotate(60 14 14)"/>
  <ellipse cx="14" cy="14" rx="11" ry="4.5" fill="none" stroke="#0D0D0D" stroke-width="1.25" transform="rotate(120 14 14)"/>
</svg>
"""


def _prepare_html(source: Path) -> str:
    markup = source.read_text(encoding="utf-8")
    marker = '<html lang="zh-CN">'
    if marker not in markup:
        raise RuntimeError("existing LoomQ HTML marker is missing")
    markup = markup.replace(
        marker,
        f'<html lang="zh-CN" {PUBLIC_MARKER}>',
        1,
    )
    if 'rel="canonical"' not in markup:
        markup = markup.replace("</head>", PUBLIC_METADATA + "</head>", 1)
    # The public bundle never needs the local launch hint. Remove the address
    # from the static payload as a defense-in-depth measure; local source
    # behavior remains unchanged in starter_kit/loomq/web/static.
    markup = markup.replace("http://127.0.0.1:8765/", "the local LoomQ service")
    return markup


def _prepare_js(source: Path) -> str:
    script = source.read_text(encoding="utf-8")
    # Public mode returns before any local-service fallback can be reached.
    # Also avoid shipping the development address in the public JavaScript.
    return script.replace(
        "var localServiceUrl = 'http:' + '//127.0.0.1:8765/';",
        "var localServiceUrl = '';",
        1,
    )


def build_public_site(source_dir: Path | None = None, output_dir: Path | None = None) -> Path:
    repository_root = Path(__file__).resolve().parents[1]
    source_root = (source_dir or repository_root / "starter_kit" / "loomq" / "web" / "static").resolve()
    destination = (output_dir or repository_root / "dist").resolve()
    required = ("index.html", "styles.css", "app.js")

    if not source_root.is_dir() or not all((source_root / name).is_file() for name in required):
        raise RuntimeError(f"existing LoomQ static source is incomplete: {source_root}")
    if source_root == destination or source_root in destination.parents:
        raise RuntimeError("public output must not be inside the existing static source")

    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True, exist_ok=True)

    for item in source_root.iterdir():
        target = destination / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        elif item.name == "index.html":
            target.write_text(_prepare_html(item), encoding="utf-8", newline="")
        elif item.name == "app.js":
            target.write_text(_prepare_js(item), encoding="utf-8", newline="")
        else:
            shutil.copy2(item, target)

    (destination / "favicon.svg").write_text(FAVICON_SVG, encoding="utf-8", newline="")

    return destination


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="existing LoomQ static source directory")
    parser.add_argument("--output", type=Path, help="public bundle output directory")
    args = parser.parse_args()
    destination = build_public_site(args.source, args.output)
    print(f"Built LoomQ existing-site public bundle at {destination}")
    print(f"Source: {PUBLIC_ORIGIN} contract from starter_kit/loomq/web/static")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
