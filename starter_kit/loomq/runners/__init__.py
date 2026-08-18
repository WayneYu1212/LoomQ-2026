"""Real target SDK runners and unified result helpers."""

from __future__ import annotations

from collections.abc import Callable

from ..compiler.ir import Circuit
from .braket import run_braket
from .originq import run_originq
from .result import BACKEND_IDS, build_result, normalize_counts, remap_measured_qubits
from .spinq import run_spinq


_RUNNERS: dict[str, Callable[[Circuit, int], dict[str, object]]] = {
    "spinq": run_spinq,
    "originq": run_originq,
    "braket": run_braket,
}


def run_circuit(circuit: Circuit, target: str, shots: int) -> dict[str, object]:
    try:
        runner = _RUNNERS[target]
    except (KeyError, TypeError) as exc:
        raise ValueError(f"unsupported target: {target}") from exc
    if isinstance(shots, bool) or not isinstance(shots, int) or shots <= 0:
        raise ValueError("shots must be a positive integer")
    return runner(circuit, shots)


__all__ = [
    "BACKEND_IDS",
    "build_result",
    "normalize_counts",
    "remap_measured_qubits",
    "run_braket",
    "run_circuit",
    "run_originq",
    "run_spinq",
]
