"""Real SpinQit BasicSimulator runner."""

from __future__ import annotations

import hashlib
import os
import tempfile
import uuid

from ..compiler.ir import Circuit
from ..compiler.metrics import circuit_metrics
from ..emitters import emit_spinq
from .result import build_result, remap_measured_qubits


_IMPORT_ERROR: ImportError | None
try:
    from spinqit import BasicSimulatorConfig, get_basic_simulator, get_compiler
except ImportError as exc:  # pragma: no cover - exercised in clean-env diagnostics
    BasicSimulatorConfig = None
    get_basic_simulator = None
    get_compiler = None
    _IMPORT_ERROR = exc
else:
    _IMPORT_ERROR = None


def run_spinq(circuit: Circuit, shots: int) -> dict[str, object]:
    if _IMPORT_ERROR is not None:
        raise RuntimeError("SpinQit is unavailable; run starter_kit/scripts/setup") from _IMPORT_ERROR
    source = emit_spinq(circuit)
    handle = tempfile.NamedTemporaryFile(
        mode="w", suffix=".qasm", delete=False, encoding="utf-8"
    )
    try:
        handle.write(source)
        handle.close()
        compiler = get_compiler("qasm")
        program = compiler.compile(handle.name, 0)
    finally:
        if not handle.closed:
            handle.close()
        os.unlink(handle.name)

    config = BasicSimulatorConfig()
    config.configure_shots(shots)
    result = get_basic_simulator().execute(program, config)
    measured_qubits = [measurement.qubit for measurement in circuit.measurements]
    counts = remap_measured_qubits(
        result.counts,
        measured_qubits=measured_qubits,
        measurements=circuit.measurements,
        cbit_count=circuit.cbit_count,
    )
    digest = hashlib.sha256(source.encode("utf-8")).hexdigest()[:12]
    job_id = f"spinq-local-{digest}-{uuid.uuid4().hex[:8]}"
    meta = {
        **circuit_metrics(circuit),
        "engine": "spinqit_basic_simulator",
        "qubits": circuit.qubit_count,
    }
    return build_result("spinq", job_id, shots, counts, circuit.cbit_count, meta)
