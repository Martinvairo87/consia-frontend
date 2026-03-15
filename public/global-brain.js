/* =========================================================
   CONSIA GLOBAL BRAIN
   Master Memory + Context Router + Retrieval + Continuity
   Archivo: public/global-brain.js
   ========================================================= */

(function () {
  "use strict";

  const API_BASE = "https://api.consia.world";

  const CONSIA_GLOBAL_BRAIN = {
    state: "idle",
    activeContext: null,
    activeCompany: null,
    activeProject: null,
    activeGoal: null,
    lastAction: null,

    companies: [
      "CONSIA",
      "Real Work",
      "Manglar",
      "VIP Work",
      "Bambino",
      "Vairo & Asociados"
    ],

    companyAliases: {
      "consia": "CONSIA",
      "real work": "Real Work",
      "realwork": "Real Work",
      "manglar": "Manglar",
      "vip work": "VIP Work",
      "vipwork": "VIP Work",
      "bambino": "Bambino",
      "vairo": "Vairo & Asociados",
      "vairo & asociados": "Vairo & Asociados",
      "vairo y asociados": "Vairo & Asociados"
    },

    memory: [],
    projects: [],
    actions: [],
    results: [],
    index: {}
  };

  function nowISO() {
    return new Date().toISOString();
  }

  function safeId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function tokenize(text) {
    return normalizeText(text)
      .replace(/[^a-z0-9áéíóúüñ\s]/gi, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function unique(arr) {
    return [...new Set(arr)];
  }

  function setBrainState(nextState) {
    CONSIA_GLOBAL_BRAIN.state = nextState;
    updateBrainUI();
    return nextState;
  }

  function detectCompany(input) {
    const normalized = normalizeText(input);

    for (const alias of Object.keys(CONSIA_GLOBAL_BRAIN.companyAliases)) {
      if (normalized.includes(alias)) {
        return CONSIA_GLOBAL_BRAIN.companyAliases[alias];
      }
    }

    return "CONSIA";
  }

  function detectProject(input) {
    const normalized = normalizeText(input);

    const projectPatterns = [
      { key: "manglar iii", label: "Manglar III" },
      { key: "manglar iv", label: "Manglar IV" },
      { key: "manglar ii", label: "Manglar II" },
      { key: "manglar i", label: "Manglar I" },
      { key: "real work", label: "Real Work Core" },
      { key: "consia", label: "CONSIA Core" },
      { key: "bambino", label: "Bambino Commerce" },
      { key: "vip work", label: "VIP Work Operations" },
      { key: "vairo", label: "Vairo & Asociados Core" }
    ];

    const found = projectPatterns.find((p) => normalized.includes(p.key));
    return found ? found.label : null;
  }

  function detectIntent(input) {
    const normalized = normalizeText(input);

    if (normalized.includes("continu") || normalized.includes("segu")) return "continuity";
    if (normalized.includes("optimiz")) return "optimize";
    if (normalized.includes("crea") || normalized.includes("arm") || normalized.includes("gener")) return "build";
    if (normalized.includes("analiz")) return "analyze";
    if (normalized.includes("lanza") || normalized.includes("ejecut")) return "launch";

    return "general";
  }

  function inferPriority(input) {
    const normalized = normalizeText(input);

    if (
      normalized.includes("urgente") ||
      normalized.includes("ya") ||
      normalized.includes("ahora") ||
      normalized.includes("critico") ||
      normalized.includes("crítico")
    ) {
      return "high";
    }

    if (normalized.includes("despues") || normalized.includes("después") || normalized.includes("luego")) {
      return "low";
    }

    return "medium";
  }

  function makeTags(input, company, project, intent) {
    const base = tokenize(input).slice(0, 10);
    return unique([
      ...base,
      normalizeText(company || ""),
      normalizeText(project || ""),
      normalizeText(intent || "")
    ].filter(Boolean));
  }

  function buildMemoryRecord(payload) {
    return {
      id: safeId("mem"),
      type: payload.type || "note",
      company: payload.company || "CONSIA",
      project: payload.project || null,
      goal: payload.goal || "",
      summary: payload.summary || payload.goal || "",
      tags: unique(payload.tags || []),
      priority: payload.priority || "medium",
      status: payload.status || "active",
      created_at: nowISO(),
      updated_at: nowISO(),
      source: payload.source || "global-brain"
    };
  }

  function buildActionRecord(payload) {
    return {
      id: safeId("act"),
      company: payload.company || "CONSIA",
      project: payload.project || null,
      goal: payload.goal || "",
      intent: payload.intent || "general",
      priority: payload.priority || "medium",
      next_action: payload.next_action || "",
      agents: payload.agents || [],
      status: payload.status || "planned",
      created_at: nowISO(),
      updated_at: nowISO()
    };
  }

  function buildProjectRecord(payload) {
    return {
      id: safeId("prj"),
      company: payload.company || "CONSIA",
      name: payload.name || payload.project || "Proyecto sin nombre",
      goal: payload.goal || "",
      summary: payload.summary || payload.goal || "",
      status: payload.status || "active",
      priority: payload.priority || "medium",
      tags: unique(payload.tags || []),
      created_at: nowISO(),
      updated_at: nowISO()
    };
  }

  function ensureSeedData() {
    if (CONSIA_GLOBAL_BRAIN.memory.length) return;

    const seeds = [
      {
        type: "company_context",
        company: "CONSIA",
        project: "CONSIA Core",
        goal: "Sistema operativo de inteligencia artificial",
        summary: "CONSIA es el núcleo central de automatización, agentes, memoria y ejecución.",
        tags: ["consia", "core", "ai-os", "automation"],
        priority: "high"
      },
      {
        type: "company_context",
        company: "Real Work",
        project: "Real Work Core",
        goal: "Marketplace y operación inmobiliaria",
        summary: "Real Work integra inmobiliaria, coworking, publicaciones, agentes y servicios.",
        tags: ["realwork", "inmobiliaria", "marketplace", "coworking"],
        priority: "high"
      },
      {
        type: "company_context",
        company: "Manglar",
        project: "Manglar Developments",
        goal: "Construcción, desarrollos y branding",
        summary: "Manglar integra desarrollos, edificios, branding, comercialización y expansión.",
        tags: ["manglar", "construccion", "desarrollos", "edificios"],
        priority: "high"
      }
    ];

    CONSIA_GLOBAL_BRAIN.memory.push(...seeds.map(buildMemoryRecord));

    CONSIA_GLOBAL_BRAIN.projects.push(
      buildProjectRecord({
        company: "CONSIA",
        name: "CONSIA Core",
        goal: "Cerrar la plataforma operativa",
        summary: "Core, frontend, command center, swarm, autopilot y brain.",
        tags: ["consia", "core", "platform"],
        priority: "high"
      }),
      buildProjectRecord({
        company: "Real Work",
        name: "Real Work Core",
        goal: "Potenciar operaciones y monetización",
        summary: "Marketplace, publicaciones, automatizaciones y seguimiento.",
        tags: ["realwork", "ops", "sales"],
        priority: "high"
      }),
      buildProjectRecord({
        company: "Manglar",
        name: "Manglar Developments",
        goal: "Estructurar branding, ventas y proyectos",
        summary: "Edificios, desarrollos, marketing y ejecución.",
        tags: ["manglar", "projects", "branding"],
        priority: "high"
      })
    );

    reindexBrain();
  }

  function reindexBrain() {
    const idx = {};

    for (const item of CONSIA_GLOBAL_BRAIN.memory) {
      const tokens = unique([
        ...tokenize(item.company),
        ...tokenize(item.project),
        ...tokenize(item.goal),
        ...tokenize(item.summary),
        ...(item.tags || [])
      ]);

      for (const token of tokens) {
        if (!idx[token]) idx[token] = [];
        idx[token].push(item.id);
      }
    }

    CONSIA_GLOBAL_BRAIN.index = idx;
    return idx;
  }

  function searchMemory(query, opts = {}) {
    const tokens = unique(tokenize(query));
    const scores = new Map();

    for (const token of tokens) {
      const ids = CONSIA_GLOBAL_BRAIN.index[token] || [];
      for (const id of ids) {
        scores.set(id, (scores.get(id) || 0) + 1);
      }
    }

    let results = CONSIA_GLOBAL_BRAIN.memory
      .map((item) => ({
        ...item,
        _score: scores.get(item.id) || 0
      }))
      .filter((item) => item._score > 0 || !tokens.length);

    if (opts.company) {
      results = results.filter((item) => item.company === opts.company);
    }

    if (opts.project) {
      results = results.filter((item) => item.project === opts.project);
    }

    results.sort((a, b) => b._score - a._score || String(b.updated_at).localeCompare(String(a.updated_at)));

    return results.slice(0, opts.limit || 6);
  }

  function getRelatedProjects(company) {
    return CONSIA_GLOBAL_BRAIN.projects
      .filter((p) => !company || p.company === company)
      .slice(0, 6);
  }

  function suggestAgents(intent, company) {
    const byIntent = {
      analyze: ["research_agent", "analysis_agent", "strategy_agent"],
      build: ["analysis_agent", "strategy_agent", "execution_agent", "business_agent"],
      launch: ["execution_agent", "automation_agent", "marketing_agent", "business_agent"],
      optimize: ["analysis_agent", "strategy_agent", "finance_agent", "automation_agent"],
      continuity: ["memory_agent", "analysis_agent", "execution_agent"],
      general: ["analysis_agent", "memory_agent", "execution_agent"]
    };

    const base = byIntent[intent] || byIntent.general;

    if (company === "Manglar") return unique([...base, "marketing_agent", "business_agent"]);
    if (company === "Real Work") return unique([...base, "marketing_agent", "automation_agent"]);
    if (company === "VIP Work") return unique([...base, "business_agent", "legal_agent"]);
    if (company === "Bambino") return unique([...base, "marketing_agent", "finance_agent"]);

    return unique(base);
  }

  function buildNextAction(intent, company, goal) {
    if (intent === "analyze") return `Analizar contexto y oportunidades para ${company}.`;
    if (intent === "build") return `Construir plan operativo para: ${goal}`;
    if (intent === "launch") return `Lanzar ejecución inicial para: ${goal}`;
    if (intent === "optimize") return `Optimizar proceso o negocio de ${company}.`;
    if (intent === "continuity") return `Retomar continuidad de ${company} sobre: ${goal}`;
    return `Ordenar y ejecutar siguiente paso para ${company}.`;
  }

  async function fetchJson(url, options) {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let data = text;
      try {
        data = JSON.parse(text);
      } catch (_) {}
      return { ok: res.ok, status: res.status, data };
    } catch (error) {
      return { ok: false, status: 0, data: { error: String(error && error.message || error) } };
    }
  }

  async function syncMemoryToAPI(record) {
    const endpoints = [
      `${API_BASE}/v1/memory`,
      `${API_BASE}/v1/memory/save`
    ];

    for (const url of endpoints) {
      const res = await fetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });

      if (res.ok) return res.data;
    }

    return null;
  }

  async function syncProjectToAPI(record) {
    const endpoints = [
      `${API_BASE}/v1/projects`,
      `${API_BASE}/v1/projects/save`
    ];

    for (const url of endpoints) {
      const res = await fetchJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });

      if (res.ok) return res.data;
    }

    return null;
  }

  async function dispatchActionToAPI(action) {
    const res = await fetchJson(`${API_BASE}/v1/actions/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action)
    });

    return res.data;
  }

  async function ingestBrainInput(input) {
    ensureSeedData();
    setBrainState("routing");

    const company = detectCompany(input);
    const project = detectProject(input);
    const intent = detectIntent(input);
    const priority = inferPriority(input);
    const tags = makeTags(input, company, project, intent);

    CONSIA_GLOBAL_BRAIN.activeCompany = company;
    CONSIA_GLOBAL_BRAIN.activeProject = project;
    CONSIA_GLOBAL_BRAIN.activeGoal = input;
    CONSIA_GLOBAL_BRAIN.activeContext = { company, project, intent, priority, tags };
    CONSIA_GLOBAL_BRAIN.lastAction = "ingest";

    setBrainState("retrieving");
    const relatedMemory = searchMemory(input, { company, project, limit: 6 });
    const relatedProjects = getRelatedProjects(company);
    const agents = suggestAgents(intent, company);
    const nextAction = buildNextAction(intent, company, input);

    setBrainState("planning");

    const memoryRecord = buildMemoryRecord({
      type: "brain_context",
      company,
      project,
      goal: input,
      summary: `Contexto detectado para ${company}. Intent: ${intent}. Prioridad: ${priority}.`,
      tags,
      priority,
      status: "active"
    });

    CONSIA_GLOBAL_BRAIN.memory.unshift(memoryRecord);
    reindexBrain();

    const maybeProject = project
      ? null
      : buildProjectRecord({
          company,
          name: `${company} Active Project`,
          goal: input,
          summary: `Proyecto generado por Global Brain para ${company}.`,
          status: "active",
          priority,
          tags
        });

    if (maybeProject) {
      CONSIA_GLOBAL_BRAIN.projects.unshift(maybeProject);
    }

    const actionRecord = buildActionRecord({
      company,
      project: project || (maybeProject ? maybeProject.name : null),
      goal: input,
      intent,
      priority,
      next_action: nextAction,
      agents,
      status: "planned"
    });

    CONSIA_GLOBAL_BRAIN.actions.unshift(actionRecord);

    setBrainState("linking");

    await Promise.all([
      syncMemoryToAPI(memoryRecord),
      maybeProject ? syncProjectToAPI(maybeProject) : Promise.resolve(null)
    ]);

    const brainPacket = {
      ok: true,
      state: "completed",
      context: {
        company,
        project: project || (maybeProject ? maybeProject.name : null),
        intent,
        priority,
        tags
      },
      related_memory: relatedMemory,
      related_projects: relatedProjects,
      suggested_agents: agents,
      next_action: nextAction,
      action_record: actionRecord
    };

    CONSIA_GLOBAL_BRAIN.results.unshift({
      id: safeId("brain_result"),
      created_at: nowISO(),
      input,
      output: brainPacket
    });

    setBrainState("completed");
    updateBrainUI();

    return brainPacket;
  }

  async function runGlobalBrain(input) {
    try {
      const packet = await ingestBrainInput(input);
      return packet;
    } catch (error) {
      setBrainState("error");
      return {
        ok: false,
        state: "error",
        error: String(error && error.message || error)
      };
    }
  }

  async function runBrainAndDispatch(input, mode = "build") {
    const packet = await runGlobalBrain(input);

    if (!packet.ok) return packet;

    const dispatchPayload = {
      type: "autopilot",
      mode,
      goal: input,
      context: packet.context,
      agents: packet.suggested_agents,
      next_action: packet.next_action
    };

    const dispatchResult = await dispatchActionToAPI(dispatchPayload);

    return {
      ok: true,
      brain: packet,
      dispatch: dispatchResult
    };
  }

  function getBrainStatus() {
    return {
      state: CONSIA_GLOBAL_BRAIN.state,
      activeCompany: CONSIA_GLOBAL_BRAIN.activeCompany,
      activeProject: CONSIA_GLOBAL_BRAIN.activeProject,
      activeGoal: CONSIA_GLOBAL_BRAIN.activeGoal,
      memory: CONSIA_GLOBAL_BRAIN.memory.length,
      projects: CONSIA_GLOBAL_BRAIN.projects.length,
      actions: CONSIA_GLOBAL_BRAIN.actions.length,
      results: CONSIA_GLOBAL_BRAIN.results.length
    };
  }

  function getBrainSnapshot() {
    return {
      status: getBrainStatus(),
      context: CONSIA_GLOBAL_BRAIN.activeContext,
      latest_memory: CONSIA_GLOBAL_BRAIN.memory.slice(0, 6),
      latest_projects: CONSIA_GLOBAL_BRAIN.projects.slice(0, 6),
      latest_actions: CONSIA_GLOBAL_BRAIN.actions.slice(0, 6),
      latest_results: CONSIA_GLOBAL_BRAIN.results.slice(0, 3)
    };
  }

  function updateBrainUI() {
    const stateEl = document.getElementById("brain-state");
    const companyEl = document.getElementById("brain-company");
    const projectEl = document.getElementById("brain-project");
    const nextEl = document.getElementById("brain-next");
    const outEl = document.getElementById("brain-output");

    if (stateEl) stateEl.innerText = CONSIA_GLOBAL_BRAIN.state.toUpperCase();
    if (companyEl) companyEl.innerText = CONSIA_GLOBAL_BRAIN.activeCompany || "CONSIA";
    if (projectEl) projectEl.innerText = CONSIA_GLOBAL_BRAIN.activeProject || "-";
    if (nextEl) {
      const latest = CONSIA_GLOBAL_BRAIN.actions[0];
      nextEl.innerText = latest ? latest.next_action : "Sin próxima acción";
    }
    if (outEl) {
      const latestResult = CONSIA_GLOBAL_BRAIN.results[0];
      if (latestResult) {
        outEl.innerText = JSON.stringify(latestResult.output, null, 2);
      }
    }
  }

  function attachBrainControls() {
    const button = document.getElementById("brain-run");
    const input = document.getElementById("brain-input");

    if (!button || !input) return;

    button.addEventListener("click", async function () {
      const value = input.value.trim();
      if (!value) return;

      if (window.__CONSIA_BRAIN_RUNNING__) return;
      window.__CONSIA_BRAIN_RUNNING__ = true;

      const outEl = document.getElementById("brain-output");
      if (outEl) outEl.innerText = "CONSIA GLOBAL BRAIN ejecutando...";

      const result = await runBrainAndDispatch(value, "build");

      if (outEl) outEl.innerText = JSON.stringify(result, null, 2);

      window.__CONSIA_BRAIN_RUNNING__ = false;
    });
  }

  function initGlobalBrain() {
    ensureSeedData();
    setBrainState("idle");
    attachBrainControls();
    updateBrainUI();
    console.log("CONSIA GLOBAL BRAIN ACTIVE");
  }

  window.CONSIA_GLOBAL_BRAIN = CONSIA_GLOBAL_BRAIN;
  window.runGlobalBrain = runGlobalBrain;
  window.runBrainAndDispatch = runBrainAndDispatch;
  window.getBrainStatus = getBrainStatus;
  window.getBrainSnapshot = getBrainSnapshot;
  window.initGlobalBrain = initGlobalBrain;

  initGlobalBrain();
})();
