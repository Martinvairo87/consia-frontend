/* =========================================================
   CONSIA STRATEGIC ENGINE
   Archivo: public/strategic-engine.js
   Opportunity Detection + Strategic Prioritization
   + Business Model Builder + Roadmap Generator
   ========================================================= */

(function () {
  "use strict";

  const CONSIA_STRATEGIC_ENGINE = {
    state: "idle",
    lastInput: null,
    lastCompany: null,
    lastObjective: null,
    lastResult: null,
    history: [],

    companies: [
      "CONSIA",
      "Real Work",
      "Manglar",
      "VIP Work",
      "Bambino",
      "Vairo & Asociados"
    ],

    aliases: {
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
    }
  };

  function nowISO() {
    return new Date().toISOString();
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function tokenize(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function uniq(arr) {
    return [...new Set(arr)];
  }

  function setStrategicState(next) {
    CONSIA_STRATEGIC_ENGINE.state = next;
    updateStrategicUI();
    return next;
  }

  function detectCompany(input) {
    const text = normalizeText(input);
    for (const key of Object.keys(CONSIA_STRATEGIC_ENGINE.aliases)) {
      if (text.includes(key)) return CONSIA_STRATEGIC_ENGINE.aliases[key];
    }
    return "CONSIA";
  }

  function detectObjective(input) {
    const text = normalizeText(input);

    if (text.includes("monetiz") || text.includes("factur") || text.includes("ingres")) {
      return "monetization";
    }
    if (text.includes("escal") || text.includes("expand") || text.includes("crec")) {
      return "growth";
    }
    if (text.includes("automat")) {
      return "automation";
    }
    if (text.includes("ventas") || text.includes("vender") || text.includes("comercial")) {
      return "sales";
    }
    if (text.includes("marca") || text.includes("branding") || text.includes("posicion")) {
      return "branding";
    }
    if (text.includes("negocio") || text.includes("modelo")) {
      return "new_business";
    }

    return "strategy";
  }

  function inferPriority(input) {
    const text = normalizeText(input);
    if (text.includes("urgente") || text.includes("ya") || text.includes("ahora") || text.includes("primero")) {
      return "high";
    }
    if (text.includes("despues") || text.includes("después") || text.includes("luego")) {
      return "low";
    }
    return "medium";
  }

  function scoreOpportunity(company, objective, type) {
    const matrix = {
      "CONSIA": {
        monetization: {
          subscriptions: 96,
          topups: 91,
          enterprise: 94,
          marketplace: 88,
          automation_services: 90
        },
        growth: {
          strategic_partnerships: 91,
          white_label: 95,
          enterprise: 93,
          content_engine: 84
        },
        automation: {
          internal_ops: 89,
          agent_execution: 96,
          onboarding: 87
        },
        new_business: {
          ai_os: 95,
          global_marketplace: 90,
          vertical_solutions: 92
        }
      },
      "Real Work": {
        monetization: {
          premium_memberships: 95,
          lead_engine: 92,
          developer_packages: 91,
          ads_and_visibility: 88
        },
        growth: {
          broker_network: 93,
          city_expansion: 90,
          developer_channel: 89,
          referral_program: 86
        },
        automation: {
          crm_automation: 94,
          lead_routing: 92,
          property_followup: 90
        },
        sales: {
          premium_closers: 92,
          segmented_offers: 89,
          automated_nurturing: 91
        }
      },
      "Manglar": {
        monetization: {
          premium_projects: 90,
          turnkey_sales: 92,
          branded_materials: 84,
          investor_packages: 94
        },
        growth: {
          flagship_developments: 95,
          strategic_branding: 90,
          institutional_content: 86,
          investor_relations: 92
        },
        automation: {
          project_pipeline: 89,
          lead_capture: 85,
          sales_followup: 87
        },
        branding: {
          architectural_brand: 92,
          luxury_positioning: 95,
          content_system: 88
        }
      },
      "VIP Work": {
        monetization: {
          outsourcing_plans: 92,
          staffing_packages: 90,
          recurring_b2b: 94
        },
        growth: {
          enterprise_clients: 93,
          branch_expansion: 86,
          industry_specialization: 89
        },
        automation: {
          candidate_pipeline: 95,
          client_followup: 90,
          process_control: 91
        },
        sales: {
          b2b_offers: 94,
          retainer_plans: 89,
          service_bundles: 90
        }
      },
      "Bambino": {
        monetization: {
          catalog_sales: 91,
          bundles: 88,
          seasonal_campaigns: 89,
          membership_club: 84
        },
        growth: {
          ecommerce_scale: 93,
          content_commerce: 88,
          omni_channel: 86
        },
        automation: {
          catalog_management: 92,
          creative_generation: 90,
          sales_followup: 85
        },
        branding: {
          kids_brand_world: 91,
          visual_identity: 87,
          campaign_engine: 86
        }
      },
      "Vairo & Asociados": {
        monetization: {
          advisory_plans: 90,
          recurring_clients: 92,
          integrated_services: 88
        },
        growth: {
          cross_sell: 91,
          multi_company_portfolio: 89,
          business_content: 84
        },
        automation: {
          reminders: 93,
          client_docs: 88,
          process_tracking: 87
        }
      }
    };

    const safeCompany = matrix[company] || {};
    const safeObjective = safeCompany[objective] || safeCompany.strategy || {};
    return safeObjective[type] || 70;
  }

  function getOpportunityPool(company, objective) {
    const pools = {
      "CONSIA": {
        monetization: [
          { type: "subscriptions", title: "Planes mensuales escalables", model: "subscription", channel: "self-serve + B2B" },
          { type: "topups", title: "Top-ups de uso", model: "usage based", channel: "in-app" },
          { type: "enterprise", title: "Setup enterprise", model: "setup + recurring", channel: "direct sales" },
          { type: "marketplace", title: "Marketplace de módulos", model: "commission + sales", channel: "platform" },
          { type: "automation_services", title: "Servicios premium de automatización", model: "service + recurring", channel: "B2B" }
        ],
        growth: [
          { type: "white_label", title: "White-label por vertical", model: "license", channel: "partners" },
          { type: "strategic_partnerships", title: "Partners estratégicos", model: "rev-share", channel: "alliances" },
          { type: "enterprise", title: "Expansión enterprise", model: "direct", channel: "B2B" },
          { type: "content_engine", title: "Motor global de contenido", model: "subscription", channel: "product-led" }
        ],
        automation: [
          { type: "agent_execution", title: "Red de agentes autónomos", model: "core capability", channel: "internal" },
          { type: "internal_ops", title: "Automatización total de operaciones", model: "efficiency", channel: "internal" },
          { type: "onboarding", title: "Onboarding automatizado", model: "conversion", channel: "product-led" }
        ],
        new_business: [
          { type: "ai_os", title: "AI-OS multiempresa", model: "platform", channel: "global" },
          { type: "global_marketplace", title: "Marketplace global", model: "platform", channel: "global" },
          { type: "vertical_solutions", title: "Soluciones por industria", model: "subscription", channel: "B2B" }
        ]
      },

      "Real Work": {
        monetization: [
          { type: "premium_memberships", title: "Membresías premium", model: "subscription", channel: "site + sales team" },
          { type: "lead_engine", title: "Motor de leads pagos", model: "performance", channel: "marketplace" },
          { type: "developer_packages", title: "Paquetes para desarrolladores", model: "high ticket", channel: "direct sales" },
          { type: "ads_and_visibility", title: "Mayor visibilidad de publicaciones", model: "upsell", channel: "platform" }
        ],
        growth: [
          { type: "broker_network", title: "Red ampliada de corredores", model: "network effect", channel: "franchise / partners" },
          { type: "city_expansion", title: "Expansión por ciudades", model: "territorial", channel: "alliances" },
          { type: "developer_channel", title: "Canal de desarrolladores", model: "B2B", channel: "direct" },
          { type: "referral_program", title: "Programa de referidos", model: "growth loop", channel: "community" }
        ],
        automation: [
          { type: "crm_automation", title: "CRM + seguimiento automático", model: "efficiency", channel: "internal" },
          { type: "lead_routing", title: "Routing inteligente de leads", model: "conversion", channel: "internal" },
          { type: "property_followup", title: "Follow-up automático de propiedades", model: "conversion", channel: "internal" }
        ],
        sales: [
          { type: "premium_closers", title: "Cierre premium asistido", model: "sales process", channel: "internal" },
          { type: "segmented_offers", title: "Ofertas segmentadas", model: "conversion", channel: "marketing" },
          { type: "automated_nurturing", title: "Nutrición automática", model: "conversion", channel: "CRM" }
        ]
      },

      "Manglar": {
        monetization: [
          { type: "turnkey_sales", title: "Ventas llave en mano", model: "high ticket", channel: "direct" },
          { type: "investor_packages", title: "Paquetes para inversores", model: "B2B / capital", channel: "investor relations" },
          { type: "premium_projects", title: "Proyectos premium", model: "luxury", channel: "brand-led" },
          { type: "branded_materials", title: "Materiales y líneas propias", model: "productization", channel: "brand" }
        ],
        growth: [
          { type: "flagship_developments", title: "Desarrollos insignia", model: "brand leadership", channel: "market" },
          { type: "investor_relations", title: "Red de inversores", model: "capital", channel: "private" },
          { type: "strategic_branding", title: "Posicionamiento institucional", model: "brand", channel: "media" },
          { type: "institutional_content", title: "Contenido institucional", model: "authority", channel: "content" }
        ],
        automation: [
          { type: "project_pipeline", title: "Pipeline automatizado de proyectos", model: "internal", channel: "ops" },
          { type: "lead_capture", title: "Captura inteligente de prospectos", model: "sales", channel: "marketing" },
          { type: "sales_followup", title: "Seguimiento comercial", model: "conversion", channel: "CRM" }
        ],
        branding: [
          { type: "luxury_positioning", title: "Posicionamiento premium", model: "brand", channel: "institutional" },
          { type: "architectural_brand", title: "Marca arquitectónica fuerte", model: "brand", channel: "market" },
          { type: "content_system", title: "Sistema audiovisual de marca", model: "authority", channel: "content" }
        ]
      },

      "VIP Work": {
        monetization: [
          { type: "recurring_b2b", title: "Contratos recurrentes B2B", model: "retainer", channel: "sales" },
          { type: "outsourcing_plans", title: "Planes de outsourcing", model: "subscription", channel: "direct" },
          { type: "staffing_packages", title: "Paquetes de staffing", model: "service bundle", channel: "B2B" }
        ],
        growth: [
          { type: "enterprise_clients", title: "Clientes enterprise", model: "high-value accounts", channel: "sales" },
          { type: "industry_specialization", title: "Especialización por industria", model: "niche", channel: "positioning" },
          { type: "branch_expansion", title: "Expansión territorial", model: "scale", channel: "alliances" }
        ],
        automation: [
          { type: "candidate_pipeline", title: "Pipeline automático de candidatos", model: "ops", channel: "internal" },
          { type: "client_followup", title: "Follow-up de clientes", model: "retention", channel: "CRM" },
          { type: "process_control", title: "Control de procesos", model: "ops", channel: "internal" }
        ],
        sales: [
          { type: "b2b_offers", title: "Ofertas B2B estandarizadas", model: "sales package", channel: "direct" },
          { type: "retainer_plans", title: "Planes recurrentes", model: "retainer", channel: "B2B" },
          { type: "service_bundles", title: "Bundles de servicios", model: "upsell", channel: "sales" }
        ]
      },

      "Bambino": {
        monetization: [
          { type: "catalog_sales", title: "Ventas de catálogo", model: "ecommerce", channel: "online" },
          { type: "seasonal_campaigns", title: "Campañas estacionales", model: "seasonal revenue", channel: "social + ecommerce" },
          { type: "bundles", title: "Combos / bundles", model: "basket growth", channel: "shop" },
          { type: "membership_club", title: "Club Bambino", model: "subscription", channel: "community" }
        ],
        growth: [
          { type: "ecommerce_scale", title: "Escala ecommerce", model: "digital commerce", channel: "online" },
          { type: "content_commerce", title: "Contenido que vende", model: "social commerce", channel: "content" },
          { type: "omni_channel", title: "Omnicanalidad", model: "retail + online", channel: "hybrid" }
        ],
        automation: [
          { type: "catalog_management", title: "Gestión automática de catálogo", model: "ops", channel: "internal" },
          { type: "creative_generation", title: "Creatividades automáticas", model: "marketing ops", channel: "internal" },
          { type: "sales_followup", title: "Seguimiento de ventas", model: "retention", channel: "CRM" }
        ],
        branding: [
          { type: "kids_brand_world", title: "Universo de marca", model: "brand", channel: "content" },
          { type: "visual_identity", title: "Identidad visual fuerte", model: "brand", channel: "brand" },
          { type: "campaign_engine", title: "Motor de campañas", model: "growth", channel: "social" }
        ]
      },

      "Vairo & Asociados": {
        monetization: [
          { type: "recurring_clients", title: "Clientes recurrentes", model: "retainer", channel: "B2B" },
          { type: "advisory_plans", title: "Planes de asesoría", model: "subscription", channel: "direct" },
          { type: "integrated_services", title: "Servicios integrados", model: "bundle", channel: "cross-sell" }
        ],
        growth: [
          { type: "cross_sell", title: "Cross-sell multiempresa", model: "portfolio", channel: "current clients" },
          { type: "multi_company_portfolio", title: "Portafolio integrado", model: "group advantage", channel: "internal" },
          { type: "business_content", title: "Contenido empresarial", model: "authority", channel: "content" }
        ],
        automation: [
          { type: "reminders", title: "Recordatorios y vencimientos", model: "ops", channel: "internal" },
          { type: "client_docs", title: "Flujo documental", model: "ops", channel: "internal" },
          { type: "process_tracking", title: "Tracking de procesos", model: "ops", channel: "internal" }
        ]
      }
    };

    const companyPool = pools[company] || pools.CONSIA;
    return companyPool[objective] || companyPool.strategy || companyPool.monetization || [];
  }

  function buildAlternatives(company, objective) {
    const pool = getOpportunityPool(company, objective);

    return pool
      .map((item) => ({
        ...item,
        score: scoreOpportunity(company, objective, item.type)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function selectBestStrategy(alternatives) {
    return alternatives[0] || null;
  }

  function suggestAgents(company, objective) {
    const base = {
      monetization: ["analysis_agent", "strategy_agent", "business_agent", "finance_agent"],
      growth: ["research_agent", "analysis_agent", "strategy_agent", "marketing_agent"],
      automation: ["analysis_agent", "automation_agent", "execution_agent", "memory_agent"],
      sales: ["analysis_agent", "strategy_agent", "marketing_agent", "business_agent"],
      branding: ["research_agent", "strategy_agent", "marketing_agent", "execution_agent"],
      new_business: ["research_agent", "analysis_agent", "strategy_agent", "business_agent", "finance_agent"],
      strategy: ["analysis_agent", "strategy_agent", "memory_agent"]
    };

    let agents = base[objective] || base.strategy;

    if (company === "CONSIA") {
      agents = [...agents, "automation_agent"];
    }
    if (company === "Real Work") {
      agents = [...agents, "automation_agent", "marketing_agent"];
    }
    if (company === "Manglar") {
      agents = [...agents, "marketing_agent", "business_agent"];
    }
    if (company === "VIP Work") {
      agents = [...agents, "legal_agent"];
    }

    return uniq(agents);
  }

  function buildRoadmap(company, objective, best, input) {
    return [
      {
        phase: "Phase 1",
        title: "Diagnóstico y foco",
        action: `Validar oportunidad principal para ${company} en torno a "${input}".`,
        output: "Diagnóstico + foco único"
      },
      {
        phase: "Phase 2",
        title: "Modelo y estructura",
        action: `Diseñar modelo "${best ? best.title : "estrategia principal"}" con pricing, canal y propuesta.`,
        output: "Modelo de negocio / ejecución"
      },
      {
        phase: "Phase 3",
        title: "Lanzamiento operativo",
        action: `Asignar agentes y activar ejecución inicial para ${company}.`,
        output: "Primer sprint activo"
      }
    ];
  }

  function buildImmediateAction(company, objective, best) {
    if (!best) return `Ordenar el foco estratégico de ${company}.`;
    return `Activar ${best.title} para ${company} usando modelo ${best.model}.`;
  }

  function buildRisks(company, objective, best) {
    return [
      "Falta de foco o dispersión de prioridades.",
      "Ejecución parcial sin seguimiento operativo.",
      best ? `Subejecutar la oportunidad principal: ${best.title}.` : "No definir una oportunidad líder."
    ];
  }

  function strategicAnalyze(input) {
    setStrategicState("analyzing_market");

    const company = detectCompany(input);
    const objective = detectObjective(input);
    const priority = inferPriority(input);

    CONSIA_STRATEGIC_ENGINE.lastInput = input;
    CONSIA_STRATEGIC_ENGINE.lastCompany = company;
    CONSIA_STRATEGIC_ENGINE.lastObjective = objective;

    setStrategicState("detecting_opportunities");
    const alternatives = buildAlternatives(company, objective);

    setStrategicState("ranking_options");
    const best = selectBestStrategy(alternatives);

    setStrategicState("building_strategy");
    const agents = suggestAgents(company, objective);
    const roadmap = buildRoadmap(company, objective, best, input);
    const immediateAction = buildImmediateAction(company, objective, best);
    const risks = buildRisks(company, objective, best);

    setStrategicState("assigning_agents");

    const result = {
      ok: true,
      state: "completed",
      engine: "CONSIA_STRATEGIC_ENGINE",
      company,
      objective,
      priority,
      opportunity_main: best ? best.title : null,
      alternatives,
      best_strategy: best,
      suggested_agents: agents,
      roadmap,
      risks,
      immediate_action: immediateAction,
      generated_at: nowISO()
    };

    CONSIA_STRATEGIC_ENGINE.lastResult = result;
    CONSIA_STRATEGIC_ENGINE.history.unshift({
      id: `strategy_${Date.now()}`,
      input,
      result,
      created_at: nowISO()
    });

    setStrategicState("completed");
    updateStrategicUI();

    return result;
  }

  async function dispatchStrategicPlan(input, mode = "build") {
    const strategy = strategicAnalyze(input);

    try {
      const res = await fetch("https://api.consia.world/v1/actions/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "strategic",
          mode,
          goal: input,
          company: strategy.company,
          objective: strategy.objective,
          strategy: strategy.best_strategy,
          agents: strategy.suggested_agents,
          roadmap: strategy.roadmap,
          immediate_action: strategy.immediate_action
        })
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        data = { ok: false, error: "invalid_json" };
      }

      return {
        ok: true,
        strategic: strategy,
        dispatch: data
      };
    } catch (error) {
      return {
        ok: false,
        strategic: strategy,
        error: String(error && error.message || error)
      };
    }
  }

  function strategicStatus() {
    return {
      state: CONSIA_STRATEGIC_ENGINE.state,
      lastCompany: CONSIA_STRATEGIC_ENGINE.lastCompany,
      lastObjective: CONSIA_STRATEGIC_ENGINE.lastObjective,
      history: CONSIA_STRATEGIC_ENGINE.history.length
    };
  }

  function updateStrategicUI() {
    const stateEl = document.getElementById("strategic-state");
    const companyEl = document.getElementById("strategic-company");
    const objectiveEl = document.getElementById("strategic-objective");
    const outputEl = document.getElementById("strategic-output");

    if (stateEl) stateEl.innerText = CONSIA_STRATEGIC_ENGINE.state.toUpperCase();
    if (companyEl) companyEl.innerText = CONSIA_STRATEGIC_ENGINE.lastCompany || "CONSIA";
    if (objectiveEl) objectiveEl.innerText = CONSIA_STRATEGIC_ENGINE.lastObjective || "strategy";

    if (outputEl && CONSIA_STRATEGIC_ENGINE.lastResult) {
      outputEl.innerText = JSON.stringify(CONSIA_STRATEGIC_ENGINE.lastResult, null, 2);
    }
  }

  function attachStrategicControls() {
    const runBtn = document.getElementById("strategic-run");
    const dispatchBtn = document.getElementById("strategic-dispatch");
    const input = document.getElementById("strategic-input");
    const output = document.getElementById("strategic-output");

    if (runBtn && input) {
      runBtn.addEventListener("click", function () {
        const value = input.value.trim();
        if (!value) return;
        const result = strategicAnalyze(value);
        if (output) output.innerText = JSON.stringify(result, null, 2);
      });
    }

    if (dispatchBtn && input) {
      dispatchBtn.addEventListener("click", async function () {
        const value = input.value.trim();
        if (!value) return;
        if (output) output.innerText = "CONSIA STRATEGIC ENGINE dispatching...";
        const result = await dispatchStrategicPlan(value, "build");
        if (output) output.innerText = JSON.stringify(result, null, 2);
      });
    }
  }

  function initStrategicEngine() {
    attachStrategicControls();
    updateStrategicUI();
    console.log("CONSIA STRATEGIC ENGINE ACTIVE");
  }

  window.CONSIA_STRATEGIC_ENGINE = CONSIA_STRATEGIC_ENGINE;
  window.strategicAnalyze = strategicAnalyze;
  window.dispatchStrategicPlan = dispatchStrategicPlan;
  window.strategicStatus = strategicStatus;
  window.initStrategicEngine = initStrategicEngine;

  initStrategicEngine();
})();
