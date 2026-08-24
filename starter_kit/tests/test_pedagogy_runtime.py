from __future__ import annotations

import http.client
import json
from pathlib import Path
import threading
import unittest
from unittest import mock

from starter_kit.loomq.compiler.parser import parse_qasm
from starter_kit.loomq.agent.verifier import verify_qasm
from starter_kit.loomq.web import server as web_server


ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "starter_kit" / "loomq" / "web" / "static"
LAUNCHER = ROOT / "starter_kit" / "scripts" / "run_web.ps1"


class BellTopologyAndPedagogyTests(unittest.TestCase):
    def test_bell_contract_keeps_h_cnot_then_measurement_order_and_mapping(self):
        report = verify_qasm(web_server.BELL_QASM)
        operations = report.circuit.operations
        self.assertEqual(
            [(type(operation).__name__, getattr(operation, "name", None), getattr(operation, "qubits", None), getattr(operation, "qubit", None)) for operation in operations],
            [
                ("Gate", "h", (0,), None),
                ("Gate", "cx", (0, 1), None),
                ("Measurement", None, None, 0),
                ("Measurement", None, None, 1),
            ],
        )

    def test_result_circuit_has_grouped_measurement_and_explicit_cnot_roles(self):
        script = (STATIC / "app.js").read_text(encoding="utf-8")
        for required in (
            "groupCircuitColumns",
            "measurement-glyph",
            "控制位 q0",
            "目标位 q1",
            "operation.qubits[0]",
            "operation.qubits[1]",
        ):
            self.assertIn(required, script)

    def test_pedagogy_interactions_expose_required_copy_and_controls(self):
        markup = (STATIC / "index.html").read_text(encoding="utf-8")
        script = (STATIC / "app.js").read_text(encoding="utf-8")
        compact = "".join(markup.split())
        for required in (
            'id="h-lab"',
            'id="h-single-run"',
            'id="h-shots-run"',
            'id="h-bloch-details"',
            'id="cnot-rule-result"',
            'class="cnot-rule-choice"',
            'id="bell-shot-lab"',
            'id="bell-one-shot"',
            'id="bell-auto-shots"',
            "H 把 |0⟩ 变成 |+⟩。",
            "如果现在在 Z 基测量，一次只会读出 0 或 1；重复很多次，二者会各占约一半。",
            "控制位是 0：目标位不变。",
            "控制位是 1：目标位翻转。",
            "CNOT 本身不等于“纠缠”",
            "在 Z 基测量理想 Bell Φ+ 态时，只会得到 00 或 11，各约 50%。",
            "shots 是把同一份电路重新准备并测量很多次。",
            "理想 / 本地教学可视化",
        ):
            self.assertIn("".join(required.split()), compact)
        for required in (
            "initHInteraction",
            "initCnotInteraction",
            "initBellShotAccumulator",
            "requestAnimationFrame",
            "prefers-reduced-motion",
        ):
            self.assertIn(required, script)
        self.assertNotIn("这个量子比特现在同时就是 0 和 1", compact)
        self.assertNotIn("setInterval(", script)


class JudgeAlignedBeginnerUxTests(unittest.TestCase):
    def test_v722_promise_outcome_and_agent_destination_are_explicit(self):
        markup = (STATIC / "index.html").read_text(encoding="utf-8")
        compact = "".join(markup.split())
        for required in (
            'id="hero-beginner-path"',
            'id="hero-agent-path"',
            'id="outcome-first"',
            'id="agent-entry"',
            'id="circuit-inspect"',
            "不懂量子也可以。先跑一次，再看发生了什么。",
            "LoomQ 会把你的自然语言变成量子电路、检查它、选择后端并把结果翻译成人话。",
            "带我完成第一次实验",
            "我有自己的问题",
            "00</strong><span>≈ 50%",
            "11</strong><span>≈ 50%",
            "看看它是怎么做到的",
            "现在，把你的问题说成人话就行。",
            "帮我生成一个 GHZ 态并测量",
            "这段 Bell 电路写错了，帮我修好",
            "我有一个 15 比特任务，不想排队，应该选哪个后端？",
            "同一类电路也已经交给了真实量子机器",
            "本地模拟",
            "API Key",
        ):
            self.assertIn("".join(required.split()), compact)

    def test_v722_beginner_order_keeps_agent_after_local_and_hardware_sections(self):
        markup = (STATIC / "index.html").read_text(encoding="utf-8")
        positions = {
            marker: markup.index(marker)
            for marker in (
                'id="outcome-first"',
                'id="onboarding"',
                'id="qubit"',
                'id="bell"',
                'id="experiment"',
                'id="evidence"',
                'id="agent-entry"',
                'id="tomography"',
            )
        }
        self.assertLess(positions['id="outcome-first"'], positions['id="onboarding"'])
        self.assertLess(positions['id="onboarding"'], positions['id="qubit"'])
        self.assertLess(positions['id="qubit"'], positions['id="bell"'])
        self.assertLess(positions['id="bell"'], positions['id="experiment"'])
        self.assertLess(positions['id="experiment"'], positions['id="evidence"'])
        self.assertLess(positions['id="evidence"'], positions['id="agent-entry"'])
        self.assertLess(positions['id="agent-entry"'], positions['id="tomography"'])

    def test_v722_copy_does_not_use_shortcut_misconceptions(self):
        markup = (STATIC / "index.html").read_text(encoding="utf-8")
        forbidden = (
            "旋转硬币",
            "同时既是正面又是反面",
            "同时遍历所有答案",
            "瞬间控制",
            "指数增长",
            "自动放大正确答案",
        )
        for phrase in forbidden:
            self.assertNotIn(phrase, markup)


class BackendAvailabilityAndLauncherTests(unittest.TestCase):
    def setUp(self):
        self.server = web_server.create_server("127.0.0.1", 0, static_root=STATIC)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def request(self, method: str, path: str, payload: object | None = None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=10)
        body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers = {} if body is None else {"Content-Type": "application/json"}
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        raw = response.read()
        content_type = response.getheader("Content-Type", "")
        connection.close()
        return response.status, json.loads(raw) if "application/json" in content_type else raw.decode("utf-8")

    def test_health_exposes_safe_backend_availability(self):
        status, payload = self.request("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(set(payload["backends"]), {"spinq", "originq", "braket"})
        for backend_id, details in payload["backends"].items():
            with self.subTest(backend_id=backend_id):
                self.assertIsInstance(details["available"], bool)
                self.assertNotIn("Traceback", details["status"])
                self.assertNotIn("C:\\", details["status"])

    def test_unavailable_backend_is_rejected_before_adapter_run(self):
        unavailable = {
            "spinq": {"available": False, "dependency": "spinqit==0.2.4", "status": "missing dependency"},
            "originq": {"available": True, "dependency": "pyqpanda", "status": "available"},
            "braket": {"available": True, "dependency": "amazon-braket-sdk", "status": "available"},
        }
        with mock.patch.object(web_server, "backend_availability", create=True, return_value=unavailable), mock.patch.object(
            web_server.adapter,
            "run",
            side_effect=AssertionError("adapter.run must not be called for unavailable backend"),
        ):
            status, payload = self.request(
                "POST",
                "/api/experiment",
                {"prompt": "做一次 Bell 实验", "example": "bell", "target": "spinq", "shots": 100},
            )
        self.assertEqual(status, 503)
        self.assertEqual(payload["error"]["code"], "backend_unavailable")
        self.assertIn("starter_kit", payload["error"]["message"])
        self.assertIn("setup.ps1", payload["error"]["message"])

    def test_launcher_is_precise_and_checks_pinned_spinqit(self):
        self.assertTrue(LAUNCHER.is_file())
        launcher = LAUNCHER.read_text(encoding="utf-8")
        for required in (
            "$PSScriptRoot",
            ".venv\\Scripts\\python.exe",
            "spinqit",
            "0.2.4",
            "-m starter_kit.loomq.web.server",
            "http://127.0.0.1:",
            "starter_kit\\scripts\\setup.ps1",
        ):
            self.assertIn(required, launcher)
        self.assertNotIn("SpinQit is unavailable; run starter_kit/scripts/setup", launcher)


if __name__ == "__main__":
    unittest.main()
