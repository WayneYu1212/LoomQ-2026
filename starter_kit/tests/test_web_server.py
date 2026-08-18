import http.client
from http.server import ThreadingHTTPServer
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
from unittest import mock

from starter_kit.tests.test_agent_service import QueueingAPIHandler, VALID_GHZ, model_plan


try:
    from starter_kit.loomq.web.server import create_server
except ImportError:
    create_server = None


class LoomQHTTPServerTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(create_server, "LoomQ Lab HTTP server is missing")
        self.temporary = tempfile.TemporaryDirectory()
        root = Path(self.temporary.name)
        self.static_root = root / "static"
        self.static_root.mkdir()
        (self.static_root / "index.html").write_text("<h1>LoomQ test shell</h1>", encoding="utf-8")
        (root / "secret.txt").write_text("never serve this", encoding="utf-8")
        self.server = create_server("127.0.0.1", 0, static_root=self.static_root)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temporary.cleanup()

    def request(self, method, path, payload=None, raw_body=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=10)
        headers = {}
        if raw_body is None and payload is not None:
            raw_body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        if raw_body is not None:
            headers["Content-Type"] = "application/json"
        connection.request(method, path, body=raw_body, headers=headers)
        response = connection.getresponse()
        body = response.read()
        content_type = response.getheader("Content-Type", "")
        connection.close()
        parsed = json.loads(body) if "application/json" in content_type else body.decode("utf-8")
        return response.status, parsed

    def test_health_and_static_shell_are_same_origin(self):
        status, health = self.request("GET", "/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(health, {"status": "ok", "service": "LoomQ Lab", "version": "0.1.0"})

        status, page = self.request("GET", "/")
        self.assertEqual(status, 200)
        self.assertIn("LoomQ test shell", page)

    def test_offline_bell_example_runs_real_backend_without_llm(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            status, response = self.request(
                "POST",
                "/api/experiment",
                {"prompt": "让两枚量子硬币保持一致", "example": "bell", "target": "braket", "shots": 256},
            )

        self.assertEqual(status, 200)
        self.assertEqual(response["mode"], "local_example")
        self.assertEqual(response["kind"], "circuit")
        self.assertEqual(response["result"]["backend"], "braket_local_simulator")
        self.assertEqual(sum(response["result"]["counts"].values()), 256)
        self.assertEqual({item["status"] for item in response["verification"]["checks"]}, {"passed"})
        self.assertEqual(response["circuit"]["qubit_count"], 2)

    def test_agent_experiment_uses_real_compatible_endpoint(self):
        QueueingAPIHandler.responses = [model_plan("generate", qasm=VALID_GHZ)]
        QueueingAPIHandler.request_payloads = []
        llm_server = ThreadingHTTPServer(("127.0.0.1", 0), QueueingAPIHandler)
        llm_thread = threading.Thread(target=llm_server.serve_forever, daemon=True)
        llm_thread.start()
        environment = {
            "LOOMQ_LLM_BASE_URL": f"http://127.0.0.1:{llm_server.server_port}",
            "LOOMQ_LLM_API_KEY": "web-test-key",
            "LOOMQ_LLM_MODEL": "fake-deepseek",
            "LOOMQ_LLM_TIMEOUT_SECONDS": "2",
        }
        try:
            with mock.patch.dict(os.environ, environment, clear=True):
                status, response = self.request(
                    "POST",
                    "/api/experiment",
                    {"prompt": "生成 3 比特 GHZ", "target": "spinq", "shots": 128},
                )
        finally:
            llm_server.shutdown()
            llm_server.server_close()
            llm_thread.join(timeout=2)

        self.assertEqual(status, 200)
        self.assertEqual(response["mode"], "agent")
        self.assertEqual(response["kind"], "circuit")
        self.assertEqual(response["circuit"]["qubit_count"], 3)
        self.assertEqual(len(QueueingAPIHandler.request_payloads), 1)

    def test_invalid_requests_are_bounded_and_return_json_errors(self):
        cases = (
            ({"prompt": "", "target": "spinq", "shots": 8}, "invalid_request"),
            ({"prompt": "test", "target": "unknown", "shots": 8}, "invalid_request"),
            ({"prompt": "test", "target": "spinq", "shots": 0}, "invalid_request"),
        )
        for payload, error_code in cases:
            with self.subTest(payload=payload):
                status, response = self.request("POST", "/api/experiment", payload)
                self.assertEqual(status, 400)
                self.assertEqual(response["error"]["code"], error_code)

        status, response = self.request("POST", "/api/experiment", raw_body=b"{" + b"x" * 70_000)
        self.assertEqual(status, 413)
        self.assertEqual(response["error"]["code"], "request_too_large")

    def test_missing_static_file_and_traversal_never_escape_static_root(self):
        for path in ("/missing.js", "/%2e%2e/secret.txt"):
            with self.subTest(path=path):
                status, _response = self.request("GET", path)
                self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()
