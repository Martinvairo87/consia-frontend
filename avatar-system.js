class CONSIA {
  constructor() {
    this.init();
  }

  init() {
    this.speak("CONSIA ONLINE");
    this.listen();
  }

  speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-AR";
    speechSynthesis.speak(u);
  }

  listen() {
    const rec = new (webkitSpeechRecognition || SpeechRecognition)();
    rec.lang = "es-AR";

    rec.onresult = (e) => {
      const cmd = e.results[0][0].transcript.toLowerCase();
      this.run(cmd);
    };

    rec.start();
  }

  async run(cmd) {
    console.log("CMD:", cmd);

    if (cmd.includes("crm")) location.href = "/crm.html";
    if (cmd.includes("dashboard")) location.href = "/dashboard-pro.html";

    if (cmd.includes("automatizar")) {
      await fetch("https://api.consia.world/v1/auto", { method: "POST" });
      this.speak("Automatización activada");
    }
  }
}

window.onload = () => new CONSIA();
