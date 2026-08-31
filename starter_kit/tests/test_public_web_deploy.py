from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
STATIC_ROOT = REPOSITORY_ROOT / "starter_kit" / "loomq" / "web" / "static"
BUILD_SCRIPT = REPOSITORY_ROOT / "scripts" / "build_public_showcase.py"
VERCEL_CONFIG = REPOSITORY_ROOT / "vercel.json"


class PublicExistingSiteBuildTests(unittest.TestCase):
    def build_public_site(self) -> Path:
        output = Path(tempfile.mkdtemp(prefix="loomq-public-test-"))
        completed = subprocess.run(
            [sys.executable, str(BUILD_SCRIPT), "--output", str(output)],
            cwd=REPOSITORY_ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        return output

    def test_build_copies_the_existing_competition_site_and_adds_only_public_metadata(self):
        public_root = self.build_public_site()
        public_html = (public_root / "index.html").read_text(encoding="utf-8")

        self.assertTrue((public_root / "index.html").is_file())
        self.assertTrue((public_root / "styles.css").is_file())
        self.assertTrue((public_root / "app.js").is_file())
        self.assertTrue((public_root / "favicon.svg").is_file())
        self.assertFalse((public_root / "showcase").exists())
        self.assertIn('data-public-showcase="true"', public_html)
        self.assertIn('rel="icon" href="favicon.svg"', public_html)
        self.assertIn("为什么反复运行同一份电路，结果会集中在 00 和 11？", public_html)
        self.assertIn('href="https://loomq.yuyuying.com/"', public_html)
        self.assertIn('content="https://loomq.yuyuying.com/"', public_html)
        self.assertEqual(
            (public_root / "styles.css").read_bytes(),
            (STATIC_ROOT / "styles.css").read_bytes(),
        )

    def test_public_bundle_contains_a_no_network_deterministic_replay_contract(self):
        public_root = self.build_public_site()
        script = (public_root / "app.js").read_text(encoding="utf-8")

        for required in (
            "isPublicShowcase",
            "initPublicShowcase",
            "createPublicBellReplay",
            "公开展示模式 · 已验证结果回放",
            "Showcase replay · verified local simulation result",
            "公开展示模式 · 此处不会调用外部模型或量子机器",
            "Public showcase mode · no external model or quantum hardware is called",
            "fetch('/api/health'",
            "fetch('/api/experiment'",
            "'公开展示模式 · 已验证结果回放': PUBLIC_REPLAY_LABEL_EN",
        ):
            self.assertIn(required, script)

        self.assertNotIn("127.0.0.1:8765", script)
        self.assertNotIn("localhost", script.lower())
        self.assertNotIn("LOOMQ_LLM_API_KEY=", script)
        self.assertNotIn("Authorization:", script)

    def test_public_bundle_preserves_archived_science_and_bilingual_contract(self):
        public_root = self.build_public_site()
        markup = (public_root / "index.html").read_text(encoding="utf-8")
        for required in (
            "SpinQ",
            "OriginQ",
            "Czz = 0.99955",
            "Cxx = 0.99956",
            "Cyy = -0.99865",
            "0.952449",
            "-0.4561",
            "OpenQASM",
            "tomography",
            "data-zh=",
            "data-en=",
        ):
            self.assertIn(required, markup)

    def test_vercel_config_uses_public_build_and_defense_in_depth_headers(self):
        config = json.loads(VERCEL_CONFIG.read_text(encoding="utf-8"))
        self.assertEqual(config["buildCommand"], "python scripts/build_public_showcase.py")
        self.assertEqual(config["outputDirectory"], "dist")
        self.assertTrue(config["cleanUrls"])
        headers = json.dumps(config.get("headers", []))
        self.assertIn("Content-Security-Policy", headers)
        self.assertIn("connect-src 'none'", headers)
        self.assertIn("X-Content-Type-Options", headers)


if __name__ == "__main__":
    unittest.main()
