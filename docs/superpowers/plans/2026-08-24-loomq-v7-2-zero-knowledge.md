# LoomQ V7.2 Zero-Knowledge Onboarding Patch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light, bilingual zero-knowledge onboarding layer and a unified accessible terminology-help system to the accepted LoomQ V7.1 web experience without changing scientific data, backend behavior, evaluator contracts, or evidence.

**Architecture:** Keep the existing dependency-free static frontend and same-origin API behavior. Put stable onboarding copy and help anchors in `index.html`, keep dynamic V7.1 copy/evidence generation in `app.js`, and use one small controller that owns hover, focus, tap, outside-click, and Escape behavior for every `[data-help-target]` button. Use CSS-only disclosure affordances and responsive result-source/tomography layouts; no new dependency or backend change.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Python `unittest` asset contracts, Node syntax check, local LoomQ web server, in-app browser QA.

**Spec:** User-provided LoomQ V7.2 Zero-Knowledge Onboarding & Terminology Rescue Patch contract plus `C:\Users\UUWayne\Downloads\LoomQ_V7_2_Appendix_Tooltips_Copy_Impl_QA.md`.

## Global Constraints

- Base all changes on accepted SHA `ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5`.
- Modify only `starter_kit/loomq/web/static/index.html`, `styles.css`, `app.js`, scoped Web tests, and QA artifacts outside the repository.
- Preserve raw/hardware evidence, tomography values `0.952449` and `-0.4561`, X/Y/Z values, backend/API behavior, evaluator paths, and #119.
- Keep the first Bell experiment usable without an API key; model connection remains clearly optional.
- Preserve Chinese-primary copy, provide meaning-first English copy, and avoid claims that say a qubit is simultaneously 0 and 1.
- Tooltip triggers are small accessible `button type="button"` controls; only one can be open, with hover/focus/tap/outside-click/Escape behavior.
- All disclosure summaries visibly expose a caret/chevron and have a touch-sized target.
- Do not push, create a new Final Submission Issue, or modify #119.

---

### Task 1: Encode the V7.2 web contract in failing tests

**Files:**
- Modify: `starter_kit/tests/test_web_assets.py`
- Test: `starter_kit/tests/test_web_assets.py`

**Interfaces:**
- Consumes: accepted V7.1 HTML/CSS/JS assets.
- Produces: semantic DOM and protected-value assertions for onboarding, term-help triggers/dictionary, optional API copy, disclosure affordances, result/OpenQASM layout, and evidence invariants.

- [ ] **Step 1: Add one contract test for zero-knowledge onboarding.** Assert the onboarding title, four concepts, and the `|0⟩`, `H`, `CNOT`, `M` quick reference exist in both `data-zh` and `data-en` forms.
- [ ] **Step 2: Add one contract test for help triggers and dictionary coverage.** Assert every `[data-help-target]` trigger is a typed button with a clear accessible label, targets a unique tooltip id, and the dictionary contains the required Chinese and English terms.
- [ ] **Step 3: Add one contract test for copy and disclosure behavior.** Assert built-in Bell copy says no API Key is needed, model disclosure contains optional language and does not present evaluator injection as main copy, and all disclosure summaries carry a visible marker.
- [ ] **Step 4: Add one protected-data test.** Assert the exact X/Y/Z values, tomography values, Origin Wukong archive label, evidence paths, and backend file contents remain unchanged relative to the worktree base.
- [ ] **Step 5: Run the focused Web test and confirm RED because the accepted V7.1 assets do not yet satisfy the new contract.**

### Task 2: Implement the zero-knowledge entry and terminology help

**Files:**
- Modify: `starter_kit/loomq/web/static/index.html`
- Modify: `starter_kit/loomq/web/static/app.js`
- Modify: `starter_kit/loomq/web/static/styles.css`

**Interfaces:**
- Consumes: Task 1 semantic contract.
- Produces: `#onboarding` markup, `[data-help-target]`/`.term-help` pairs, `initTermHelp()` controller, bilingual help dictionaries, and responsive `.term-help`/`.term-trigger` styles.

- [ ] **Step 1: Add the Hero-after onboarding section before `#qubit`.** Include the four short Chinese/English concept blocks and symbol cheat sheet, with the first visible explanation before the one-qubit story.
- [ ] **Step 2: Add/normalize small help buttons for qubit, `|0⟩`, H, CNOT, Bell/Bell Φ+, measurement, shots, OpenQASM, backend, simulator/hardware, X/Y/Z settings, tomography, density matrix, fidelity, PPT, and API Key.** Keep help content 1–3 sentences and bilingual.
- [ ] **Step 3: Replace the old trigger controller with one controller that keeps one help open, supports desktop hover/focus, mobile tap, outside-click, Escape, `aria-expanded`, `aria-controls`, and `aria-describedby`, and does not inject secrets.
- [ ] **Step 4: Update CSS so the help icon is 15–17px, quiet gray, keyboard-visible, non-CTA, and the popover is bounded to the viewport without layout collapse.**
- [ ] **Step 5: Run the focused Web test and syntax check; confirm GREEN.**

### Task 3: Apply V7.2 copy and progressive-disclosure corrections

**Files:**
- Modify: `starter_kit/loomq/web/static/index.html`
- Modify: `starter_kit/loomq/web/static/app.js`
- Modify: `starter_kit/loomq/web/static/styles.css`

**Interfaces:**
- Consumes: Task 2 help controller and bilingual copy helpers.
- Produces: beginner-first One-/Two-qubit, Flow, Lab/API, Hardware, X/Y/Z, tomography, fidelity/PPT, and disclosure copy while preserving runtime values.

- [ ] **Step 1: Rewrite first `|0⟩` and H introductions and retain the centered H interlude plus explicit `▸` disclosure.
- [ ] **Step 2: Add the two-qubit transition and define CNOT category, control, target, and basis-input rule before the four outcome cards; add Bell/Bell Φ+ and entanglement help.
- [ ] **Step 3: Make the Lab Bell shortcut and status explicitly API-key-free, rename model disclosure with visible optional language, and put environment variables only in the advanced disclosure.
- [ ] **Step 4: Make Flow steps and backend language plain-language; revise public hardware story to local simulation versus archived real-machine records without judge-facing framing.
- [ ] **Step 5: Revise X/Y/Z and tomography explanatory copy, add term help to dynamic pauli/tomography values, and put density-matrix, science-boundary, and technical/source text behind clear disclosure summaries.
- [ ] **Step 6: Run focused tests and inspect `git diff --check`; confirm protected values are unchanged.

### Task 4: Finish responsive result/OpenQASM and disclosure layout

**Files:**
- Modify: `starter_kit/loomq/web/static/styles.css`
- Modify: `starter_kit/loomq/web/static/index.html`
- Modify: `starter_kit/loomq/web/static/app.js`

**Interfaces:**
- Consumes: existing `result-source-grid`, QASM disclosure, dynamic result rendering, and disclosure summaries.
- Produces: balanced two-column desktop result/source presentation and one-column mobile stacking below 900px, without changing result data or QASM rendering.

- [ ] **Step 1: Keep circuit and OpenQASM as balanced siblings with centered heading, bounded code overflow, and no forced page width.
- [ ] **Step 2: Ensure all details summaries share the caret/expanded-state style and touch target, including dynamically generated technical/science disclosures.
- [ ] **Step 3: Add narrow viewport safeguards for 360/390/430 widths, natural heading wrapping, tab/button tap targets, and no single-character orphan layout rules.
- [ ] **Step 4: Run Web tests, Node syntax check, Python compilation for touched test code, and diff checks.

### Task 5: Browser QA, audits, and human-review handoff

**Files:**
- Create outside repo: `C:\Users\UUWayne\LoomQ-2026-v7.2-zero-knowledge-qa\*.png`
- Create outside repo: `C:\Users\UUWayne\LoomQ-2026-v7.2-zero-knowledge-qa\qa-report.md`

**Interfaces:**
- Consumes: completed Web assets and local server at `127.0.0.1:8765`.
- Produces: 19 named screenshots, desktop/mobile interaction evidence, console/overflow findings, zero-knowledge reviewer checklist, protected diff report, and final human-review status.

- [ ] **Step 1: Start the local Web server using the accepted documented command and verify `/api/health` plus built-in Bell execution without LLM credentials.
- [ ] **Step 2: Use the browser to inspect 1280/1440/1600 desktop and 360/390/430 mobile layouts, Chinese/English switching, tooltip hover/focus/tap, outside-click/Escape, and all disclosure toggles.
- [ ] **Step 3: Capture the required desktop/mobile screenshots outside the repository and record console errors and `document.documentElement.scrollWidth <= window.innerWidth` results.
- [ ] **Step 4: Perform Reviewer A zero-knowledge comprehension and Reviewer B UX restraint audits; report PASS/DEFECT with evidence rather than treating static tests as human acceptance.
- [ ] **Step 5: Run final focused/full regression checks, inspect branch/SHA/diff/protected paths, commit the patch locally only, and stop for human review without push or submission Issue.

## Verification Matrix

- Web assets: `.venv`-equivalent accepted Python `unittest` Web contract, `node --check starter_kit/loomq/web/static/app.js`, `git diff --check`.
- Regression: full `python -X utf8 -m unittest discover -s starter_kit/tests -p "test_*.py"` from the pinned accepted environment.
- Browser: real local HTTP server, desktop 1280/1440/1600, mobile 360/390/430, Chinese/English, console, interaction, and scroll-width evidence.
- Protected scope: `git diff --name-only` plus explicit zero-diff checks for backend/evaluator/hardware/evidence paths and exact protected values.
- Human boundary: screenshots and automated checks support review but do not claim device, production, provider, hardware, or blind-user acceptance.
