(function () {
  'use strict';

  var form = document.querySelector('#experiment-form');
  var promptField = document.querySelector('#prompt');
  var targetField = document.querySelector('#target');
  var shotsField = document.querySelector('#shots');
  var runButton = document.querySelector('#run-button');
  var formStatus = document.querySelector('#form-status');
  var launchNotice = document.querySelector('#launch-notice');
  var runtimeStatus = document.querySelector('#runtime-status');
  var runtimeStatusCopy = document.querySelector('#runtime-status-copy');
  var workspace = document.querySelector('#workspace');
  var resultPanel = document.querySelector('#result-panel');
  var verificationPanel = document.querySelector('#verification-panel');
  var circuitPanel = document.querySelector('#circuit-panel');
  var qasmDisclosure = document.querySelector('#qasm-disclosure');
  var circuitView = document.querySelector('#circuit-view');
  var circuitNote = document.querySelector('#circuit-note');
  var verificationWrap = document.querySelector('.verification-wrap');
  var verificationList = document.querySelector('#verification-list');
  var countsChart = document.querySelector('#counts-chart');
  var countsTableBody = document.querySelector('#counts-table-body');
  var resultTotal = document.querySelector('#result-total');
  var explanation = document.querySelector('#explanation');
  var recommendation = document.querySelector('#recommendation');
  var qasmCode = document.querySelector('#qasm-code');
  var runMeta = document.querySelector('#run-meta');
  var resultBoundaryCopy = document.querySelector('#result-boundary-copy');
  var qubitStoryLine = document.querySelector('#qubit-story-line');
  var bellStoryLine = document.querySelector('#bell-story-line');
  var quickActionButtons = [].slice.call(document.querySelectorAll('.quick-action'));
  var focusBackendAction = document.querySelector('#focus-backend-action');
  var scrollTutorials = [].slice.call(document.querySelectorAll('.scroll-tutorial'));
  var stepperSteps = [].slice.call(document.querySelectorAll('.stepper-step'));
  var stepperLabel = document.querySelector('#stepper-label');
  var stepperTitle = document.querySelector('#stepper-title');
  var stepperDescription = document.querySelector('#stepper-description');
  var stepperProgressFill = document.querySelector('#stepper-progress-fill');
  var stepperPrev = document.querySelector('#stepper-prev');
  var stepperNext = document.querySelector('#stepper-next');
  var stepperFinish = document.querySelector('#stepper-finish');
  var lineSidebar = document.querySelector('.line-sidebar');
  var lineSidebarItems = [].slice.call(document.querySelectorAll('.line-sidebar__item'));
  var languageToggle = document.querySelector('#language-toggle');
  var scrollFloatHeadings = [].slice.call(document.querySelectorAll('[data-scroll-float]'));
  var strokeTextSvg = document.querySelector('.stroke-text__svg');
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isReduced = motionQuery.matches;
  var isStaticFile = window.location.protocol === 'file:';
  var localServiceUrl = 'http:' + '//127.0.0.1:8765/';
  var selectedExample = null;
  var scrollFrameId = 0;
  var stepIndex = 0;
  var currentLanguage = 'zh';
  var activePinnedHelp = null;
  var predictionChoices = [].slice.call(document.querySelectorAll('.prediction-choice'));
  var predictionFeedback = document.querySelector('#prediction-feedback');
  var pauliTabs = [].slice.call(document.querySelectorAll('.pauli-tab'));
  var pauliPanel = document.querySelector('#pauli-panel');
  var pauliBasisLabel = document.querySelector('.pauli-basis-label');
  var pauliRelation = document.querySelector('.pauli-relation');
  var pauliValue = document.querySelector('.pauli-value');
  var pauliDescription = document.querySelector('.pauli-description');
  var pauliPanelData = {
    z: {
      zh: { basis: 'Z 方向', relation: '两个量子比特几乎总是同向变化', value: 'Czz = 0.99955', description: '相关系数接近 +1，表示高度同向。' },
      en: { basis: 'Z basis · closest to the view you just saw', relation: 'The two qubits tend to move together', value: 'Czz = 0.99955', description: 'A correlation close to +1 means the two readings move together.' }
    },
    x: {
      zh: { basis: 'X 方向', relation: '两个量子比特仍然几乎同向变化', value: 'Cxx = 0.99956', description: '换一个方向后，两边仍然高度同向。' },
      en: { basis: 'X basis · a different measurement view', relation: 'The two qubits still tend to move together', value: 'Cxx = 0.99956', description: 'From this different basis, the two readings still move together.' }
    },
    y: {
      zh: { basis: 'Y 方向', relation: '两个量子比特几乎总是反向变化', value: 'Cyy = -0.99865', description: '相关系数接近 −1，表示高度反向。' },
      en: { basis: 'Y basis · one more measurement view', relation: 'The two qubits tend to move in opposite directions', value: 'Cyy = -0.99865', description: 'A correlation close to −1 means the two readings move in opposite directions.' }
    }
  };
  var currentPauliBasis = 'z';
  var qubitStoryState = '';
  var bellStoryState = '';
  var lastExperimentData = null;

  var stepData = [
    {
      zh: { label: '第一步', title: '说出你想做什么', description: '可以直接说：“帮我做一次 Bell 实验。”' },
      en: { label: 'Step one', title: 'State what you want to do', description: 'You can simply say: “Run a Bell experiment for me.”' }
    },
    {
      zh: { label: '第二步', title: '写成一份电路', description: 'LoomQ 把你的意图整理成标准 OpenQASM 程序。' },
      en: { label: 'Step two', title: 'Turn it into a circuit', description: 'LoomQ turns your intent into a standard OpenQASM program.' }
    },
    {
      zh: { label: '第三步', title: '先检查再执行', description: '程序写法和这台机器能否运行它，会在执行以前检查。' },
      en: { label: 'Step three', title: 'Check before running', description: 'The program and the selected backend are checked before execution.' }
    },
    {
      zh: { label: '第四步', title: '交给运行后端', description: '同一份电路可以交给 SpinQ、OriginQ 或 Braket 的后端。' },
      en: { label: 'Step four', title: 'Send it to a backend', description: 'The same circuit can run through a SpinQ, OriginQ, or Braket backend.' }
    },
    {
      zh: { label: '第五步', title: '把返回结果讲清楚', description: '你会看到测量分布、电路、验证信息，以及这次实验支持的判断。' },
      en: { label: 'Step five', title: 'Explain what came back', description: 'See the measurements, circuit, verification, and the conclusions this run supports.' }
    }
  ];

  function pick(zh, en) {
    return currentLanguage === 'zh' ? zh : en;
  }

  function setBilingualText(element, zh, en) {
    if (!element) return;
    element.dataset.zh = zh;
    element.dataset.en = en;
    element.textContent = pick(zh, en);
  }

  function makeBilingualNode(tag, className, zh, en) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    setBilingualText(element, zh, en);
    return element;
  }

  function makeDisclosureSummary(zh, en) {
    var summary = document.createElement('summary');
    summary.className = 'disclosure-summary';
    var marker = document.createElement('span');
    marker.className = 'disclosure-marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = '▸';
    summary.appendChild(marker);
    summary.appendChild(makeBilingualNode('span', 'disclosure-label', zh, en));
    return summary;
  }

  function initV71PublicExperience() {
    var evidence = document.querySelector('#evidence');
    var contentWidth = evidence ? evidence.querySelector('.content-width') : null;
    var oldTechnicalLadder = document.querySelector('#judge-evidence');
    if (!contentWidth || !oldTechnicalLadder) return;

    oldTechnicalLadder.hidden = true;
    oldTechnicalLadder.setAttribute('aria-hidden', 'true');

    var publicSection = document.createElement('section');
    publicSection.className = 'public-hardware-section';
    publicSection.id = 'public-hardware';
    publicSection.setAttribute('aria-labelledby', 'public-hardware-title');
    var publicCard = document.createElement('div');
    publicCard.className = 'public-hardware-card white-card';
    var publicTitle = makeBilingualNode('h3', 'sr-only', '真实机器上的运行记录', 'Run records from real machines');
    publicTitle.id = 'public-hardware-title';
    publicCard.appendChild(publicTitle);
    var platformGrid = document.createElement('div');
    platformGrid.className = 'hardware-platforms';
    ['SpinQ', 'OriginQ'].forEach(function (name) {
      var fact = document.createElement('article');
      fact.className = 'hardware-fact';
      fact.appendChild(makeBilingualNode('h4', '', name, name));
      fact.appendChild(makeBilingualNode('p', '', '真实任务记录 · 实际 QASM · 原始返回结果', 'Real task record · actual QASM · raw returned result'));
      platformGrid.appendChild(fact);
    });
    publicCard.appendChild(platformGrid);
    publicCard.appendChild(makeBilingualNode('p', 'hardware-summary centered-copy v71-copy', '这些记录已经归档，页面这里只把最重要的信息讲给你看。', 'These records are archived; this page keeps only the most important part in view.'));
    publicCard.appendChild(makeBilingualNode('p', 'hardware-next centered-copy v71-copy', '刚才的测量只用了一种方式。\n这三组归档数据来自独立的重复实验：每次重新准备同一目标状态，再换一种测量方向。', 'The earlier run used one measurement view.\nThese three archived records are independent repeats: each prepares the target state again, then changes the measurement direction.'));
    var returnLink = document.createElement('a');
    returnLink.className = 'text-link public-return-link';
    returnLink.href = '#experiment';
    returnLink.appendChild(makeBilingualNode('span', '', '想自己问一个量子问题？回到实验区 ↑', 'Want to ask a quantum question? Return to the lab ↑'));
    publicCard.appendChild(returnLink);
    publicSection.appendChild(publicCard);
    contentWidth.insertBefore(publicSection, oldTechnicalLadder);

    var disclosure = document.createElement('details');
    disclosure.className = 'technical-disclosure white-card';
    disclosure.id = 'technical-disclosure-v71';
    disclosure.appendChild(makeDisclosureSummary('想看技术与来源？', 'Technical details and sources'));
    disclosure.appendChild(makeBilingualNode('p', 'technical-disclosure-copy', '这里可以查看证据路径、验证说明、Agent / L3 / Custom RISC-V 技术文档与 Judge Guide。归档 provenance 说明也只放在这里。CNOT 的控制位规则只针对 0 / 1 基态输入；对叠加输入，它作为相干门作用于整个两比特状态，不会先测量控制位。X / Y / Z 来自三次独立归档作业，不是同一份量子副本同时测量。', 'This optional layer contains evidence paths, validation notes, Agent / L3 / Custom RISC-V documentation, and the Judge Guide. The archived provenance note lives here too. The CNOT control rule is for 0 / 1 basis inputs; on a superposition it acts coherently on the whole two-qubit state and does not measure the control first. X / Y / Z come from three independent archived jobs, not simultaneous measurements of one copy.'));
    disclosure.appendChild(makeBilingualNode('p', 'technical-disclosure-paths', '技术路径：evidence/README.md · JUDGE_GUIDE.md · 归档哈希说明。', 'Technical paths: evidence/README.md · JUDGE_GUIDE.md · archived hash note.'));
    contentWidth.insertBefore(disclosure, oldTechnicalLadder);

    var analogy = contentWidth.querySelector('.analogy-strip');
    if (analogy) {
      analogy.hidden = true;
      var diagram = document.createElement('div');
      diagram.className = 'multi-view-diagram';
      diagram.setAttribute('role', 'img');
      diagram.setAttribute('aria-label', pick('三个测量方向汇合成更完整的描述', 'Three measurement views combine into a fuller description'));
      var steps = document.createElement('div');
      steps.className = 'multi-view-steps';
      ['正面|Front', '侧面|Side', '斜侧|Angle'].forEach(function (label) {
        var parts = label.split('|');
        steps.appendChild(makeBilingualNode('span', '', parts[0], parts[1]));
      });
      diagram.appendChild(steps);
      var arrows = document.createElement('div');
      arrows.className = 'multi-view-arrows';
      arrows.setAttribute('aria-hidden', 'true');
      arrows.textContent = '↘  ↓  ↙';
      diagram.appendChild(arrows);
      diagram.appendChild(makeBilingualNode('p', 'multi-view-caption centered-copy v71-copy', '更多观察方向 → 更完整的状态描述', 'More views → a fuller description of the state'));
      analogy.parentNode.insertBefore(diagram, analogy);
    }

    var evidenceTitle = document.querySelector('#evidence-title');
    setBilingualText(document.querySelector('#evidence .eyebrow'), '真实机器也跑过', 'Real machines have run it too');
    setBilingualText(evidenceTitle, '同一类电路，也交给了真实量子机器', 'The same kind of circuit also ran on real quantum machines');
    var evidenceDeck = document.querySelector('#evidence .section-deck');
    if (evidenceDeck) {
      evidenceDeck.classList.add('centered-copy', 'v71-copy');
      setBilingualText(evidenceDeck, '前面你亲手运行的是本地模拟。\nLoomQ 也保存了真实量子平台上的运行记录。', 'You just ran a local simulation.\nLoomQ also keeps run records from real quantum platforms.');
    }

    var qubitDeck = document.querySelector('#qubit .section-deck');
    if (qubitDeck) {
      qubitDeck.classList.add('centered-copy', 'v71-copy');
      setBilingualText(qubitDeck, '普通电脑把信息写成 0 和 1。\n量子电脑也会读出 0 或 1，但读取之前，量子比特可以处在不同的量子状态。\n我们先从最简单的 |0⟩ 开始。', 'Ordinary computers write information as 0 and 1.\nQuantum computers also read 0 or 1, but before reading, a qubit can be in different quantum states.\nWe will start with the simplest |0⟩.');
    }
    var openerCue = document.querySelector('#qubit .opener-cue span');
    setBilingualText(openerCue, '↓ 向下滚动，让 H 门经过它', '↓ Scroll down and let the H gate act');
    setBilingualText(document.querySelector('#qubit-science-title'), 'H 改变了状态，重复测量显出了分布。', 'H changes the state; repeated measurements reveal a distribution.');
    var hNarrative = document.querySelector('.h-narrative-copy');
    var hSentences = hNarrative ? hNarrative.querySelectorAll('.sentence-line') : [];
    var hZh = [
      '把同一份电路重复很多次，0 和 1 会各出现大约一半。',
      '这种准备方式会得到一种均匀叠加状态。',
      '每次测量仍然只留下一个结果。'
    ];
    var hEn = [
      'Repeat the same circuit many times, and 0 and 1 each appear about half the time.',
      'This preparation produces an equal superposition state.',
      'Each measurement still leaves one result.'
    ];
    [].slice.call(hSentences).forEach(function (sentence, index) {
      setBilingualText(sentence, hZh[index], hEn[index]);
    });
    if (hNarrative) hNarrative.classList.add('v71-copy');

    var bellDeck = document.querySelector('#bell .section-deck');
    if (bellDeck) {
      bellDeck.classList.add('centered-copy', 'v71-copy');
      setBilingualText(bellDeck, '两个量子比特都从 0 开始。\n第一个先经过 H，第二步加入 CNOT。', 'Both qubits start at 0.\nThe first passes through H, then CNOT is added.');
    }
    var bellHeading = document.querySelector('#bell .section-heading');
    if (bellHeading && !bellHeading.querySelector('.cnot-intro')) {
      var cnotIntro = makeBilingualNode('p', 'sentence-line cnot-intro', '加入 CNOT：第一个是控制位，第二个是目标位。', 'Add CNOT: the first qubit is the control, and the second is the target.');
      bellHeading.appendChild(cnotIntro);
    }
    var cnotRule = document.querySelector('.cnot-rule');
    if (cnotRule) {
      var cnotParagraphs = cnotRule.querySelectorAll('p');
      if (cnotParagraphs.length) setBilingualText(cnotParagraphs[cnotParagraphs.length - 1], '控制位是 0，目标位保持原样。\n控制位是 1，目标位翻转。', 'When the control is 0, the target stays the same.\nWhen the control is 1, the target flips.');
      if (cnotParagraphs.length < 2) {
        cnotRule.appendChild(makeBilingualNode('p', 'centered-copy v71-copy', '控制位是 1，目标位翻转。', 'When the control is 1, the target flips.'));
      }
    }
    var climax = document.querySelector('.narrative-climax');
    if (climax) {
      var climaxParagraphs = climax.querySelectorAll('p');
      if (climaxParagraphs.length) {
        climaxParagraphs[0].classList.add('bell-reveal-line');
        setBilingualText(climaxParagraphs[0], '理想 Bell 电路最后主要留下 00 和 11，各约一半。', 'An ideal Bell circuit mainly leaves 00 and 11, about half each.');
      }
      if (climaxParagraphs.length > 1) setBilingualText(climaxParagraphs[climaxParagraphs.length - 1], '也就是说，在这种测量方式下，两个量子比特通常一起读成 0，或者一起读成 1。', 'In this measurement, the two qubits usually read as 0 together or 1 together.');
    }
    var bellExplanation = document.querySelector('.bell-explanation');
    if (bellExplanation) {
      var bellParagraphs = bellExplanation.querySelectorAll('p');
      if (bellParagraphs.length > 0) setBilingualText(bellParagraphs[0], '这个联合量子状态叫 Bell Φ+。', 'This joint quantum state is called Bell Φ+.');
      if (bellParagraphs.length > 1) setBilingualText(bellParagraphs[1], 'Bell Φ+ 是一个纠缠态。', 'Bell Φ+ is an entangled state.');
    }

    var flowDeck = document.querySelector('#flow .section-deck');
    if (flowDeck) {
      flowDeck.classList.add('centered-copy', 'v71-copy');
      setBilingualText(flowDeck, '你只需要说清楚想做什么。\nLoomQ 把它写成电路，先检查，再交给运行机器。\n机器返回结果以后，LoomQ 再把它讲回人话。', 'You only need to state what you want.\nLoomQ writes it as a circuit, checks it, and sends it to a backend.\nAfter the machine returns a result, LoomQ explains it in plain language.');
    }
    setBilingualText(document.querySelector('#agent-tasks'), '如果暂时没有配置模型，也可以直接运行现成的 Bell 实验和本地模拟。', 'If you have not configured a model yet, you can still run the ready-made Bell experiment and the local simulator.');

    var tomographyDeck = document.querySelector('#tomography .section-deck');
    if (tomographyDeck) {
      tomographyDeck.classList.add('centered-copy', 'v71-copy');
      setBilingualText(tomographyDeck, '每个测量方向都只告诉我们一部分信息。\n我们重复准备同一状态，再在不同设置下测量。\n把多个方向的结果合起来，就能重建这个量子状态的更完整描述。\n这种方法叫量子态层析，也叫 tomography。', 'Each measurement direction tells us only part of the story.\nWe prepare the same state again, then measure it with different settings.\nCombine several directions to reconstruct a fuller description of the state.\nThis method is called quantum state tomography.');
    }
    setBilingualText(document.querySelector('.archive-label'), '归档真机数据 · Origin Wukong 180-2。页面只展示已经保存的结果。', 'Archived hardware data · Origin Wukong 180-2. This page shows saved results only.');
    var tomographyStats = document.querySelectorAll('.tomography-stats > div');
    if (tomographyStats.length > 0) {
      setBilingualText(tomographyStats[0].querySelector('p:not(.technical-note)'), 'Fidelity 可以先读作“接近程度”。\n越接近 1，重建出的状态就越接近目标 Bell Φ+。', 'Fidelity can first be read as “how close it is.”\nCloser to 1 means the reconstructed state is closer to target Bell Φ+.');
    }
    if (tomographyStats.length > 1) {
      setBilingualText(tomographyStats[1].querySelector('span'), 'PPT 纠缠检验', 'PPT entanglement check');
      setBilingualText(tomographyStats[1].querySelector('p'), '这是一个用来检查两比特纠缠的数学检验。\n这里得到负值，因此这个重建状态通过了 PPT 纠缠判据。', 'This is a mathematical check for two-qubit entanglement.\nThe value is negative, so this reconstructed state passes the PPT entanglement criterion.');
    }
    var claims = document.querySelector('.tomography-claims');
    if (claims && claims.parentNode && !claims.closest('details')) {
      var boundaryDetails = document.createElement('details');
      boundaryDetails.className = 'science-boundary-disclosure';
      boundaryDetails.appendChild(makeDisclosureSummary('科学边界', 'Science boundary'));
      claims.parentNode.insertBefore(boundaryDetails, claims);
      boundaryDetails.appendChild(claims);
    }
    var footerQuote = document.querySelector('.footer-inner blockquote');
    if (footerQuote) footerQuote.textContent = '“If you wish to make an apple pie from scratch, you must first invent the universe.”';
  }

  function initAnchorFocus() {
    [].slice.call(document.querySelectorAll('a[href^="#"]')).forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        var target = href && document.querySelector(href);
        if (!target || target.hidden) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        window.setTimeout(function () { target.focus({ preventScroll: true }); }, isReduced ? 0 : 450);
      });
    });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function makeEl(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function clear(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function updateStrokeViewport() {
    strokeTextSvg.setAttribute('viewBox', window.innerWidth <= 767 ? '320 0 360 128' : '0 0 1000 128');
  }

  function prepareScrollFloats() {
    scrollFloatHeadings.forEach(function (heading) {
      var lines = [].slice.call(heading.querySelectorAll('.scroll-float-line'));
      heading.setAttribute('aria-label', lines.map(function (line) { return line.textContent; }).join(''));
      lines.forEach(function (line) {
        var text = line.textContent;
        clear(line);
        line.setAttribute('aria-hidden', 'true');
        var revealUnits = currentLanguage === 'en' ? [text] : Array.from(text);
        revealUnits.forEach(function (character, index) {
          var span = makeEl('span', 'scroll-float-char', character === ' ' ? '\u00a0' : character);
          span.dataset.floatIndex = String(index);
          line.appendChild(span);
        });
      });
      if (isReduced || heading.dataset.revealed === 'true') heading.classList.add('is-visible');
    });
  }

  function initTitleReveals() {
    if (isReduced || !('IntersectionObserver' in window)) {
      scrollFloatHeadings.forEach(function (heading) {
        heading.dataset.revealed = 'true';
        heading.classList.add('is-visible');
      });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.dataset.revealed = 'true';
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -22% 0px', threshold: 0 });
    scrollFloatHeadings.forEach(function (heading) { observer.observe(heading); });
  }

  function applyLocalizedAttributes() {
    [].slice.call(document.querySelectorAll('[data-aria-label-zh][data-aria-label-en]')).forEach(function (element) {
      element.setAttribute('aria-label', currentLanguage === 'zh' ? element.dataset.ariaLabelZh : element.dataset.ariaLabelEn);
    });
    document.querySelectorAll('[data-aria-description-zh][data-aria-description-en]').forEach(function (element) {
      element.setAttribute('aria-description', currentLanguage === 'zh' ? element.dataset.ariaDescriptionZh : element.dataset.ariaDescriptionEn);
    });
  }

  function renderPauli(basis) {
    if (!pauliPanel || !pauliBasisLabel) return;
    currentPauliBasis = pauliPanelData[basis] ? basis : 'z';
    var copy = pauliPanelData[currentPauliBasis][currentLanguage];
    pauliPanel.dataset.basis = currentPauliBasis;
    pauliPanel.setAttribute('aria-labelledby', 'tab-' + currentPauliBasis);
    pauliBasisLabel.textContent = copy.basis;
    pauliRelation.textContent = copy.relation;
    pauliValue.textContent = copy.value;
    pauliDescription.textContent = copy.description;
    pauliTabs.forEach(function (tab) {
      var selected = tab.dataset.basis === currentPauliBasis;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  function initPauliTabs() {
    pauliTabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { renderPauli(tab.dataset.basis); });
      tab.addEventListener('keydown', function (event) {
        var nextIndex = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % pauliTabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + pauliTabs.length) % pauliTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = pauliTabs.length - 1;
        if (nextIndex === index) return;
        event.preventDefault();
        pauliTabs[nextIndex].focus();
        renderPauli(pauliTabs[nextIndex].dataset.basis);
      });
    });
    renderPauli('z');
  }

  function initPrediction() {
    predictionChoices.forEach(function (choice) {
      choice.setAttribute('aria-pressed', 'false');
      choice.addEventListener('click', function () {
        predictionChoices.forEach(function (item) { item.setAttribute('aria-pressed', item === choice ? 'true' : 'false'); });
        predictionFeedback.textContent = pick('记下你的猜测；答案就在下一段。', 'Your guess is noted; the answer is in the next section.');
      });
    });
  }

  function applyLanguage(language) {
    currentLanguage = language === 'en' ? 'en' : 'zh';
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    [].slice.call(document.querySelectorAll('[data-zh][data-en]')).forEach(function (element) {
      element.textContent = currentLanguage === 'zh' ? element.dataset.zh : element.dataset.en;
    });
    [].slice.call(document.querySelectorAll('[data-placeholder-zh][data-placeholder-en]')).forEach(function (element) {
      element.placeholder = currentLanguage === 'zh' ? element.dataset.placeholderZh : element.dataset.placeholderEn;
    });
    [].slice.call(document.querySelectorAll('[data-stroke-lang]')).forEach(function (group) {
      group.toggleAttribute('hidden', group.dataset.strokeLang !== currentLanguage);
    });
    document.querySelector('[data-stroke-text]').setAttribute('aria-label', pick('先看见一个结果', 'See a result first'));
    languageToggle.setAttribute('aria-pressed', currentLanguage === 'en' ? 'true' : 'false');
    languageToggle.setAttribute('aria-label', pick('切换到英文', 'Switch to Chinese'));
    document.querySelector('[data-language-label]').textContent = '中 / EN';
    applyLocalizedAttributes();
    updateStrokeViewport();
    prepareScrollFloats();
    renderStepper();
    qubitStoryState = null;
    bellStoryState = null;
    updateScrollTutorials();
    renderPauli(currentPauliBasis);
    if (lastExperimentData) {
      if (lastExperimentData.kind === 'recommendation') showRecommendationWorkspace(lastExperimentData);
      else showCircuitWorkspace(lastExperimentData);
      formStatus.textContent = lastExperimentData.mode === 'local_example'
        ? pick('本地 Bell 示例完成：没有调用模型；电路已检查并由 SDK 执行。', 'Local Bell experiment complete: no model was called; the circuit was checked and run through the SDK.')
        : pick('你的描述已整理成电路，检查后由 SDK 执行。', 'Your description became a circuit, passed checks, and ran through the SDK.');
    }
    scheduleScrollUpdate();
  }

  function setRuntimeStatus(message, state) {
    runtimeStatusCopy.textContent = message;
    runtimeStatus.dataset.state = state || '';
  }

  function loadRuntimeStatus() {
    if (isStaticFile) {
      launchNotice.hidden = false;
      setRuntimeStatus(pick('实验接口未启动 · 请通过 LoomQ 本地服务打开', 'Experiment service offline · open LoomQ through the local service'), 'offline');
      return;
    }
    fetch('/api/health', { headers: { 'Accept': 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('health endpoint unavailable');
        return response.json();
      })
      .then(function (health) {
        if (health.llm_configured) {
          setRuntimeStatus(pick('模型服务已连接 · 可以运行自己的问题', 'Model service connected · your own question can run'), 'connected');
        } else {
          setRuntimeStatus(pick('还没有连接模型 · 现成的 Bell 实验仍可直接运行', 'No model connected yet · the Bell experiment still runs directly'), 'local');
        }
      })
      .catch(function () {
        setRuntimeStatus(pick('本地服务暂时不可用 · 请确认 Python 服务仍在运行', 'Local service unavailable · check that the Python service is running'), 'offline');
      });
  }

  function apiError(code, message) {
    var error = new Error(message || '实验未完成');
    error.code = code || '';
    return error;
  }

  function failureMessage(error) {
    if (isStaticFile) {
      return pick('当前打开的是静态页面，所以实验按钮暂时无法连接本地接口。运行 LoomQ 本地服务后，再从浏览器打开：', 'This is a static page, so the experiment button cannot reach the local service yet. Start the LoomQ local service, then open: ') + localServiceUrl;
    }
    if (error.code === 'agent_unavailable') return error.message;
    if (error.code === 'invalid_request') return pick('请检查你的描述或实验设置：', 'Input validation failed: ') + error.message;
    if (error.code === 'execution_failed') return pick('这次实验没有完成：', 'The quantum SDK did not complete the run: ') + error.message;
    if (error instanceof TypeError || error.code === 'network_unavailable') {
      return pick('无法连接 LoomQ 本地服务。请确认 Python 服务已启动，并访问 ', 'Cannot reach the LoomQ local service. Start the Python service and visit ') + localServiceUrl + (currentLanguage === 'zh' ? '。' : '.');
    }
    return pick('这次实验没有完成：', 'The experiment did not complete: ') + error.message;
  }

  function tutorialProgress(section) {
    var rect = section.getBoundingClientRect();
    var stickyTop = window.innerWidth <= 767 ? 86 : 96;
    var travel = Math.max(section.offsetHeight - window.innerHeight + stickyTop, 1);
    return clamp((stickyTop - rect.top) / travel, 0, 1);
  }

  function updateScrollTutorials() {
    if (!scrollTutorials.length) return;
    var qubitCard = scrollTutorials[0].querySelector('.tutorial-card');
    var qubitProgress = isReduced ? 1 : tutorialProgress(scrollTutorials[0]);
    qubitCard.style.setProperty('--progress', qubitProgress.toFixed(4));
    var zeroProbability = 100 - (qubitProgress * 50);
    var oneProbability = qubitProgress * 50;
    qubitCard.querySelector('.state-fill-zero').style.width = zeroProbability.toFixed(2) + '%';
    qubitCard.querySelector('.state-fill-one').style.width = oneProbability.toFixed(2) + '%';
    qubitCard.querySelector('.state-value-zero').textContent = zeroProbability.toFixed(0) + '%';
    qubitCard.querySelector('.state-value-one').textContent = oneProbability.toFixed(0) + '%';
    var singleGate = qubitCard.querySelector('.qubit-gate');
    singleGate.style.opacity = clamp(qubitProgress * 1.4, 0, 1).toFixed(3);
    singleGate.style.transform = 'translateX(' + ((1 - qubitProgress) * 14).toFixed(2) + 'px)';
    var nextQubitStoryState = qubitProgress < 0.34 ? 'before' : (qubitProgress < 0.7 ? 'gate' : 'distribution');
    if (nextQubitStoryState !== qubitStoryState) {
      qubitStoryState = nextQubitStoryState;
      qubitStoryLine.textContent = nextQubitStoryState === 'before'
        ? pick('现在，测量会得到 0。', 'A measurement now returns 0.')
        : (nextQubitStoryState === 'gate'
          ? pick('让 H 门作用在它上面。', 'Let H act on it.')
          : pick('重复很多次后，0 和 1 会各出现大约一半。', 'After many repetitions, 0 and 1 each appear about half the time.'));
    }

    var bellCard = scrollTutorials[1].querySelector('.tutorial-card');
    var bellProgress = isReduced ? 1 : tutorialProgress(scrollTutorials[1]);
    bellCard.style.setProperty('--progress', bellProgress.toFixed(4));
    var gateProgress = clamp(bellProgress / 0.3, 0, 1);
    var connectorProgress = clamp((bellProgress - 0.25) / 0.4, 0, 1);
    var resultProgress = clamp((bellProgress - 0.55) / 0.45, 0, 1);
    bellCard.querySelector('.bell-h').style.opacity = gateProgress.toFixed(3);
    bellCard.querySelector('.bell-h').style.transform = 'translateX(' + ((1 - gateProgress) * 14).toFixed(2) + 'px)';
    bellCard.querySelector('.bell-control').style.opacity = connectorProgress.toFixed(3);
    bellCard.querySelector('.bell-target').style.opacity = connectorProgress.toFixed(3);
    bellCard.querySelector('.bell-connector').style.opacity = connectorProgress.toFixed(3);
    bellCard.querySelector('.bell-connector').style.transform = 'scaleY(' + connectorProgress.toFixed(3) + ')';
    var resultPercentage = resultProgress * 50;
    bellCard.querySelector('.distribution-fill-zero').style.width = resultPercentage.toFixed(2) + '%';
    bellCard.querySelector('.distribution-fill-one').style.width = resultPercentage.toFixed(2) + '%';
    bellCard.querySelector('.distribution-value-zero').textContent = resultPercentage.toFixed(0) + '%';
    bellCard.querySelector('.distribution-value-one').textContent = resultPercentage.toFixed(0) + '%';
    var nextBellStoryState = bellProgress < 0.2 ? 'start' : (bellProgress < 0.48 ? 'h' : (bellProgress < 0.78 ? 'cnot' : 'result'));
    if (nextBellStoryState !== bellStoryState) {
      bellStoryState = nextBellStoryState;
      bellStoryLine.textContent = nextBellStoryState === 'start'
        ? pick('两个量子比特都从 0 开始。', 'Both qubits begin at 0.')
        : (nextBellStoryState === 'h'
          ? pick('先让第一个量子比特经过 H。', 'First, send the first qubit through H.')
          : (nextBellStoryState === 'cnot'
            ? pick('加入 CNOT：第一个是控制位，第二个是目标位。', 'Add CNOT: the first is the control and the second is the target.')
            : pick('理想 Bell 电路最后主要留下 00 和 11，各约一半。', 'An ideal Bell circuit mainly leaves 00 and 11, about half each.')));
    }
  }

  function scheduleScrollUpdate() {
    if (isReduced || scrollFrameId) return;
    scrollFrameId = window.requestAnimationFrame(function () {
      scrollFrameId = 0;
      updateScrollTutorials();
    });
  }

  function renderStepper() {
    var content = stepData[stepIndex][currentLanguage];
    stepperSteps.forEach(function (step, index) {
      if (index === stepIndex) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    stepperLabel.textContent = content.label;
    stepperTitle.textContent = content.title;
    stepperDescription.textContent = content.description;
    stepperProgressFill.style.width = ((stepIndex + 1) * 20) + '%';
    stepperPrev.disabled = stepIndex === 0;
    stepperNext.hidden = stepIndex === stepData.length - 1;
    stepperFinish.hidden = false;
  }

  function initStepper() {
    stepperPrev.addEventListener('click', function () {
      stepIndex = clamp(stepIndex - 1, 0, stepData.length - 1);
      renderStepper();
    });
    stepperNext.addEventListener('click', function () {
      stepIndex = clamp(stepIndex + 1, 0, stepData.length - 1);
      renderStepper();
    });
    stepperFinish.addEventListener('click', function () {
      document.querySelector('#experiment').scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth', block: 'start' });
    });
    renderStepper();
  }

  function setSpotlightPosition(card, clientX, clientY) {
    var rect = card.getBoundingClientRect();
    var x = clamp(clientX - rect.left, 0, rect.width);
    var y = clamp(clientY - rect.top, 0, rect.height);
    card.style.setProperty('--mouse-x', x.toFixed(1) + 'px');
    card.style.setProperty('--mouse-y', y.toFixed(1) + 'px');
    card.style.setProperty('--spotlight-color', 'rgba(0, 113, 227, 0.14)');
  }

  function initSpotlightCards() {
    [].slice.call(document.querySelectorAll('.spotlight-card')).forEach(function (card) {
      var pointerFrame = 0;
      var pendingPointer = null;
      card.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        pendingPointer = { x: event.clientX, y: event.clientY };
        if (pointerFrame) return;
        pointerFrame = window.requestAnimationFrame(function () {
          pointerFrame = 0;
          if (pendingPointer) setSpotlightPosition(card, pendingPointer.x, pendingPointer.y);
        });
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        pendingPointer = null;
        if (pointerFrame) {
          window.cancelAnimationFrame(pointerFrame);
          pointerFrame = 0;
        }
      }, { passive: true });
      card.addEventListener('focus', function () {
        var rect = card.getBoundingClientRect();
        setSpotlightPosition(card, rect.left + (rect.width / 2), rect.top + (rect.height / 2));
      });
    });
  }

  function hideHelp(trigger) {
    if (!trigger) return;
    var target = document.querySelector('#' + trigger.dataset.helpTarget);
    if (target) target.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (activePinnedHelp === trigger) activePinnedHelp = null;
  }

  function showHelp(trigger) {
    var target = document.querySelector('#' + trigger.dataset.helpTarget);
    if (!target) return;
    target.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-controls', target.id);
    trigger.setAttribute('aria-describedby', target.id);
  }

  function initTermHelp() {
    var triggers = [].slice.call(document.querySelectorAll('[data-help-target]'));
    triggers.forEach(function (trigger) {
      var target = document.querySelector('#' + trigger.dataset.helpTarget);
      if (target) {
        trigger.setAttribute('aria-controls', target.id);
        trigger.setAttribute('aria-describedby', target.id);
      }
      trigger.addEventListener('pointerenter', function () { showHelp(trigger); });
      trigger.addEventListener('pointerleave', function () {
        if (activePinnedHelp !== trigger) hideHelp(trigger);
      });
      trigger.addEventListener('focus', function () { showHelp(trigger); });
      trigger.addEventListener('blur', function () {
        if (activePinnedHelp !== trigger) hideHelp(trigger);
      });
      trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        if (activePinnedHelp === trigger) {
          hideHelp(trigger);
          return;
        }
        if (activePinnedHelp) hideHelp(activePinnedHelp);
        activePinnedHelp = trigger;
        showHelp(trigger);
      });
      trigger.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        hideHelp(trigger);
        trigger.focus();
      });
    });
    document.addEventListener('click', function (event) {
      if (!activePinnedHelp) return;
      var target = document.querySelector('#' + activePinnedHelp.dataset.helpTarget);
      if (activePinnedHelp.contains(event.target) || (target && target.contains(event.target))) return;
      hideHelp(activePinnedHelp);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !activePinnedHelp) return;
      var trigger = activePinnedHelp;
      hideHelp(trigger);
      trigger.focus();
    });
  }

  function setSidebarRest() {
    lineSidebarItems.forEach(function (item) { item.style.setProperty('--proximity', '0'); });
  }

  function updateSidebarProximity(event) {
    var rect = lineSidebar.getBoundingClientRect();
    var localY = event.clientY - rect.top;
    lineSidebarItems.forEach(function (item) {
      var center = item.offsetTop + (item.offsetHeight / 2);
      var proximity = clamp(1 - (Math.abs(localY - center) / 120), 0, 1);
      item.style.setProperty('--proximity', proximity.toFixed(3));
    });
  }

  function initLineSidebar() {
    if (!lineSidebar) return;
    lineSidebar.addEventListener('pointerenter', updateSidebarProximity, { passive: true });
    lineSidebar.addEventListener('pointermove', updateSidebarProximity, { passive: true });
    lineSidebar.addEventListener('pointerleave', setSidebarRest);
    lineSidebarItems.forEach(function (item) {
      item.addEventListener('focus', function () { item.style.setProperty('--proximity', '1'); });
      item.addEventListener('blur', function () { item.style.setProperty('--proximity', '0'); });
    });
    setSidebarRest();

    if (!('IntersectionObserver' in window)) return;
    var trackedSections = [].slice.call(document.querySelectorAll('.tracked-section'));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var sectionId = entry.target.dataset.section;
        lineSidebarItems.forEach(function (item) {
          if (item.getAttribute('href') === '#' + sectionId) item.setAttribute('aria-current', 'location');
          else item.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -48% 0px', threshold: 0 });
    trackedSections.forEach(function (section) { observer.observe(section); });
  }

  function setBusy(busy) {
    runButton.disabled = busy;
    runButton.setAttribute('aria-busy', busy ? 'true' : 'false');
    runButton.querySelector('.run-label').textContent = busy
      ? pick('正在执行…', 'Running…')
      : pick('执行这个实验', 'Run this experiment');
    if (busy) {
      formStatus.classList.remove('is-error');
      formStatus.textContent = pick(
        '正在准备、检查并运行这次实验；状态来自真实返回。',
        'LoomQ is preparing, checking, and running the experiment; this status comes from the real response.'
      );
    }
  }

  function renderCircuit(circuit) {
    clear(circuitView);
    var operations = circuit.operations || [];
    var qubitCount = circuit.qubit_count || 0;
    var layout = makeEl('div', 'circuit-layout');
    var labels = makeEl('div', 'circuit-labels');
    var grid = makeEl('div', 'circuit-grid');
    grid.style.setProperty('--columns', Math.max(operations.length, 1));
    grid.style.setProperty('--rows', Math.max(qubitCount, 1));
    for (var q = 0; q < qubitCount; q += 1) labels.appendChild(makeEl('span', '', 'q' + q));
    operations.forEach(function (operation, operationIndex) {
      if (operation.type === 'gate' && operation.qubits && operation.qubits.length > 1) {
        var connector = makeEl('span', 'circuit-connector');
        connector.style.gridColumn = String(operationIndex + 1);
        connector.style.gridRow = '1 / span ' + qubitCount;
        connector.setAttribute('aria-hidden', 'true');
        grid.appendChild(connector);
      }
      for (var row = 0; row < qubitCount; row += 1) {
        var cell = makeEl('div', 'circuit-cell');
        cell.style.gridColumn = String(operationIndex + 1);
        cell.style.gridRow = String(row + 1);
        if (operation.type === 'measurement' && operation.qubit === row) {
          cell.appendChild(makeEl('span', 'measurement-token', 'M'));
        } else if (operation.type === 'gate' && operation.qubits && operation.qubits.indexOf(row) !== -1) {
          var position = operation.qubits.indexOf(row);
          var operationName = String(operation.name || '').toLowerCase();
          if (operation.qubits.length > 1 && position < operation.qubits.length - 1) {
            cell.appendChild(makeEl('span', 'cnot-control'));
          } else if (operation.qubits.length > 1 && (operationName === 'cx' || operationName === 'cnot')) {
            cell.appendChild(makeEl('span', 'cnot-target', 'X'));
          } else {
            var label = String(operation.name || 'gate').toUpperCase();
            if (operation.params && operation.params.length) label += '(' + Number(operation.params[0]).toFixed(2) + ')';
            cell.appendChild(makeEl('span', 'gate-token', label));
          }
        }
        grid.appendChild(cell);
      }
    });
    layout.appendChild(labels);
    layout.appendChild(grid);
    circuitView.appendChild(layout);
    var metrics = circuit.metrics || {};
    circuitNote.textContent = currentLanguage === 'zh'
      ? qubitCount + ' 个量子比特 · ' + (metrics.transpiled_gates || 0) + ' 个门 · 深度 ' + (metrics.depth || 0)
      : qubitCount + ' qubits · ' + (metrics.transpiled_gates || 0) + ' gates · depth ' + (metrics.depth || 0);
    circuitView.setAttribute('aria-label', currentLanguage === 'zh'
      ? qubitCount + ' 比特量子电路，包含 ' + operations.length + ' 个操作'
      : qubitCount + '-qubit circuit with ' + operations.length + ' operations');
  }

  function renderVerification(verification) {
    clear(verificationList);
    var checks = verification && verification.checks ? verification.checks : [];
    checks.forEach(function (check) {
      var item = makeEl('li');
      item.appendChild(makeEl('span', 'check-dot'));
      var label = check.label || '';
      if (currentLanguage === 'en') {
        label = {
          'OpenQASM 2.0 语法': 'OpenQASM 2.0 syntax',
          '官方 12 门边界': 'Official 12-gate boundary',
          '本地无噪声模拟': 'Local noiseless simulation'
        }[label] || label.replace('真实本地后端完成：', 'Real local backend completed: ');
      }
      item.appendChild(makeEl('span', '', label));
      item.appendChild(makeEl('small', '', check.status === 'passed' ? 'PASS' : (currentLanguage === 'en' ? 'REVIEW' : 'REVIEW')));
      verificationList.appendChild(item);
    });
  }

  function renderCounts(result) {
    clear(countsChart);
    clear(countsTableBody);
    var counts = result.counts || {};
    var entries = Object.keys(counts).map(function (state) { return [state, Number(counts[state])]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    entries.forEach(function (entry) {
      var state = entry[0];
      var count = entry[1];
      var ratio = result.shots ? count / result.shots : 0;
      var row = makeEl('div', 'count-row');
      row.tabIndex = 0;
      var tooltipCopy = currentLanguage === 'zh'
        ? state + ' · ' + count + ' / ' + result.shots + ' · ' + (ratio * 100).toFixed(1) + '%'
        : state + ' · ' + count + ' / ' + result.shots + ' · ' + (ratio * 100).toFixed(1) + '%';
      row.setAttribute('aria-label', tooltipCopy);
      row.appendChild(makeEl('span', 'count-state', state));
      var track = makeEl('div', 'bar-track');
      var fill = makeEl('div', 'bar-fill');
      fill.style.width = Math.max(ratio * 100, ratio > 0 ? 0.6 : 0).toFixed(2) + '%';
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(makeEl('span', 'count-value', (ratio * 100).toFixed(1) + '%'));
      row.appendChild(makeEl('span', 'count-tooltip', tooltipCopy));
      countsChart.appendChild(row);
      var tableRow = document.createElement('tr');
      tableRow.appendChild(makeEl('td', '', state));
      tableRow.appendChild(makeEl('td', '', String(count)));
      tableRow.appendChild(makeEl('td', '', (ratio * 100).toFixed(2) + '%'));
      countsTableBody.appendChild(tableRow);
    });
    var total = entries.reduce(function (sum, entry) { return sum + entry[1]; }, 0);
    resultTotal.textContent = currentLanguage === 'zh'
      ? '共 ' + result.shots + ' 次重复 · 已返回 ' + total + ' 次结果'
      : Number(result.shots).toLocaleString('en-US') + ' repetitions · ' + Number(total).toLocaleString('en-US') + ' results returned';
  }

  function showCircuitWorkspace(data) {
    workspace.classList.remove('is-recommendation');
    resultPanel.hidden = false;
    circuitPanel.hidden = false;
    qasmDisclosure.hidden = false;
    verificationList.hidden = false;
    verificationWrap.hidden = false;
    recommendation.hidden = true;
    explanation.hidden = data.mode === 'local_example';
    renderCircuit(data.circuit);
    renderVerification(data.verification);
    renderCounts(data.result);
    explanation.textContent = data.explanation || pick('这次实验完成了，结果已经返回。', 'The experiment is complete and the result has been returned.');
    resultBoundaryCopy.textContent = data.mode === 'local_example'
      ? pick(
        '这是一种测量方向看到的结果。继续向下，看看已归档真机数据在 X、Y、Z 方向怎样描述同一个状态。',
        'This is one measurement view. Continue to see how archived hardware data describes the same state in X, Y, and Z.'
      )
      : pick(
        '这次返回说明所选后端得到了这份电路的结果。更强的判断需要与问题匹配的额外实验和证据。',
        'This return reports what the selected backend produced. Stronger conclusions need additional experiments and evidence matched to the question.'
      );
    qasmCode.textContent = data.qasm || '';
    qasmDisclosure.open = true;
    runMeta.textContent = currentLanguage === 'zh'
      ? data.result.backend + ' · ' + data.result.shots + ' 次重复 · 位序：' + (data.result.bit_order === 'little' ? '低位在前（little-endian）' : data.result.bit_order)
      : data.result.backend + ' · ' + data.result.shots + ' repetitions · bit order: ' + (data.result.bit_order === 'little' ? 'little-endian' : data.result.bit_order);
  }

  function showRecommendationWorkspace(data) {
    workspace.classList.add('is-recommendation');
    resultPanel.hidden = true;
    circuitPanel.hidden = true;
    qasmDisclosure.hidden = true;
    verificationList.hidden = true;
    verificationWrap.hidden = true;
    explanation.hidden = false;
    explanation.textContent = pick('这是后端能力筛选与推荐。', 'This is a backend capability recommendation.');
    recommendation.hidden = false;
    recommendation.textContent = data.reply || data.explanation || '当前请求返回了后端能力推荐。';
    runMeta.textContent = pick('后端能力表 · 程序化筛选', 'Backend capability table · programmatic filter');
  }

  function renderExperiment(data) {
    workspace.hidden = false;
    if (data.kind === 'recommendation') showRecommendationWorkspace(data);
    else showCircuitWorkspace(data);
    formStatus.textContent = data.mode === 'local_example'
      ? pick('本地 Bell 示例完成：没有调用模型；电路已检查并由 SDK 执行。', 'Local Bell experiment complete: no model was called; the circuit was checked and run through the SDK.')
      : pick('你的描述已整理成电路，检查后由 SDK 执行。', 'Your description became a circuit, passed checks, and ran through the SDK.');
    workspace.scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth', block: 'start' });
  }

  quickActionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (button === focusBackendAction) {
        var settings = document.querySelector('#experiment-settings');
        settings.open = true;
        targetField.focus();
        targetField.scrollIntoView({ behavior: isReduced ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      promptField.value = button.dataset.prompt || '';
      selectedExample = button.dataset.example || null;
      quickActionButtons.forEach(function (item) { item.classList.toggle('is-selected', item === button); });
      promptField.focus();
    });
  });

  promptField.addEventListener('input', function () {
    var activeButton = quickActionButtons.filter(function (button) { return button.classList.contains('is-selected'); })[0];
    if (!activeButton || promptField.value !== activeButton.dataset.prompt) {
      selectedExample = null;
      quickActionButtons.forEach(function (button) { button.classList.remove('is-selected'); });
    }
  });

  languageToggle.addEventListener('click', function () {
    applyLanguage(currentLanguage === 'zh' ? 'en' : 'zh');
    loadRuntimeStatus();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (isStaticFile) {
      launchNotice.hidden = false;
      formStatus.textContent = failureMessage(apiError('network_unavailable', ''));
      formStatus.classList.add('is-error');
      launchNotice.focus({ preventScroll: true });
      return;
    }
    var prompt = promptField.value.trim();
    var shots = Number(shotsField.value);
    if (!prompt) {
      formStatus.textContent = pick('请先描述你想尝试的实验。', 'Describe the experiment you want to try first.');
      formStatus.classList.add('is-error');
      promptField.focus();
      return;
    }
    if (!Number.isInteger(shots) || shots < 1 || shots > 8192) {
      formStatus.textContent = pick('重复次数需要是 1 到 8192 之间的整数。', 'Repetitions must be a whole number from 1 to 8,192.');
      formStatus.classList.add('is-error');
      shotsField.focus();
      return;
    }
    setBusy(true);
    var payload = { prompt: prompt, target: targetField.value, shots: shots };
    if (selectedExample) payload.example = selectedExample;
    fetch('/api/experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) { return { ok: response.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          var detail = result.data && result.data.error ? result.data.error : {};
          throw apiError(detail.code, detail.message);
        }
        lastExperimentData = result.data;
        renderExperiment(result.data);
      })
      .catch(function (error) {
        formStatus.textContent = failureMessage(error);
        formStatus.classList.add('is-error');
      })
      .then(function () {
        setBusy(false);
        if (workspace.hidden) runButton.focus();
        else workspace.focus({ preventScroll: true });
      });
  });

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', function () {
    updateStrokeViewport();
    scheduleScrollUpdate();
  });
  motionQuery.addEventListener('change', function (event) {
    isReduced = event.matches;
    if (isReduced && scrollFrameId) {
      window.cancelAnimationFrame(scrollFrameId);
      scrollFrameId = 0;
    }
    updateScrollTutorials();
  });

  initStepper();
  initSpotlightCards();
  initTermHelp();
  initLineSidebar();
  initTitleReveals();
  initPrediction();
  initPauliTabs();
  initV71PublicExperience();
  initAnchorFocus();
  applyLanguage('zh');
  loadRuntimeStatus();
})();
