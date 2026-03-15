
(() => {
  const DEFAULT_AGENTS = [
    { id: "research_agent", name: "research_agent", role: "research", description: "Investiga y reúne contexto útil", status: "ready" },
    { id: "analysis_agent", name: "analysis_agent", role: "analysis", description: "Analiza, ordena y sintetiza", status: "ready" },
    { id: "execution_agent", name: "execution_agent", role: "execution", description: "Convierte ideas en pasos concretos", status: "ready" },
    { id: "memory_agent", name: "memory_agent", role: "memory", description: "Conecta continuidad y contexto", status: "ready" },
    { id: "strategy_agent", name: "strategy_agent", role: "strategy", description: "Diseña estrategias y roadmaps", status: "ready" },
    { id: "business_agent", name: "business_agent", role: "business", description: "Modela negocio y monetización", status: "ready" },
    { id: "marketing_agent", name: "marketing_agent", role: "marketing", description: "Crea campañas y posicionamiento", status: "ready" },
    { id: "automation_agent", name: "automation_agent", role: "automation", description: "Orquesta tareas y flujos", status: "ready" },
    { id: "finance_agent", name: "finance_agent", role: "finance", description: "Resume economía y pricing", status: "ready" },
    { id: "legal_agent", name: "legal_agent", role: "legal", description: "Ordena necesidades documentales", status: "ready" }
  ];

  function normalizeAgents(input) {
    if (Array.isArray(input) && input.length) return input;
    if (Array.isArray(input?.agents) && input.agents.length) return input.agents;
    if (Array.isArray(input?.items) && input.items.length) return input.items;
    return DEFAULT_AGENTS;
  }

  function buildAutopilotPlan(objective, agents = DEFAULT_AGENTS) {
    const roles = new Set((agents || []).map(a => a.role));
    const pick = (role, fallback) => roles.has(role) ? role : fallback;
    return [
      { id: "diagnose", title: `Diagnosticar objetivo: ${objective || "CONSIA"}`, owner: pick("analysis", "analysis"), status: "ready" },
      { id: "strategy", title: "Diseñar roadmap y priorizar", owner: pick("strategy", "analysis"), status: "ready" },
      { id: "execution", title: "Convertir el roadmap en acciones", owner: pick("execution", "execution"), status: "ready" },
      { id: "memory", title: "Persistir resultado y continuidad", owner: pick("memory", "memory"), status: "ready" }
    ];
  }

  function coverage(agents) {
    const count = Array.isArray(agents) ? agents.length : 0;
    return Math.min(100, Math.round((count / 10) * 100));
  }

  function renderAgents(listEl, agents) {
    if (!listEl) return;
    const rows = normalizeAgents(agents);
    listEl.innerHTML = rows.map(a => `
      <div class="row">
        <div class="row-left">
          <div class="avatar-mini">${escapeHtml((a.name || a.role || "A")[0].toUpperCase())}</div>
          <div>
            <div class="row-title">${escapeHtml(a.name || a.id || "agent")}</div>
            <div class="row-sub">${escapeHtml(a.role || a.description || "agent")}</div>
          </div>
        </div>
        <span class="tag ok">${escapeHtml((a.status || "ready").toUpperCase())}</span>
      </div>
    `).join("");
  }

  function renderAutopilot(listEl, items) {
    if (!listEl) return;
    const rows = Array.isArray(items) && items.length ? items : buildAutopilotPlan("CONSIA");
    listEl.innerHTML = rows.map(a => `
      <div class="row">
        <div class="row-left">
          <div class="avatar-mini">→</div>
          <div>
            <div class="row-title">${escapeHtml(a.title || "Plan item")}</div>
            <div class="row-sub">${escapeHtml(a.owner || "")}</div>
          </div>
        </div>
        <span class="tag ${a.status === "ready" ? "ok" : "warn"}">${escapeHtml((a.status || "ready").toUpperCase())}</span>
      </div>
    `).join("");
  }

  function statusSummary(agents) {
    const rows = normalizeAgents(agents);
    return {
      count: rows.length,
      coverage: coverage(rows),
      roles: rows.map(x => x.role)
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.CONSIAAgentsAutopilot = {
    DEFAULT_AGENTS,
    normalizeAgents,
    buildAutopilotPlan,
    coverage,
    renderAgents,
    renderAutopilot,
    statusSummary
  };
})();
