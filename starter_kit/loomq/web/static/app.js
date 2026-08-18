const form = document.querySelector("#experiment-form");
const promptField = document.querySelector("#prompt");
const targetField = document.querySelector("#target");
const shotsField = document.querySelector("#shots");
const runButton = document.querySelector("#run-button");
const formStatus = document.querySelector("#form-status");
const workspace = document.querySelector("#workspace");
const circuitPanel = document.querySelector("#circuit-panel");
const verificationPanel = document.querySelector("#verification-panel");
const resultPanel = document.querySelector("#result-panel");
const qasmDisclosure = document.querySelector("#qasm-disclosure");
const circuitView = document.querySelector("#circuit-view");
const circuitNote = document.querySelector("#circuit-note");
const verificationList = document.querySelector("#verification-list");
const countsChart = document.querySelector("#counts-chart");
const countsTableBody = document.querySelector("#counts-table-body");
const explanation = document.querySelector("#explanation");
const recommendation = document.querySelector("#recommendation");
const qasmCode = document.querySelector("#qasm-code");
const runMeta = document.querySelector("#run-meta");
const proofStatement = document.querySelector("#proof-statement");
const pipelineStages = [...document.querySelectorAll(".pipeline li")];
const exampleButtons = [...document.querySelectorAll(".example-button")];

let selectedExample = null;

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function setPipeline(status) {
  pipelineStages.forEach((stage, index) => {
    stage.dataset.status = status === "loading" ? (index === 0 ? "active" : "") : status;
  });
}

function setBusy(isBusy) {
  runButton.disabled = isBusy;
  runButton.querySelector("span").textContent = isBusy ? "正在验证…" : "验证并运行";
  formStatus.classList.remove("is-error");
  if (isBusy) {
    formStatus.textContent = "LoomQ 正在理解、编译并运行；每个通过状态都来自返回证据。";
    setPipeline("loading");
  }
}

function renderCircuit(circuit) {
  clearNode(circuitView);
  const operations = circuit.operations;
  for (let qubit = 0; qubit < circuit.qubit_count; qubit += 1) {
    const row = makeElement("div", "circuit-row");
    row.appendChild(makeElement("span", "qubit-label", `q[${qubit}]`));
    const sequence = makeElement("div", "circuit-sequence");
    operations.forEach((operation) => {
      const cell = makeElement("div", "gate-cell");
      if (operation.type === "gate" && operation.qubits.includes(qubit)) {
        const qubitIndex = operation.qubits.indexOf(qubit);
        const isControl = operation.qubits.length > 1 && qubitIndex < operation.qubits.length - 1;
        if (isControl) {
          const control = makeElement("span", "control-node");
          control.setAttribute("aria-label", `${operation.name} 控制位`);
          cell.appendChild(control);
        } else {
          const label = operation.params.length
            ? `${operation.name}(${Number(operation.params[0]).toFixed(2)})`
            : operation.name;
          cell.appendChild(makeElement("span", "gate-token", label));
        }
      } else if (operation.type === "measurement" && operation.qubit === qubit) {
        cell.appendChild(makeElement("span", "measure-token", `M→c${operation.cbit}`));
      }
      sequence.appendChild(cell);
    });
    row.appendChild(sequence);
    circuitView.appendChild(row);
  }
  circuitNote.textContent = `${circuit.qubit_count} qubits · ${circuit.metrics.transpiled_gates} gates · depth ${circuit.metrics.depth}`;
  circuitView.setAttribute("aria-label", `${circuit.qubit_count} 比特量子电路，共 ${circuit.metrics.transpiled_gates} 个门`);
}

function renderVerification(verification) {
  clearNode(verificationList);
  verification.checks.forEach((check) => {
    const item = makeElement("li");
    item.appendChild(makeElement("span", "check-dot"));
    item.appendChild(makeElement("span", "", check.label));
    item.appendChild(makeElement("small", "", check.status === "passed" ? "PASS" : "REVIEW"));
    verificationList.appendChild(item);
  });
}

function renderCounts(result) {
  clearNode(countsChart);
  clearNode(countsTableBody);
  const entries = Object.entries(result.counts).sort((first, second) => second[1] - first[1]);
  entries.forEach(([state, count]) => {
    const ratio = count / result.shots;
    const row = makeElement("div", "count-row");
    row.appendChild(makeElement("span", "count-state", state));
    const track = makeElement("div", "bar-track");
    const fill = makeElement("div", "bar-fill");
    fill.style.width = `${Math.max(ratio * 100, 0.8).toFixed(2)}%`;
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(makeElement("span", "count-value", `${(ratio * 100).toFixed(1)}%`));
    countsChart.appendChild(row);

    const tableRow = document.createElement("tr");
    const stateCell = makeElement("td", "", state);
    const countCell = makeElement("td", "", String(count));
    const ratioCell = makeElement("td", "", `${(ratio * 100).toFixed(2)}%`);
    tableRow.append(stateCell, countCell, ratioCell);
    countsTableBody.appendChild(tableRow);
  });
}

function renderRecommendation(data) {
  circuitPanel.hidden = true;
  verificationPanel.hidden = true;
  resultPanel.hidden = true;
  qasmDisclosure.hidden = true;
  recommendation.hidden = false;
  explanation.hidden = true;
  recommendation.textContent = data.reply;
  runMeta.textContent = "后端能力表 · 程序化筛选";
  proofStatement.textContent = "这次回答证明了推荐结果满足官方能力表中的显式约束；它不代表平台此刻的实时排队状态。";
}

function renderExperiment(data) {
  workspace.hidden = false;
  if (data.kind === "recommendation") {
    renderRecommendation(data);
  } else {
    circuitPanel.hidden = false;
    verificationPanel.hidden = false;
    resultPanel.hidden = false;
    qasmDisclosure.hidden = false;
    recommendation.hidden = true;
    explanation.hidden = false;
    renderCircuit(data.circuit);
    renderVerification(data.verification);
    renderCounts(data.result);
    explanation.textContent = data.explanation;
    qasmCode.textContent = data.qasm;
    runMeta.textContent = `${data.result.backend} · ${data.result.shots} shots · bit order: ${data.result.bit_order}`;
    const leading = Object.entries(data.result.counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const leadingText = leading.map(([state, count]) => `${state} ${(count / data.result.shots * 100).toFixed(1)}%`).join("，");
    proofStatement.textContent = `真实本地模拟器返回的主导状态是 ${leadingText}。这支持“程序在该无噪声后端产生了所示分布”的结论。`;
  }
  setPipeline("passed");
  formStatus.textContent = data.mode === "local_example"
    ? "本地示例完成：没有调用 LLM，电路仍经过真实 SDK。"
    : "Agent 实验完成：模型产物已通过程序验证并由真实 SDK 运行。";
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

exampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    promptField.value = button.dataset.prompt;
    selectedExample = button.dataset.example || null;
    exampleButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    promptField.focus();
  });
});

promptField.addEventListener("input", () => {
  const selected = exampleButtons.find((button) => button.classList.contains("is-selected"));
  if (!selected || promptField.value !== selected.dataset.prompt) {
    selectedExample = null;
    exampleButtons.forEach((button) => button.classList.remove("is-selected"));
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = promptField.value.trim();
  const shots = Number(shotsField.value);
  if (!prompt) {
    formStatus.textContent = "请先描述你想探索的实验。";
    formStatus.classList.add("is-error");
    promptField.focus();
    return;
  }
  setBusy(true);
  let completed = false;
  const payload = { prompt, target: targetField.value, shots };
  if (selectedExample) payload.example = selectedExample;
  try {
    const response = await fetch("/api/experiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "实验未完成");
    }
    renderExperiment(data);
    completed = true;
  } catch (error) {
    setPipeline("");
    formStatus.textContent = `未完成：${error.message} 请检查配置后重试。`;
    formStatus.classList.add("is-error");
  } finally {
    setBusy(false);
    if (completed) {
      workspace.focus({ preventScroll: true });
    } else {
      runButton.focus();
    }
  }
});
