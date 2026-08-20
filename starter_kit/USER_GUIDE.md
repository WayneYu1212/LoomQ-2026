# Your first LoomQ experiment

This guide assumes no quantum-computing background.

## Three ideas you need

- A **qubit** is the unit the circuit operates on.
- A **gate** is one operation in the program.
- **shots** means repeating the same experiment; counts show how often each classical result appeared.

You do not need to calculate matrices or write QASM to use the Web entry.

## Offline five-minute path

1. Run the setup and Web commands from `README.md`.
2. Open `http://127.0.0.1:8765/`.
3. Click **第一次实验** to load the Bell example.
4. Pick any of the three local backends and press **运行实验**.
5. Read the four evidence checks, the circuit rails, and the counts chart.

Do not open `loomq/web/static/index.html` as a `file://` page. That view cannot reach the Python SDK service. If it is opened accidentally, LoomQ shows the exact supported launch URL instead of describing the failure as an LLM-key problem.

The calm runtime strip separates the two paths: **第一次实验** remains available without an LLM, while free-form Agent tasks use server-side `LOOMQ_LLM_*` environment injection. No browser key entry or LocalStorage secret is required.

A correct Bell experiment is dominated by `00` and `11`, each near 50%. It is like two coins that are individually unpredictable but always agree. Sampling fluctuates, so 49%/51% is as healthy as exactly 50%/50%.

After configuring `LOOMQ_LLM_*`, try `生成 3 比特 GHZ 态`. A correct GHZ result is dominated by `000` and `111`.

## Agent tasks

After configuring `LOOMQ_LLM_*`, try:

1. `生成一个 5 比特 GHZ 态并测量全部量子比特。`
2. `我想制备 Bell 态，但这段代码有错：H q[0]; CX q[0] q[1]。保持原意并修好。`
3. `我要运行一个 15 比特电路，不想排队、不想付费也不想注册，应该选哪个后端？`

The first two responses must contain complete verified OpenQASM. The third must contain canonical IDs from the organizer's capability table. If the model returns an invalid candidate, LoomQ gives it one correction attempt; it never silently claims the invalid program passed.

## Reading the workbench

- **CIRCUIT** shows the shared IR as circuit rails. A small circle marks a control; a labeled box is the target gate; `M` marks measurement.
- **VERIFICATION** lists checks actually returned by the program. No check begins green.
- **RESULT** shows raw SDK counts as bars and an accessible table.
- **验证与解释** gives a beginner explanation. Expand QASM only when you want the professional representation.

## Scientific boundary

An ideal local simulator can show that the program implements the intended mathematical distribution. It does not prove quantum advantage, hardware fidelity, or resistance to real QPU noise. A true hardware claim needs a traceable platform job ID and raw result captured inside the contest window.

## Recovery

- **Agent 模型尚未配置**: set all three required `LOOMQ_LLM_BASE_URL`, `LOOMQ_LLM_API_KEY`, `LOOMQ_LLM_MODEL` values, or use a labeled local example.
- **Unsupported gate**: the contest accepts only the 12 gates listed in the README.
- **SDK unavailable**: run the setup script and `python -m pip check` inside `.venv`.
- **Counts look slightly uneven**: sampling fluctuation is expected. Use 8192 shots for scoring comparisons.
- **Port 8765 is busy**: start with `--port 8766` and open that address.
