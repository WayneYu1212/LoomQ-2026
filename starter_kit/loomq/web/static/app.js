/* LoomQ Lab -- Obsidian Quantum */
(function () {
  'use strict';

  /* ---- DOM refs ---- */
  var form = document.querySelector('#experiment-form');
  var promptField = document.querySelector('#prompt');
  var targetField = document.querySelector('#target');
  var shotsField = document.querySelector('#shots');
  var runButton = document.querySelector('#run-button');
  var formStatus = document.querySelector('#form-status');
  var workspace = document.querySelector('#workspace');
  var circuitPanel = document.querySelector('#circuit-panel');
  var verificationPanel = document.querySelector('#verification-panel');
  var resultPanel = document.querySelector('#result-panel');
  var qasmDisclosure = document.querySelector('#qasm-disclosure');
  var circuitView = document.querySelector('#circuit-view');
  var circuitNote = document.querySelector('#circuit-note');
  var verificationList = document.querySelector('#verification-list');
  var countsChart = document.querySelector('#counts-chart');
  var measurementCanvas = document.querySelector('#measurement-canvas');
  var countsTableBody = document.querySelector('#counts-table-body');
  var explanation = document.querySelector('#explanation');
  var recommendation = document.querySelector('#recommendation');
  var qasmCode = document.querySelector('#qasm-code');
  var runMeta = document.querySelector('#run-meta');
  var proofStatement = document.querySelector('#proof-statement');
  var pipelineStages = [].slice.call(document.querySelectorAll('.pipeline li'));
  var quickActionButtons = [].slice.call(document.querySelectorAll('.quick-action'));
  var focusBackendAction = document.querySelector('#focus-backend-action');

  var selectedExample = null;
  var mcCtx = null;
  var fieldFrameId = 0;
  var fieldState = 'idle';
  var fieldRelaxTimer = 0;

  function makeEl(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /* ---- Quantum Field: a restrained visual representation, not a simulation ---- */
  var particleCanvas = document.querySelector('#particle-canvas');
  var pctx = particleCanvas.getContext('2d');
  var fieldNodes = [];
  var pointer = { x: -9999, y: -9999 };
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileQuery = window.matchMedia('(max-width: 767px)');
  var isReduced = motionQuery.matches;
  var isMobile = mobileQuery.matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function createFieldNodes() {
    var count = isMobile ? 22 : 38;
    fieldNodes = [];
    for (var i = 0; i < count; i++) {
      fieldNodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.18,
        kind: i % 3,
        length: 2.5 + Math.random() * 4.5
      });
    }
  }

  function resizeQuantumField() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.round(window.innerWidth * DPR);
    particleCanvas.height = Math.round(window.innerHeight * DPR);
    pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var wasMobile = isMobile;
    isMobile = mobileQuery.matches;
    if (!fieldNodes.length || wasMobile !== isMobile) createFieldNodes();
  }

  function setFieldState(nextState) {
    fieldState = nextState;
    clearTimeout(fieldRelaxTimer);
    if (nextState === 'measurement') {
      fieldRelaxTimer = setTimeout(function () { fieldState = 'relax'; }, 900);
    }
  }

  function updateFieldNode(node, time) {
    var stateForce = fieldState === 'coherent' ? 1.18 : fieldState === 'relax' ? 0.72 : 1;
    var angle =
      Math.sin(node.x * 0.0027 + time * 0.00009 + node.phase) * 1.55 +
      Math.cos(node.y * 0.0031 - time * 0.00007 - node.phase) * 1.25;
    node.vx += Math.cos(angle) * 0.0018 * stateForce;
    node.vy += Math.sin(angle) * 0.0018 * stateForce;

    var dx = pointer.x - node.x;
    var dy = pointer.y - node.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0 && distance < 160) {
      var pointerForce = (1 - distance / 160) * 0.0035;
      node.vx += (-dy / distance) * pointerForce;
      node.vy += (dx / distance) * pointerForce;
    }

    node.vx *= 0.986;
    node.vy *= 0.986;
    var speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > 0.12) {
      node.vx = node.vx / speed * 0.12;
      node.vy = node.vy / speed * 0.12;
    }
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < -24) node.x = window.innerWidth + 24;
    if (node.x > window.innerWidth + 24) node.x = -24;
    if (node.y < -24) node.y = window.innerHeight + 24;
    if (node.y > window.innerHeight + 24) node.y = -24;
  }

  function drawFieldConnections() {
    var threshold = isMobile ? 118 : 154;
    for (var i = 0; i < fieldNodes.length; i++) {
      for (var j = i + 1; j < fieldNodes.length; j++) {
        if ((i + j) % 4 !== 0) continue;
        var a = fieldNodes[i];
        var b = fieldNodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= threshold) continue;
        var stateAlpha = fieldState === 'measurement' ? 0.04 : 0;
        var alpha = 0.06 + (1 - distance / threshold) * 0.08 + stateAlpha;
        pctx.beginPath();
        pctx.moveTo(a.x, a.y);
        pctx.lineTo(b.x, b.y);
        pctx.strokeStyle = 'rgba(205,210,216,' + Math.min(alpha, 0.18).toFixed(3) + ')';
        pctx.lineWidth = 0.55;
        pctx.stroke();
      }
    }
  }

  function drawFieldNode(node, time) {
    pctx.fillStyle = 'rgba(215,219,224,' + node.alpha.toFixed(3) + ')';
    pctx.strokeStyle = pctx.fillStyle;
    pctx.lineWidth = 0.7;
    if (node.kind === 0) {
      pctx.beginPath();
      pctx.arc(node.x, node.y, 0.75, 0, Math.PI * 2);
      pctx.fill();
    } else if (node.kind === 1) {
      var angle = node.phase + time * 0.00002;
      var hx = Math.cos(angle) * node.length * 0.5;
      var hy = Math.sin(angle) * node.length * 0.5;
      pctx.beginPath();
      pctx.moveTo(node.x - hx, node.y - hy);
      pctx.lineTo(node.x + hx, node.y + hy);
      pctx.stroke();
    } else {
      pctx.fillRect(node.x, node.y, 1, 1);
    }
  }

  function quantumFieldLoop(time) {
    if (isReduced) return;
    pctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    fieldNodes.forEach(function (node) { updateFieldNode(node, time); });
    drawFieldConnections();
    fieldNodes.forEach(function (node) { drawFieldNode(node, time); });
    fieldFrameId = requestAnimationFrame(quantumFieldLoop);
  }

  function pauseQuantumField() {
    if (fieldFrameId) cancelAnimationFrame(fieldFrameId);
    fieldFrameId = 0;
  }

  function resumeQuantumField() {
    if (!isReduced && !fieldFrameId) fieldFrameId = requestAnimationFrame(quantumFieldLoop);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseQuantumField();
    else resumeQuantumField();
  });

  document.addEventListener('pointermove', function (event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  motionQuery.addEventListener('change', function (event) {
    isReduced = event.matches;
    if (isReduced) {
      pauseQuantumField();
      pctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    } else {
      resumeQuantumField();
    }
  });

  function initMeasurementCanvas() {
    mcCtx = measurementCanvas.getContext('2d');
  }

  function drawMeasurement(counts, total) {
    if (!mcCtx || isReduced) return;
    var w = measurementCanvas.clientWidth;
    var h = 120;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    measurementCanvas.width = w * dpr;
    measurementCanvas.height = h * dpr;
    mcCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mcCtx.clearRect(0, 0, w, h);

    var states = Object.keys(counts).sort();
    if (states.length === 0) return;
    var cols = states.length;
    var colW = w / cols;
    var i, j;

    mcCtx.fillStyle = 'rgba(160,168,180,0.55)';
    mcCtx.font = '9px \"Cascadia Code\", \"JetBrains Mono\", monospace';
    mcCtx.textAlign = 'center';

    for (i = 0; i < states.length; i++) {
      var state = states[i];
      var cx = colW * i + colW / 2;
      var ratio = counts[state] / total;
      var pCount = Math.max(2, Math.round(ratio * 60));
      mcCtx.fillText(state, cx, 16);
      for (j = 0; j < pCount; j++) {
        var px = cx + (Math.random() - 0.5) * (colW * 0.7);
        var py = 32 + Math.random() * 78;
        var pr = 1.2 + Math.random() * 1.8;
        mcCtx.beginPath();
        mcCtx.arc(px, py, pr, 0, Math.PI * 2);
        mcCtx.fillStyle = 'rgba(210,218,228,' + (0.3 + Math.random() * 0.4).toFixed(2) + ')';
        mcCtx.fill();
      }
    }

    mcCtx.fillStyle = 'rgba(120,128,140,0.45)';
    mcCtx.font = '9px Inter, \"Segoe UI\", sans-serif';
    mcCtx.textAlign = 'right';
    mcCtx.fillText('visual representation', w - 6, h - 6);
    measurementCanvas.classList.add('visible');
  }

  function setPipeline(status) {
    pipelineStages.forEach(function (stage, i) {
      stage.dataset.status = status === 'loading' ? (i === 0 ? 'active' : '') : status;
    });
  }

  function setBusy(busy) {
    runButton.disabled = busy;
    runButton.querySelector('span').textContent = busy ? '\u6b63\u5728\u8fd0\u884c...' : '\u8fd0\u884c\u5b9e\u9a8c';
    formStatus.classList.remove('is-error');
    if (busy) {
      formStatus.textContent = 'LoomQ \u6b63\u5728\u7406\u89e3\u3001\u7f16\u8bd1\u5e76\u8fd0\u884c\uff1b\u6bcf\u4e2a\u901a\u8fc7\u72b6\u6001\u90fd\u6765\u81ea\u8fd4\u56de\u8bc1\u636e\u3002';
      setPipeline('loading');
      setFieldState('coherent');
    }
  }

  function renderCircuit(circuit) {
    clear(circuitView);
    var ops = circuit.operations;
    var q;
    for (q = 0; q < circuit.qubit_count; q++) {
      var row = makeEl('div', 'circuit-row');
      row.appendChild(makeEl('span', 'qubit-label', 'q[' + q + ']'));
      var seq = makeEl('div', 'circuit-sequence');
      ops.forEach(function (op) {
        var cell = makeEl('div', 'gate-cell');
        if (op.type === 'gate' && op.qubits.indexOf(q) !== -1) {
          var qi = op.qubits.indexOf(q);
          var isCtrl = op.qubits.length > 1 && qi < op.qubits.length - 1;
          if (isCtrl) {
            var ctrl = makeEl('span', 'control-node');
            ctrl.setAttribute('aria-label', op.name + ' \u63a7\u5236\u4f4d');
            cell.appendChild(ctrl);
          } else {
            var label = op.params.length ? op.name + '(' + Number(op.params[0]).toFixed(2) + ')' : op.name;
            cell.appendChild(makeEl('span', 'gate-token', label));
          }
        } else if (op.type === 'measurement' && op.qubit === q) {
          cell.appendChild(makeEl('span', 'measure-token', 'M'));
        }
        seq.appendChild(cell);
      });
      row.appendChild(seq);
      circuitView.appendChild(row);
    }
    circuitNote.textContent = circuit.qubit_count + ' qubits \u00b7 ' + circuit.metrics.transpiled_gates + ' gates \u00b7 depth ' + circuit.metrics.depth;
    circuitView.setAttribute('aria-label', circuit.qubit_count + ' \u6bd4\u7279\u91cf\u5b50\u7535\u8def\uff0c\u5171 ' + circuit.metrics.transpiled_gates + ' \u4e2a\u95e8');
  }

  function renderVerification(ver) {
    clear(verificationList);
    ver.checks.forEach(function (check) {
      var item = makeEl('li');
      item.appendChild(makeEl('span', 'check-dot'));
      item.appendChild(makeEl('span', '', check.label));
      item.appendChild(makeEl('small', '', check.status === 'passed' ? 'PASS' : 'REVIEW'));
      verificationList.appendChild(item);
    });
  }

  function renderCounts(result) {
    clear(countsChart);
    clear(countsTableBody);
    if (measurementCanvas) {
      var ctx = measurementCanvas.getContext('2d');
      ctx.clearRect(0, 0, measurementCanvas.width, measurementCanvas.height);
      measurementCanvas.classList.remove('visible');
    }
    var entries = Object.entries(result.counts).sort(function (a, b) { return b[1] - a[1]; });
    entries.forEach(function (entry) {
      var state = entry[0], count = entry[1];
      var ratio = count / result.shots;
      var row = makeEl('div', 'count-row');
      row.appendChild(makeEl('span', 'count-state', state));
      var track = makeEl('div', 'bar-track');
      var fill = makeEl('div', 'bar-fill');
      fill.style.width = Math.max(ratio * 100, 0.6).toFixed(2) + '%';
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(makeEl('span', 'count-value', (ratio * 100).toFixed(1) + '%'));
      countsChart.appendChild(row);
      var tr = document.createElement('tr');
      tr.append(makeEl('td', '', state), makeEl('td', '', String(count)), makeEl('td', '', (ratio * 100).toFixed(2) + '%'));
      countsTableBody.appendChild(tr);
    });
    if (!isReduced) drawMeasurement(result.counts, result.shots);
  }

  function renderRecommendation(data) {
    circuitPanel.hidden = true;
    verificationPanel.hidden = false;
    resultPanel.hidden = true;
    qasmDisclosure.hidden = true;
    verificationList.hidden = true;
    recommendation.hidden = false;
    explanation.hidden = true;
    recommendation.textContent = data.reply;
    runMeta.textContent = '\u540e\u7aef\u80fd\u529b\u8868 \u00b7 \u7a0b\u5e8f\u5316\u7b5b\u9009';
    proofStatement.textContent = '\u8fd9\u6b21\u56de\u7b54\u8bc1\u660e\u4e86\u63a8\u8350\u7ed3\u679c\u6ee1\u8db3\u5b98\u65b9\u80fd\u529b\u8868\u4e2d\u7684\u663e\u5f0f\u7ea6\u675f\uff1b\u5b83\u4e0d\u4ee3\u8868\u5e73\u53f0\u6b64\u523b\u7684\u5b9e\u65f6\u6392\u961f\u72b6\u6001\u3002';
  }

  function renderExperiment(data) {
    workspace.hidden = false;
    if (data.kind === 'recommendation') {
      renderRecommendation(data);
    } else {
      circuitPanel.hidden = false;
      verificationPanel.hidden = false;
      resultPanel.hidden = false;
      qasmDisclosure.hidden = false;
      verificationList.hidden = false;
      recommendation.hidden = true;
      explanation.hidden = false;
      renderCircuit(data.circuit);
      renderVerification(data.verification);
      renderCounts(data.result);
      explanation.textContent = data.explanation;
      qasmCode.textContent = data.qasm;
      runMeta.textContent = data.result.backend + ' \u00b7 ' + data.result.shots + ' shots \u00b7 bit order: ' + data.result.bit_order;
      var leading = Object.entries(data.result.counts).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3);
      var leadingText = leading.map(function (e) { return e[0] + ' ' + (e[1] / data.result.shots * 100).toFixed(1) + '%'; }).join('\uff0c');
      proofStatement.textContent = '\u771f\u5b9e\u672c\u5730\u6a21\u62df\u5668\u8fd4\u56de\u7684\u4e3b\u5bfc\u72b6\u6001\u662f ' + leadingText + '\u3002\u8fd9\u652f\u6301\u201c\u7a0b\u5e8f\u5728\u8be5\u65e0\u566a\u58f0\u540e\u7aef\u4ea7\u751f\u4e86\u6240\u793a\u5206\u5e03\u201d\u7684\u7ed3\u8bba\u3002';
    }
    setPipeline('passed');
    setFieldState('measurement');
    formStatus.textContent = data.mode === 'local_example'
      ? '\u672c\u5730\u793a\u4f8b\u5b8c\u6210\uff1a\u6ca1\u6709\u8c03\u7528 LLM\uff0c\u7535\u8def\u4ecd\u7ecf\u8fc7\u771f\u5b9e SDK\u3002'
      : 'Agent \u5b9e\u9a8c\u5b8c\u6210\uff1a\u6a21\u578b\u4ea7\u7269\u5df2\u901a\u8fc7\u7a0b\u5e8f\u9a8c\u8bc1\u5e76\u7531\u771f\u5b9e SDK \u8fd0\u884c\u3002';
    if (!isReduced) {
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  quickActionButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn === focusBackendAction) {
        quickActionButtons.forEach(function (button) { button.classList.remove('is-selected'); });
        targetField.focus();
        targetField.scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      promptField.value = btn.dataset.prompt;
      selectedExample = btn.dataset.example || null;
      quickActionButtons.forEach(function (b) { b.classList.toggle('is-selected', b === btn); });
      promptField.focus();
    });
  });

  promptField.addEventListener('input', function () {
    var sel = quickActionButtons.find(function (b) { return b.classList.contains('is-selected'); });
    if (!sel || promptField.value !== sel.dataset.prompt) {
      selectedExample = null;
      quickActionButtons.forEach(function (b) { b.classList.remove('is-selected'); });
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var p = promptField.value.trim();
    var shots = Number(shotsField.value);
    if (!p) {
      formStatus.textContent = '\u8bf7\u5148\u63cf\u8ff0\u4f60\u60f3\u63a2\u7d22\u7684\u5b9e\u9a8c\u3002';
      formStatus.classList.add('is-error');
      promptField.focus();
      return;
    }
    setBusy(true);
    var completed = false;
    var payload = { prompt: p, target: targetField.value, shots: shots };
    if (selectedExample) payload.example = selectedExample;
    fetch('/api/experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) throw new Error(result.data.error ? result.data.error.message : '\u5b9e\u9a8c\u672a\u5b8c\u6210');
      renderExperiment(result.data);
      completed = true;
    }).catch(function (err) {
      setPipeline('');
      setFieldState('relax');
      formStatus.textContent = '\u672a\u5b8c\u6210\uff1a' + err.message + ' \u8bf7\u68c0\u67e5\u914d\u7f6e\u540e\u91cd\u8bd5\u3002';
      formStatus.classList.add('is-error');
    }).then(function () {
      setBusy(false);
      if (completed) workspace.focus({ preventScroll: true });
      else runButton.focus();
    });
  });

  resizeQuantumField();
  initMeasurementCanvas();
  resumeQuantumField();

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeQuantumField();
      resumeQuantumField();
    }, 200);
  });

})();
