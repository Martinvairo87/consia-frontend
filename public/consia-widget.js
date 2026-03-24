(() => {
  const script = document.currentScript;
  const site = (script?.dataset?.site || "consia").trim().toLowerCase();
  const apiBase = (script?.dataset?.api || "https://api.consia.world").replace(/\/$/, "");
  const avatarBase = script?.dataset?.avatar || "https://consia.world/avatar.html";

  const FALLBACK_PROFILES = {
    manglar: {
      title: "CONSIA · Manglar",
      subtitle: "Proyectos, obras, desarrollos e inversiones.",
      accent: "#7aa2ff",
      welcome: "Hola. Soy CONSIA de Manglar. Puedo guiarte con proyectos, obras, desarrollos, inversión o inmobiliaria."
    },
    realwork: {
      title: "CONSIA · Real Work",
      subtitle: "Propiedades, profesionales y oportunidades.",
      accent: "#9f7bff",
      welcome: "Hola. Soy CONSIA de Real Work. Puedo ayudarte a encontrar propiedades, servicios o dejar tu consulta."
    },
    vipwork: {
      title: "CONSIA · VIP Work",
      subtitle: "Empresas, postulantes y RRHH.",
      accent: "#73f0b0",
      welcome: "Hola. Soy CONSIA de VIP Work. Puedo orientarte si sos empresa o postulante y derivarte correctamente."
    },
    vairo: {
      title: "CONSIA · Vairo",
      subtitle: "Estudio contable y asesoramiento.",
      accent: "#ffd36c",
      welcome: "Hola. Soy CONSIA de Vairo y Asociados. Puedo orientarte con servicios contables, fiscales y administrativos."
    },
    bambino: {
      title: "CONSIA · Bambino",
      subtitle: "Juguetes, promos y recomendaciones.",
      accent: "#ff8ca2",
      welcome: "Hola. Soy CONSIA de Bambino. Puedo ayudarte con productos, promos y recomendaciones por edad."
    }
  };

  const state = {
    open: false,
    conversationId: crypto.randomUUID(),
    profile: FALLBACK_PROFILES[site] || {
      title: "CONSIA",
      subtitle: "Asistente inteligente",
      accent: "#7aa2ff",
      welcome: "Hola. Soy CONSIA. ¿En qué puedo ayudarte?"
    },
    messages: []
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function injectStyles(accent = "#7aa2ff") {
    const style = document.createElement("style");
    style.textContent = `
      .consia-widget-root{all:initial}
      .consia-launcher{
        position:fixed;right:22px;bottom:22px;z-index:2147483640;
        width:64px;height:64px;border-radius:999px;border:0;cursor:pointer;
        background:radial-gradient(circle at 35% 35%, rgba(255,255,255,.95), rgba(255,255,255,.08) 18%, transparent 19%),
                   radial-gradient(circle at 50% 50%, ${accent}, rgba(122,162,255,.18) 42%, rgba(159,123,255,.12) 60%, transparent 76%);
        box-shadow:0 0 0 1px rgba(255,255,255,.12),0 0 30px rgba(0,0,0,.32),0 0 60px ${accent}33;
      }
      .consia-launcher:hover{transform:translateY(-1px)}
      .consia-panel{
        position:fixed;right:22px;bottom:98px;z-index:2147483640;
        width:min(420px,calc(100vw - 24px));height:min(700px,calc(100vh - 130px));
        display:none;flex-direction:column;overflow:hidden;
        background:rgba(10,16,28,.96);color:#eef3ff;
        border:1px solid rgba(255,255,255,.08);border-radius:22px;
        box-shadow:0 24px 64px rgba(0,0,0,.42);backdrop-filter:blur(18px);
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      .consia-panel.open{display:flex}
      .consia-head{
        padding:16px 16px 12px 16px;border-bottom:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
      }
      .consia-head-top{display:flex;justify-content:space-between;gap:10px;align-items:center}
      .consia-title{font-weight:800;font-size:16px;letter-spacing:-.03em}
      .consia-sub{margin-top:4px;color:#93a0c2;font-size:12px;line-height:1.5}
      .consia-x{
        background:transparent;color:#93a0c2;border:1px solid rgba(255,255,255,.08);
        border-radius:12px;padding:8px 10px;cursor:pointer
      }
      .consia-body{flex:1;overflow:auto;padding:14px;background:rgba(4,7,14,.72)}
      .consia-msg{padding:10px 12px;border-radius:16px;margin-bottom:10px;line-height:1.5;font-size:14px}
      .consia-msg.user{background:rgba(122,162,255,.14);margin-left:36px}
      .consia-msg.bot{background:rgba(255,255,255,.05);margin-right:24px}
      .consia-msg.system{background:rgba(255,211,108,.10);color:#ffe7a0}
      .consia-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .consia-action{
        background:rgba(255,255,255,.05);color:#eef3ff;border:1px solid rgba(255,255,255,.08);
        border-radius:12px;padding:9px 10px;cursor:pointer;font-size:12px
      }
      .consia-foot{
        padding:12px;border-top:1px solid rgba(255,255,255,.08);
        background:rgba(10,16,28,.98)
      }
      .consia-row{display:flex;gap:8px}
      .consia-input{
        flex:1;border-radius:14px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);color:#eef3ff;padding:12px;outline:none;font:inherit
      }
      .consia-btn{
        border:0;border-radius:14px;padding:12px 14px;cursor:pointer;font-weight:700;
        background:linear-gradient(135deg, ${accent}, #9f7bff);color:#fff
      }
      .consia-mini{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .consia-mini button{
        border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);
        color:#eef3ff;border-radius:12px;padding:8px 10px;cursor:pointer
      }
      .consia-lead{
        margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.08);display:none
      }
      .consia-lead.open{display:block}
      .consia-lead input{
        width:100%;margin:0 0 8px 0;border-radius:12px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);color:#eef3ff;padding:11px;outline:none;font:inherit
      }
      @media (max-width:680px){
        .consia-launcher{right:14px;bottom:14px}
        .consia-panel{right:12px;bottom:88px;width:calc(100vw - 24px);height:calc(100vh - 110px)}
      }
    `;
    document.head.appendChild(style);
  }

  function createUI() {
    injectStyles(state.profile.accent);

    const root = document.createElement("div");
    root.className = "consia-widget-root";

    root.innerHTML = `
      <button class="consia-launcher" aria-label="Abrir CONSIA"></button>
      <section class="consia-panel" aria-live="polite">
        <div class="consia-head">
          <div class="consia-head-top">
            <div class="consia-title">${escapeHtml(state.profile.title)}</div>
            <button class="consia-x" type="button">Cerrar</button>
          </div>
          <div class="consia-sub">${escapeHtml(state.profile.subtitle)}</div>
        </div>
        <div class="consia-body"></div>
        <div class="consia-foot">
          <div class="consia-row">
            <input class="consia-input" type="text" placeholder="Escribí tu consulta..." />
            <button class="consia-btn" type="button">Enviar</button>
          </div>
          <div class="consia-mini">
            <button type="button" data-action="avatar">Avatar live</button>
            <button type="button" data-action="lead">Dejar mis datos</button>
          </div>
          <div class="consia-lead">
            <input type="text" class="lead-name" placeholder="Tu nombre" />
            <input type="text" class="lead-phone" placeholder="Tu teléfono" />
            <input type="email" class="lead-email" placeholder="Tu email" />
            <button type="button" class="consia-btn lead-send">Enviar datos</button>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(root);

    const launcher = root.querySelector(".consia-launcher");
    const panel = root.querySelector(".consia-panel");
    const closeBtn = root.querySelector(".consia-x");
    const body = root.querySelector(".consia-body");
    const input = root.querySelector(".consia-input");
    const sendBtn = root.querySelector(".consia-btn");
    const miniAvatar = root.querySelector('[data-action="avatar"]');
    const miniLead = root.querySelector('[data-action="lead"]');
    const leadBox = root.querySelector(".consia-lead");
    const leadSend = root.querySelector(".lead-send");

    function render() {
      panel.classList.toggle("open", state.open);
      body.innerHTML = state.messages.map((m) => `
        <div class="consia-msg ${m.role === "user" ? "user" : (m.role === "system" ? "system" : "bot")}">
          ${escapeHtml(m.content).replace(/\n/g, "<br>")}
          ${m.actions ? `
            <div class="consia-actions">
              ${m.actions.map((a) => `<button class="consia-action" data-prompt="${escapeHtml(a.prompt)}">${escapeHtml(a.label)}</button>`).join("")}
            </div>
          ` : ""}
        </div>
      `).join("");

      body.querySelectorAll(".consia-action").forEach((btn) => {
        btn.addEventListener("click", () => {
          input.value = btn.getAttribute("data-prompt") || "";
          input.focus();
        });
      });

      body.scrollTop = body.scrollHeight;
    }

    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      state.messages.push({ role: "user", content: message });
      render();
      input.value = "";

      try {
        const response = await fetch(`${apiBase}/v1/widget/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            site,
            conversationId: state.conversationId,
            message,
            page_url: location.href,
            page_title: document.title,
            referrer: document.referrer || "",
            history: state.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }))
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));

        state.messages.push({
          role: "assistant",
          content: data.response || "Sin respuesta.",
          actions: data.actions || null
        });
        render();
      } catch (err) {
        state.messages.push({
          role: "system",
          content: "No pude responder ahora. Dejá tus datos y te contactamos."
        });
        render();
      }
    }

    async function sendLead() {
      const name = root.querySelector(".lead-name").value.trim();
      const phone = root.querySelector(".lead-phone").value.trim();
      const email = root.querySelector(".lead-email").value.trim();

      if (!name && !phone && !email) return;

      try {
        const response = await fetch(`${apiBase}/v1/widget/lead`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            site,
            name,
            phone,
            email,
            page_url: location.href,
            page_title: document.title
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));

        state.messages.push({
          role: "assistant",
          content: "Perfecto. Ya tomé tus datos y un asesor va a continuar el contacto."
        });
        root.querySelector(".lead-name").value = "";
        root.querySelector(".lead-phone").value = "";
        root.querySelector(".lead-email").value = "";
        leadBox.classList.remove("open");
        render();
      } catch (err) {
        state.messages.push({
          role: "system",
          content: "No pude guardar tus datos en este momento."
        });
        render();
      }
    }

    launcher.addEventListener("click", () => {
      state.open = !state.open;
      render();
    });

    closeBtn.addEventListener("click", () => {
      state.open = false;
      render();
    });

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    miniAvatar.addEventListener("click", () => {
      const url = `${avatarBase}?site=${encodeURIComponent(site)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });

    miniLead.addEventListener("click", () => {
      leadBox.classList.toggle("open");
    });

    leadSend.addEventListener("click", sendLead);

    state.messages.push({
      role: "assistant",
      content: state.profile.welcome,
      actions: [
        { label: "Quiero información", prompt: "Quiero más información." },
        { label: "Quiero hablar con un asesor", prompt: "Quiero hablar con un asesor." },
        { label: "Dejar mis datos", prompt: "Quiero dejar mis datos." }
      ]
    });
    render();
  }

  async function bootstrapProfile() {
    try {
      const response = await fetch(`${apiBase}/v1/widget/config?site=${encodeURIComponent(site)}`);
      const data = await response.json();
      if (response.ok && data?.profile) {
        state.profile = { ...state.profile, ...data.profile };
      }
    } catch {}
    createUI();
  }

  bootstrapProfile();
})();
