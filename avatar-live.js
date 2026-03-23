class ConsiaLiveAvatar {
  constructor() {
    this.init();
  }

  async init() {
    this.createUI();
    this.speak("CONSIA operativo");
    this.listen();
  }

  createUI() {
    const container = document.createElement("div");
    container.id = "consia-avatar";

    container.innerHTML = `
      <div class="avatar-core">
        <video id="avatarVideo" autoplay loop muted playsinline>
          <source src="https://cdn.coverr.co/videos/coverr-woman-using-computer-5176/1080p.mp4" type="video/mp4">
        </video>
        <div class="hud">
          <div class="pulse"></div>
          <div class="text">CONSIA ONLINE</div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const style = document.createElement("style");
    style.innerHTML = `
      #consia-avatar {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 220px;
        height: 320px;
        z-index: 999999;
        pointer-events: none;
      }

      .avatar-core {
        width: 100%;
        height: 100%;
        border-radius: 20px;
        overflow: hidden;
        backdrop-filter: blur(20px);
        box-shadow: 0 0 40px rgba(0,200,255,0.4);
        border: 1px solid rgba(255,255,255,0.1);
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .hud {
        position: absolute;
        top: 10px;
        left: 10px;
        color: #00eaff;
        font-size: 12px;
        font-family: monospace;
      }

      .pulse {
        width: 10px;
        height: 10px;
        background: #00eaff;
        border-radius: 50%;
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.5); }
        100% { opacity: 0.3; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-AR";
    u.rate = 1;
    speechSynthesis.speak(u);
  }

  listen() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = "es-AR";
    rec.continuous = true;

    rec.onresult = async (e) => {
      const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
      this.execute(cmd);
    };

    rec.start();
  }

  async execute(cmd) {
    console.log("CMD:", cmd);

    if (cmd.includes("abrir crm")) location.href = "/crm.html";
    if (cmd.includes("dashboard")) location.href = "/dashboard-pro.html";

    if (cmd.includes("automatizar")) {
      await fetch("https://api.consia.world/v1/auto", { method: "POST" });
      this.speak("Automatización activa");
    }

    if (cmd.includes("estado")) {
      this.speak("Sistema operativo al máximo nivel");
    }
  }
}

window.addEventListener("load", () => {
  new ConsiaLiveAvatar();
});
