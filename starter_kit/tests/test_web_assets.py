from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import unittest


STATIC = Path(__file__).resolve().parents[1] / "loomq" / "web" / "static"


class MarkupAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1_count = 0
        self.labels = set()
        self.buttons_without_type = []
        self.live_regions = 0
        self.details_count = 0
        self.external_resources = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "h1":
            self.h1_count += 1
        if tag == "label" and attributes.get("for"):
            self.labels.add(attributes["for"])
        if tag == "button" and not attributes.get("type"):
            self.buttons_without_type.append(attributes)
        if attributes.get("aria-live"):
            self.live_regions += 1
        if tag == "details":
            self.details_count += 1
        for name in ("src", "href"):
            value = attributes.get(name, "")
            if value.startswith(("http://", "https://", "//")):
                self.external_resources.append(value)

    def handle_data(self, data):
        self.text.append(data)


class WebAssetContractTests(unittest.TestCase):
    def setUp(self):
        self.paths = {
            "html": STATIC / "index.html",
            "css": STATIC / "styles.css",
            "js": STATIC / "app.js",
        }
        for name, path in self.paths.items():
            self.assertTrue(path.is_file(), f"missing {name} asset: {path}")

    def test_markup_has_one_clear_task_and_accessible_controls(self):
        audit = MarkupAudit()
        audit.feed(self.paths["html"].read_text(encoding="utf-8"))
        page_text = " ".join(audit.text)

        self.assertEqual(audit.h1_count, 1)
        self.assertTrue({"prompt", "target", "shots"}.issubset(audit.labels))
        self.assertEqual(audit.buttons_without_type, [])
        self.assertGreaterEqual(audit.live_regions, 1)
        self.assertGreaterEqual(audit.details_count, 1)
        self.assertEqual(audit.external_resources, [])
        self.assertIn("把一句话", page_text)
        self.assertIn("这证明了什么", page_text)

    def test_css_contains_responsive_motion_and_touch_guardrails(self):
        css = self.paths["css"].read_text(encoding="utf-8")

        self.assertIn("prefers-reduced-motion: reduce", css)
        self.assertIn("max-width: 767px", css)
        self.assertIn("--text-primary:", css)
        self.assertIn("--border-default:", css)
        self.assertIn("min-height: 44px", css)

    def test_javascript_uses_safe_dom_rendering_and_same_origin_api(self):
        script = self.paths["js"].read_text(encoding="utf-8")

        self.assertIn("fetch('/api/experiment'", script)
        self.assertIn("textContent", script)
        self.assertNotIn("innerHTML", script)
        self.assertNotIn("http://", script)
        self.assertNotIn("https://", script)

    def test_server_module_help_starts_without_runtime_warning(self):
        repository_root = Path(__file__).resolve().parents[2]
        completed = subprocess.run(
            [sys.executable, "-m", "starter_kit.loomq.web.server", "--help"],
            cwd=repository_root,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertNotIn("RuntimeWarning", completed.stderr)


if __name__ == "__main__":
    unittest.main()
