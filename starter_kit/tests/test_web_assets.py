from html.parser import HTMLParser
from pathlib import Path
import re
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
        self.ids = set()
        self.classes = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.add(attributes["id"])
        self.classes.update(attributes.get("class", "").split())
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
        self.assertIn("推荐", page_text)
        self.assertIn("无需 LLM", page_text)
        self.assertIn("1 描述", page_text)
        self.assertIn("评测环境自动连接", page_text)
        self.assertIn("评测 / 本地调试说明", page_text)
        self.assertIn("当前打开的是静态文件", page_text)
        self.assertTrue({"launch-notice", "runtime-status", "runtime-status-copy"}.issubset(audit.ids))

    def test_css_contains_responsive_motion_and_touch_guardrails(self):
        css = self.paths["css"].read_text(encoding="utf-8")

        self.assertIn("prefers-reduced-motion: reduce", css)
        self.assertIn("max-width: 767px", css)
        self.assertIn("--text-primary:", css)
        self.assertIn("--border-default:", css)
        self.assertIn("min-height: 44px", css)
        self.assertIn("@media (min-width: 1024px)", css)
        self.assertIn("white-space: nowrap", css)
        self.assertIn(".runtime-status", css)

    def test_javascript_uses_safe_dom_rendering_and_same_origin_api(self):
        script = self.paths["js"].read_text(encoding="utf-8")

        self.assertIn("fetch('/api/experiment'", script)
        self.assertIn("fetch('/api/health'", script)
        self.assertIn("window.location.protocol === 'file:'", script)
        self.assertIn("agent_unavailable", script)
        self.assertIn("invalid_request", script)
        self.assertIn("execution_failed", script)
        self.assertIn("textContent", script)
        self.assertNotIn("innerHTML", script)
        self.assertNotIn("localStorage", script)
        self.assertNotIn("sessionStorage", script)
        self.assertNotIn("LOOMQ_LLM_API_KEY", script)
        self.assertNotIn("http://", script)
        self.assertNotIn("https://", script)

    def test_javascript_required_dom_selectors_exist_in_markup(self):
        audit = MarkupAudit()
        audit.feed(self.paths["html"].read_text(encoding="utf-8"))
        script = self.paths["js"].read_text(encoding="utf-8")
        selectors = re.findall(
            r"document\.querySelector(?:All)?\(['\"]([.#][A-Za-z0-9_-]+)['\"]\)",
            script,
        )
        missing = []
        for selector in selectors:
            collection = audit.ids if selector.startswith("#") else audit.classes
            if selector[1:] not in collection:
                missing.append(selector)

        self.assertEqual(missing, [], f"JavaScript references missing DOM selectors: {missing}")

    def test_quantum_field_keeps_v2_motion_and_reduced_motion_contract(self):
        script = self.paths["js"].read_text(encoding="utf-8")

        self.assertIn("isMobile ? 22 : 38", script)
        self.assertIn("Math.sin", script)
        self.assertIn("Math.cos", script)
        self.assertIn("drawFieldConnections", script)
        self.assertIn("distance < 160", script)
        self.assertIn("motionQuery.addEventListener('change'", script)
        self.assertIn("pauseQuantumField", script)
        self.assertNotIn("interference-layer", script)

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
