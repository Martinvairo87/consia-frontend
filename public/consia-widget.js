(() => {
  "use strict";

  const script = document.currentScript;
  const SITE = (script?.dataset?.site || "consia").trim().toLowerCase();
  const API_BASE = (script?.dataset?.api || "https://api.consia.world").replace(/\/$/, "");
  const AVATAR_URL_BASE = (script?.dataset?.avatar || "https://consia.world/avatar.html").replace(/\/$/, "");
  const POSITION = (script?.dataset?.position || "right").trim().toLowerCase();
  const STORAGE_KEY = `consia_widget_${SITE}`;
  const SESSION_KEY = `consia_widget_session_${SITE}`;

  const FALLBACK_PROFILES = {
    manglar: {
      title: "CONSIA · Manglar",
      subtitle: "Proyectos, obras, desarrollos e inversiones.",
      accent: "#7aa2ff",
      welcome:
        "Hola. Soy CONSIA de Manglar. Puedo guiarte con proyectos, obras, desarrollos, inversión o inmobiliaria.",
      quick: [
        "Quiero ver proyectos",
        "Quiero información de inversión",
        "Quiero hablar con un asesor"
      ]
    },
    realwork: {
      title: "CONSIA · Real Work",
      subtitle: "Propiedades, profesionales y oportunidades.",
      accent: "#9f7bff",
      welcome:
        "Hola. Soy CONSIA de Real Work. Puedo ayudarte a encontrar propiedades, servicios o dejar tu consulta.",
      quick: [
        "Busco una propiedad",
        "Quiero publicar",
        "Quiero hablar con un asesor"
      ]
    },
    vipwork: {
      title: "CONSIA · VIP Work",
      subtitle: "Empresas, postulantes y RRHH.",
      accent: "#73f0b0",
      welcome:
        "Hola. Soy CONSIA de VIP Work. Puedo orientarte si sos empresa o postulante y derivarte correctamente.",
      quick: [
        "Soy empresa",
        "Soy postulante",
        "Quiero hablar con un asesor"
      ]
    },
    vairo: {
      title: "CONSIA · Vairo",
      subtitle: "Estudio contable y asesoramiento.",
      accent: "#ffd36c",
      welcome:
        "Hola. Soy CONSIA de Vairo y Asociados. Puedo orientarte con servicios contables, fiscales y administrativos.",
      quick: [
        "Necesito asesoramiento",
        "Quiero una consulta",
        "Quiero dejar mis datos"
      ]
    },
    bambino: {
      title: "CONSIA · Bambino",
      subtitle: "Juguetes, promos y recomendaciones.",
      accent: "#ff8ca2",
      welcome:
        "Hola. Soy CONSIA de Bambino. Puedo ayudarte con productos, promos y recomendaciones por edad.",
      quick: [
        "Busco un regalo",
        "Quiero ver promos",
        "Quiero dejar mis datos"
      ]
    },
    consia: {
      title: "CONSIA",
      subtitle: "Asistente inteligente",
      accent: "#7aa2ff",
      welcome: "Hola. Soy CONSIA. ¿En qué puedo ayudarte?",
      quick: [
        "Quiero información",
        "Quiero hablar con un asesor",
        "Quiero dejar mis datos"
      ]
    }
  };

  const state = {
    site: SITE,
    profile: FALLBACK_PROFILES[SITE] || FALLBACK_PROFILES.consia,
    open: false,
    loading: false,
    leadOpen: false,
    conversationId: sessionStorage.getItem(SESSION_KEY) || (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
    messages: [],
    mounted: false
  };

  sessionStorage.setItem(SESSION_KEY, state.conversationId);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function saveState() {
    const payload = {
      conversationId: state.conversationId,
      messages: state.messages.slice(-20)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse(raw, null);
    if (parsed?.conversationId) {
      state.conversationId = parsed.conversationId;
      sessionStorage.setItem(SESSION_KEY, state.conversationId);
    }
    if (Array.isArray(parsed?.messages) && parsed.messages.length) {
      state.messages = parsed.messages.slice(-20);
    }
  }

  function injectStyles(accent) {
    const style = document.createElement("style");
    style.textContent = `
      .consia-widget-shell{all:initial}
      .consia-launcher{
        position:fixed;
        ${POSITION === "left" ? "left:20px;" : "right:20px;"}
        bottom:20px;
        z-index:2147483640;
        width:68px;
        height:68px;
        border:none;
        border-radius:999px;
        cursor:pointer;
        background:
          radial-gradient(circle at 35% 35%, rgba(255,255,255,.96), rgba(255,255,255,.08) 18%, transparent 19%),
          radial-gradient(circle at 50% 50%, ${accent}, rgba(122,162,255,.18) 42%, rgba(159,123,255,.12) 60%, transparent 76%);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.10),
          0 12px 30px rgba(0,0,0,.32),
          0 0 60px ${accent}33;
        transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      }
      .consia-launcher:hover{transform:translateY(-1px) scale(1.02)}
      .consia-launcher:active{transform:scale(.98)}
      .consia-launcher::after{
        content:"";
        position:absolute;
        inset:-10px;
        border-radius:999px;
        border:1px solid ${accent}33;
        animation:consiaPulse 3s linear infinite;
      }

      .consia-panel{
        position:fixed;
        ${POSITION === "left" ? "left:20px;" : "right:20px;"}
        bottom:98px;
        z-index:2147483640;
        width:min(420px, calc(100vw - 24px));
        height:min(720px, calc(100vh - 120px));
        display:none;
        flex-direction:column;
        overflow:hidden;
        border-radius:24px;
        border:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0)), rgba(10,16,28,.96);
        box-shadow:0 24px 64px rgba(0,0,0,.42);
        backdrop-filter:blur(18px);
        font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color:#eef3ff;
      }
      .consia-panel.open{display:flex}

      .consia-head{
        padding:16px 16px 12px;
        border-bottom:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
      }
      .consia-head-top{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
      }
      .consia-title{
        font-size:16px;
        font-weight:800;
        letter-spacing:-.03em;
      }
      .consia-sub{
        margin-top:4px;
        color:#93a0c2;
        font-size:12px;
        line-height:1.55;
      }
      .consia-close{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);
        color:#93a0c2;
        border-radius:12px;
        padding:8px 10px;
        cursor:pointer;
      }

      .consia-body{
        flex:1;
        overflow:auto;
        padding:14px;
        background:rgba(4,7,14,.74);
      }

      .consia-msg{
        padding:11px 12px;
        border-radius:16px;
        margin-bottom:10px;
        line-height:1.55;
        font-size:14px;
        word-break:break-word;
      }
      .consia-msg.bot{
        margin-right:20px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.05);
      }
      .consia-msg.user{
        margin-left:34px;
        background:rgba(122,162,255,.14);
        border:1px solid rgba(122,162,255,.12);
      }
      .consia-msg.system{
        background:rgba(255,211,108,.10);
        color:#ffe7a0;
        border:1px solid rgba(255,211,108,.10);
      }

      .consia-actions{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:10px;
      }
      .consia-action{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#eef3ff;
        border-radius:12px;
        padding:8px 10px;
        cursor:pointer;
        font-size:12px;
      }

      .consia-foot{
        padding:12px;
        border-top:1px solid rgba(255,255,255,.08);
        background:rgba(10,16,28,.98);
      }
      .consia-row{
        display:flex;
        gap:8px;
      }
      .consia-input{
        flex:1;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#eef3ff;
        padding:12px;
        outline:none;
        font:inherit;
      }
      .consia-input:focus{
        border-color:${accent}55;
        box-shadow:0 0 0 4px ${accent}22;
      }
      .consia-send{
        border:none;
        border-radius:14px;
        padding:12px 14px;
        cursor:pointer;
        font-weight:700;
        color:white;
        background:linear-gradient(135deg, ${accent}, #9f7bff);
      }
      .consia-send:disabled{opacity:.6;cursor:not-allowed}

      .consia-mini{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:10px;
      }
      .consia-mini button{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#eef3ff;
        border-radius:12px;
        padding:8px 10px;
        cursor:pointer;
      }

      .consia-lead{
        display:none;
        margin-top:10px;
        padding-top:10px;
        border-top:1px dashed rgba(255,255,255,.08);
      }
      .consia-lead.open{display:block}
      .consia-lead input{
        width:100%;
        margin:0 0 8px 0;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#eef3ff;
        padding:11px;
        outline:none;
        font:inherit;
      }
      .consia-lead-send{
        width:100%;
        border:none;
        border-radius:12px;
        padding:11px 12px;
        font-weight:700;
        cursor:pointer;
        color:white;
        background:linear-gradient(135deg, ${accent}, #9f7bff);
      }

      .consia-loading{
        opacity:.8;
        font-size:12px;
        color:#93a0c2;
        margin-top:6px;
      }

      @keyframes consiaPulse{
        0%{transform:scale(.94);opacity:.72}
        100%{transform:scale(1.20);opacity:0}
      }

      @media (max-width:680px){
        .consia-launcher{
          ${POSITION === "left" ? "left:14px;" : "right:14px;"}
          bottom:14px;
        }
        .consia-panel{
          ${POSITION === "left" ? "left:12px;" : "right:12px;"}
          bottom:90px;
          width:calc(100vw - 24px);
          height:calc(100vh - 108px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createShell() {
    const shell = document.createElement("div");
    shell.className = "consia-widget-shell";

    shell.innerHTML = `
      <button class="consia-launcher" aria-label="Abrir CONSIA"></button>

      <section class="consia-panel" aria-live="polite" aria-label="CONSIA Widget">
        <div class="consia-head">
          <div class="consia-head-top">
            <div class="consia-title"></div>
            <button class="consia-close" type="button">Cerrar</button>
          </div>
          <div class="consia-sub"></div>
        </div>

        <div class="consia-body"></div>

        <div class="consia-foot">
          <div class="consia-row">
            <input class="consia-input" type="text" placeholder="Escribí tu consulta..." />
            <button class="consia-send" type="button">Enviar</button>
          </div>
          <div class="consia-loading" style="display:none;">CONSIA está pensando...</div>

          <div class="consia-mini">
            <button type="button" data-mini="avatar">Avatar live</button>
            <button type="button" data-mini="lead">Dejar mis datos</button>
            <button type="button" data-mini="clear">Nueva conversación</button>
          </div>

          <div class="consia-lead">
            <input class="consia-lead-name" type="text" placeholder="Tu nombre" />
            <input class="consia-lead-phone" type="text" placeholder="Tu teléfono" />
            <input class="consia-lead-email" type="email" placeholder="Tu email" />
            <button class="consia-lead-send" type="button">Enviar datos</button>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(shell);
    return shell;
  }

  function render(shell) {
    const panel = shell.querySelector(".consia-panel");
    const body = shell.querySelector(".consia-body");
    const title = shell.querySelector(".consia-title");
    const sub = shell.querySelector(".consia-sub");
    const loading = shell.querySelector(".consia-loading");
    const leadBox = shell.querySelector(".consia-lead");

    title.textContent = state.profile.title;
    sub.textContent = state.profile.subtitle;
    panel.classList.toggle("open", state.open);
    loading.style.display = state.loading ? "block" : "none";
    leadBox.classList.toggle("open", state.leadOpen);

    if (!state.messages.length) {
      body.innerHTML = `<div class="consia-msg bot">${escapeHtml(state.profile.welcome)}</div>`;
      body.scrollTop = body.scrollHeight;
      return;
    }

    body.innerHTML = state.messages
      .map((m) => {
        const actions = Array.isArray(m.actions) && m.actions.length
          ? `
            <div class="consia-actions">
              ${m.actions
                .map(
                  (a) =>
                    `<button class="consia-action" type="button" data-prompt="${escapeHtml(a.prompt)}">${escapeHtml(a.label)}</button>`
                )
                .join("")}
            </div>
          `
          : "";

        return `
          <div class="consia-msg ${m.role === "user" ? "user" : m.role === "system" ? "system" : "bot"}">
            ${escapeHtml(m.content).replace(/\n/g, "<br>")}
            ${actions}
          </div>
        `;
      })
      .join("");

    body.querySelectorAll(".consia-action").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = shell.querySelector(".consia-input");
        input.value = btn.getAttribute("data-prompt") || "";
        input.focus();
      });
    });

    body.scrollTop = body.scrollHeight;
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
    if (!response.ok) {
      throw new Error(typeof data === "string" ? data : JSON.stringify(data));
    }
    return data;
  }

  function currentPageContext() {
    return {
      page_url: location.href,
      page_title: document.title,
      referrer: document.referrer || ""
    };
  }

  async function bootstrapProfile() {
    try {
      const data = await fetchJson(`${API_BASE}/v1/widget/config?site=${encodeURIComponent(SITE)}`);
      if (data?.profile) {
        state.profile = {
          ...state.profile,
          ...data.profile
        };
      }
    } catch {
      // fallback local
    }
  }

  function addMessage(role, content, actions = null) {
    state.messages.push({ role, content, actions });
    state.messages = state.messages.slice(-20);
    saveState();
  }

  async function sendMessage(shell, text) {
    const message = String(text || "").trim();
    if (!message || state.loading) return;

    state.loading = true;
    addMessage("user", message);
    render(shell);

    try {
      const data = await fetchJson(`${API_BASE}/v1/widget/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          site: SITE,
          conversationId: state.conversationId,
          message,
          history: state.messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          ...currentPageContext()
        })
      });

      addMessage(
        "assistant",
        data.response || "Sin respuesta.",
        Array.isArray(data.actions) ? data.actions : null
      );
    } catch {
      addMessage("system", "No pude responder ahora. Dejá tus datos y te contactamos.");
    } finally {
      state.loading = false;
      render(shell);
    }
  }

  async function sendLead(shell) {
    const name = shell.querySelector(".consia-lead-name").value.trim();
    const phone = shell.querySelector(".consia-lead-phone").value.trim();
    const email = shell.querySelector(".consia-lead-email").value.trim();

    if (!name && !phone && !email) return;

    try {
      await fetchJson(`${API_BASE}/v1/widget/lead`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          site: SITE,
          name,
          phone,
          email,
          ...currentPageContext()
        })
      });

      shell.querySelector(".consia-lead-name").value = "";
      shell.querySelector(".consia-lead-phone").value = "";
      shell.querySelector(".consia-lead-email").value = "";
      state.leadOpen = false;
      addMessage("assistant", "Perfecto. Ya tomé tus datos y un asesor va a continuar el contacto.");
      render(shell);
    } catch {
      addMessage("system", "No pude guardar tus datos en este momento.");
      render(shell);
    }
  }

  function newConversation(shell) {
    state.conversationId = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
    sessionStorage.setItem(SESSION_KEY, state.conversationId);
    state.messages = [
      {
        role: "assistant",
        content: state.profile.welcome,
        actions: (state.profile.quick || []).map((q) => ({ label: q, prompt: q }))
      }
    ];
    saveState();
    render(shell);
  }

  function bindUI(shell) {
    const launcher = shell.querySelector(".consia-launcher");
    const panel = shell.querySelector(".consia-panel");
    const close = shell.querySelector(".consia-close");
    const input = shell.querySelector(".consia-input");
    const send = shell.querySelector(".consia-send");
    const avatarBtn = shell.querySelector('[data-mini="avatar"]');
    const leadBtn = shell.querySelector('[data-mini="lead"]');
    const clearBtn = shell.querySelector('[data-mini="clear"]');
    const leadSend = shell.querySelector(".consia-lead-send");

    launcher.addEventListener("click", () => {
      state.open = !state.open;
      render(shell);
    });

    close.addEventListener("click", () => {
      state.open = false;
      render(shell);
    });

    send.addEventListener("click", () => {
      const value = input.value;
      input.value = "";
      sendMessage(shell, value);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = input.value;
        input.value = "";
        sendMessage(shell, value);
      }
    });

    avatarBtn.addEventListener("click", () => {
      const url = `${AVATAR_URL_BASE}?site=${encodeURIComponent(SITE)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });

    leadBtn.addEventListener("click", () => {
      state.leadOpen = !state.leadOpen;
      render(shell);
    });

    clearBtn.addEventListener("click", () => {
      newConversation(shell);
    });

    leadSend.addEventListener("click", () => {
      sendLead(shell);
    });

    panel.addEventListener("click", (e) => {
      const prompt = e.target?.getAttribute?.("data-prompt");
      if (prompt) {
        input.value = prompt;
        input.focus();
      }
    });
  }

  async function boot() {
    if (state.mounted) return;
    state.mounted = true;

    loadState();
    await bootstrapProfile();

    injectStyles(state.profile.accent);
    const shell = createShell();

    if (!state.messages.length) {
      state.messages = [
        {
          role: "assistant",
          content: state.profile.welcome,
          actions: (state.profile.quick || []).map((q) => ({ label: q, prompt: q }))
        }
      ];
      saveState();
    }

    bindUI(shell);
    render(shell);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
