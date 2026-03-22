(() => {
  const API_BASE = window.CONSIA_API_BASE || "https://api.consia.world";

  const canvas = document.getElementById("avatarCanvas");
  const ctx = canvas.getContext("2d");

  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");
  const avatarModeLabel = document.getElementById("avatarModeLabel");
  const chatBody = document.getElementById("chatBody");
  const msgEl = document.getElementById("msg");
  const consoleEl = document.getElementById("console");

  const micBtn = document.getElementById("micBtn");
  const composerMicBtn = document.getElementById("composerMicBtn");
  const sendBtn = document.getElementById("sendBtn");
  const presentBtn = document.getElementById("presentBtn");
  const stopBtn = document.getElementById("stopBtn");
  const clearBtn = document.getElementById("clearBtn");

  const presentationGrid = document.getElementById("presentationGrid");

  let speaking = false;
  let listening = false;
  let recognition = null;
  let phase = 0;
  let energy = 0.22;

  function setMode(text) {
    avatarModeLabel.textContent = text;
  }

  function log(text) {
    consoleEl.textContent = text;
  }

  function autoResize() {
    msgEl.style.height = "auto";
    msgEl.style.height = `${Math.min(msgEl.scrollHeight, 180)}px`;
  }

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `msg-row ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    row.appendChild(bubble);
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "msg-row assistant";
    row.id = "typingRow";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = "...";

    row.appendChild(bubble);
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("typingRow");
    if (el) el.remove();
  }

  function drawAvatar() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    phase += 0.012;

    const localEnergy = speaking ? 0.7 : listening ? 0.52 : energy;
    const pulse = Math.sin(phase * 2.2) * 8;
    const radius = 118 + pulse * localEnergy;

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 220);
    glow.addColorStop(0, "rgba(56, 217, 255, 0.18)");
    glow.addColorStop(0.45, "rgba(123, 97, 255, 0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.fill();

    // Rings
    for (let i = 0; i < 3; i++) {
      const rr = radius + 26 * i;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0
        ? `rgba(56,217,255,${0.28 - i * 0.06})`
        : `rgba(123,97,255,${0.24 - i * 0.05})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Core
    const core = ctx.createRadialGradient(
      cx - 32,
      cy - 40,
      12,
      cx,
      cy,
      150
    );
    core.addColorStop(0, "rgba(255,255,255,0.88)");
    core.addColorStop(0.12, "rgba(56,217,255,0.98)");
    core.addColorStop(0.48, "rgba(123,97,255,0.90)");
    core.addColorStop(1, "rgba(7,12,20,0.98)");

    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner reflections
    ctx.beginPath();
    ctx.arc(cx - 35, cy - 42, 24, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();

    // Voice bars
    const bars = speaking ? 8 : listening ? 5 : 3;
    for (let i = 0; i < bars; i++) {
      const angle = phase * 2 + (Math.PI * 2 * i) / bars;
      const rr = radius + 42;
      const bx = cx + Math.cos(angle) * rr;
      const by = cy + Math.sin(angle) * rr;
      const size = (speaking ? 8 : 5) + Math.sin(phase * 6 + i) * 2.5;

      ctx.beginPath();
      ctx.arc(bx, by, Math.max(2, size), 0, Math.PI * 2);
      ctx.fillStyle = speaking
        ? "rgba(57,240,162,0.85)"
        : "rgba(56,217,255,0.58)";
      ctx.fill();
    }

    requestAnimationFrame(drawAvatar);
  }

  async function checkHealth() {
    try {
      const r = await fetch(`${API_BASE}/health`);
      const d = await r.json();

      if (d.ok) {
        statusText.textContent = "Online";
        statusDot.classList.add("online");
        log("CONSIA Avatar OS online.");
      } else {
        statusText.textContent = "Error";
        log("La API respondió sin OK.");
      }
    } catch (e) {
      statusText.textContent = "Sin conexión";
      log("No pude conectar con la API.");
    }
  }

  async function loadPresentation() {
    try {
      const r = await fetch(`${API_BASE}/v1/avatar/presentation`);
      const d = await r.json();

      presentationGrid.innerHTML = "";
      (d.sections || []).forEach((item) => {
        const div = document.createElement("div");
        div.className = "presentation-tile";
        div.innerHTML = `
          <div class="section-kicker">${item.kicker || "CONSIA"}</div>
          <div class="presentation-title">${item.title || ""}</div>
          <div class="presentation-text">${item.text || ""}</div>
        `;
        presentationGrid.appendChild(div);
      });

      log("Presentación cargada.");
    } catch (e) {
      log("No pude cargar la presentación.");
    }
  }

  function stopVoice() {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    speaking = false;
    setMode("Modo standby");
    log("Voz detenida.");
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      log("SpeechSynthesis no disponible.");
      return;
    }

    stopVoice();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-AR";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onstart = () => {
      speaking = true;
      setMode("Modo speaking");
      log("CONSIA hablando...");
    };

    utter.onend = () => {
      speaking = false;
      setMode("Modo standby");
      log("Voz finalizada.");
    };

    utter.onerror = () => {
      speaking = false;
      setMode("Modo standby");
      log("Error de voz.");
    };

    speechSynthesis.speak(utter);
  }

  async function speakPresentation() {
    try {
      const r = await fetch(`${API_BASE}/v1/avatar/presentation`);
      const d = await r.json();

      const full = (d.sections || [])
        .map((s) => `${s.title}. ${s.text}`)
        .join(" ");

      if (full) {
        speak(full);
      }
    } catch (e) {
      log("No pude narrar la presentación.");
    }
  }

  async function send() {
    const text = msgEl.value.trim();
    if (!text) return;

    addMessage("user", text);
    msgEl.value = "";
    autoResize();
    addTyping();
    setMode("Modo processing");
    log("Procesando mensaje...");

    try {
      const r = await fetch(`${API_BASE}/v1/avatar/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          source: "avatar-ui"
        })
      });

      const d = await r.json();
      removeTyping();

      const reply = d.response || "Sin respuesta.";
      addMessage("assistant", reply);
      speak(reply);
      log("Respuesta generada.");
    } catch (e) {
      removeTyping();
      addMessage("assistant", "No pude conectar con CONSIA.");
      setMode("Modo standby");
      log("Error al enviar mensaje.");
    }
  }

  function quick(text) {
    msgEl.value = text;
    autoResize();
    send();
  }

  function toggleMic() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      log("SpeechRecognition no disponible.");
      return;
    }

    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "es-AR";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        listening = true;
        setMode("Modo listening");
        micBtn.textContent = "🛑 Detener voz";
        log("Escuchando...");
      };

      recognition.onend = () => {
        listening = false;
        setMode("Modo standby");
        micBtn.textContent = "🎙️ Activar voz";
        log("Micrófono detenido.");
      };

      recognition.onerror = () => {
        listening = false;
        setMode("Modo standby");
        micBtn.textContent = "🎙️ Activar voz";
        log("Error en reconocimiento de voz.");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript || "";
        msgEl.value = transcript;
        autoResize();
        send();
      };
    }

    if (!listening) {
      recognition.start();
    } else {
      recognition.stop();
    }
  }

  document.querySelectorAll("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => quick(btn.dataset.quick));
  });

  micBtn.addEventListener("click", toggleMic);
  composerMicBtn.addEventListener("click", toggleMic);
  sendBtn.addEventListener("click", send);
  presentBtn.addEventListener("click", speakPresentation);
  stopBtn.addEventListener("click", stopVoice);
  clearBtn.addEventListener("click", () => {
    chatBody.innerHTML = "";
    addMessage("assistant", "Chat reiniciado. CONSIA sigue listo.");
    log("Chat limpiado.");
  });

  msgEl.addEventListener("input", autoResize);
  msgEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  addMessage(
    "assistant",
    "Hola. Soy CONSIA. Estoy listo para presentación, voz y operación ejecutiva."
  );

  drawAvatar();
  checkHealth();
  loadPresentation();
})();
