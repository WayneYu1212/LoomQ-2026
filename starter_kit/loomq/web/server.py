"""Same-origin static server and bounded JSON API for LoomQ Lab."""

from __future__ import annotations

import argparse
import importlib
import json
import mimetypes
from pathlib import Path
import re
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import unquote, urlsplit

adapter = importlib.import_module(
    "starter_kit.adapter" if (__package__ or "").startswith("starter_kit.") else "adapter"
)

from ..compiler.ir import Gate, Measurement
from ..compiler.metrics import circuit_metrics
from ..compiler.parser import parse_qasm
from ..agent.verifier import VerificationReport, verify_qasm


VERSION = "0.1.0"
MAX_REQUEST_BYTES = 65_536
MAX_SHOTS = 8_192
STATIC_ROOT = Path(__file__).resolve().parent / "static"


BELL_QASM = """OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;
"""


GHZ_QASM = """OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q -> c;
"""


LOCAL_EXAMPLES = {
    "bell": (
        BELL_QASM,
        "这是一个本地教学示例：先让第一个量子比特进入两种可能，再让第二个与它关联。",
    ),
    "ghz": (
        GHZ_QASM,
        "这是一个本地教学示例：三个量子比特会形成全 0 或全 1 的联合结果。",
    ),
}


def _extract_qasm(reply: str) -> str | None:
    match = re.search(r"OPENQASM\s+2\.0;.*\Z", reply, flags=re.I | re.S)
    return match.group(0).strip() + "\n" if match else None


def _circuit_payload(report: VerificationReport) -> dict[str, Any]:
    operations: list[dict[str, Any]] = []
    for operation in report.circuit.operations:
        if isinstance(operation, Gate):
            operations.append(
                {
                    "type": "gate",
                    "name": operation.name,
                    "qubits": list(operation.qubits),
                    "params": list(operation.params),
                }
            )
        elif isinstance(operation, Measurement):
            operations.append(
                {
                    "type": "measurement",
                    "qubit": operation.qubit,
                    "cbit": operation.cbit,
                }
            )
    return {
        "qubit_count": report.circuit.qubit_count,
        "cbit_count": report.circuit.cbit_count,
        "operations": operations,
        "metrics": circuit_metrics(report.circuit),
    }


def _verification_payload(report: VerificationReport, backend: str) -> dict[str, Any]:
    checks = [
        {"label": label, "status": "passed"}
        for label in report.checks
    ]
    checks.append({"label": f"真实本地后端完成：{backend}", "status": "passed"})
    return {
        "checks": checks,
        "summary": report.summary,
        "reference_distribution": report.distribution,
    }


def _validate_request(payload: object) -> tuple[str, str, int, str | None]:
    if not isinstance(payload, dict):
        raise ValueError("request body must be a JSON object")
    prompt = payload.get("prompt")
    target = payload.get("target")
    shots = payload.get("shots")
    example = payload.get("example")
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("prompt must be non-empty text")
    if not isinstance(target, str) or target not in adapter.SUPPORTED_TARGETS:
        raise ValueError("target must be spinq, originq, or braket")
    if isinstance(shots, bool) or not isinstance(shots, int) or not 1 <= shots <= MAX_SHOTS:
        raise ValueError(f"shots must be an integer between 1 and {MAX_SHOTS}")
    if example is not None and (not isinstance(example, str) or example not in LOCAL_EXAMPLES):
        raise ValueError("example must be bell, ghz, or omitted")
    return prompt.strip(), target, shots, example


def _experiment(payload: object) -> dict[str, Any]:
    prompt, target, shots, example = _validate_request(payload)
    qasm: str | None
    explanation: str
    if example is not None:
        qasm, explanation = LOCAL_EXAMPLES[example]
        reply = explanation + "\n\n" + qasm
        mode = "local_example"
    else:
        reply = adapter.agent_chat(prompt)
        qasm = _extract_qasm(reply)
        explanation = reply.split("OPENQASM 2.0;", 1)[0].strip()
        mode = "agent"

    if qasm is None:
        return {
            "mode": mode,
            "kind": "recommendation",
            "reply": reply,
            "qasm": None,
            "circuit": None,
            "verification": None,
            "result": None,
            "explanation": explanation,
        }

    report = verify_qasm(qasm)
    result = adapter.run(qasm, target, shots)
    return {
        "mode": mode,
        "kind": "circuit",
        "reply": reply,
        "qasm": report.qasm,
        "circuit": _circuit_payload(report),
        "verification": _verification_payload(report, result["backend"]),
        "result": result,
        "explanation": explanation,
    }


class _LoomQHandler(BaseHTTPRequestHandler):
    static_root = STATIC_ROOT

    def log_message(self, *_args: object) -> None:
        return

    def _headers(self, status: int, content_type: str, length: int) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(length))
        self.send_header("X-Content-Type-Options", "nosniff")
        if content_type.startswith("application/json"):
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header(
                "Content-Security-Policy",
                "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'",
            )
        self.end_headers()

    def _json(self, status: int, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._headers(status, "application/json; charset=utf-8", len(body))
        self.wfile.write(body)

    def _error(self, status: int, code: str, message: str) -> None:
        self._json(status, {"error": {"code": code, "message": message}})

    def do_GET(self) -> None:
        path = unquote(urlsplit(self.path).path)
        if path == "/api/health":
            self._json(
                HTTPStatus.OK,
                {"status": "ok", "service": "LoomQ Lab", "version": VERSION},
            )
            return
        relative = "index.html" if path == "/" else path.lstrip("/")
        root = self.static_root.resolve()
        candidate = (root / relative).resolve()
        if root not in candidate.parents or not candidate.is_file():
            self._error(HTTPStatus.NOT_FOUND, "not_found", "resource not found")
            return
        body = candidate.read_bytes()
        content_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {"application/javascript", "application/json"}:
            content_type += "; charset=utf-8"
        self._headers(HTTPStatus.OK, content_type, len(body))
        self.wfile.write(body)

    def do_POST(self) -> None:
        if urlsplit(self.path).path != "/api/experiment":
            self._error(HTTPStatus.NOT_FOUND, "not_found", "resource not found")
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._error(HTTPStatus.BAD_REQUEST, "invalid_request", "invalid Content-Length")
            return
        if length > MAX_REQUEST_BYTES:
            self._error(
                HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
                "request_too_large",
                f"request body exceeds {MAX_REQUEST_BYTES} bytes",
            )
            return
        if length <= 0:
            self._error(HTTPStatus.BAD_REQUEST, "invalid_request", "request body is required")
            return
        try:
            payload = json.loads(self.rfile.read(length))
            result = _experiment(payload)
        except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as exc:
            self._error(HTTPStatus.BAD_REQUEST, "invalid_request", str(exc))
            return
        except RuntimeError as exc:
            message = str(exc)
            if "LOOMQ_LLM_" in message or "L2 API" in message:
                self._error(
                    HTTPStatus.SERVICE_UNAVAILABLE,
                    "agent_unavailable",
                    "Agent 模型尚未配置或暂时不可用；你仍可运行本地 Bell/GHZ 示例。",
                )
            else:
                self._error(HTTPStatus.INTERNAL_SERVER_ERROR, "execution_failed", message)
            return
        except Exception:
            self._error(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                "internal_error",
                "实验未完成；请检查输入或稍后重试。",
            )
            return
        self._json(HTTPStatus.OK, result)


def create_server(
    host: str = "127.0.0.1",
    port: int = 8765,
    *,
    static_root: Path | None = None,
) -> ThreadingHTTPServer:
    root = (static_root or STATIC_ROOT).resolve()

    class Handler(_LoomQHandler):
        pass

    Handler.static_root = root
    return ThreadingHTTPServer((host, port), Handler)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the local LoomQ Lab")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = create_server(args.host, args.port)
    print(f"LoomQ Lab: http://{args.host}:{server.server_port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
