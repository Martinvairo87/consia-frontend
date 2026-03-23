class Jarvis {

  constructor(){
    this.video = null;
    this.recognition = null;
    this.init();
  }

  async init(){
    await this.initCamera();
    this.initVoice();
    this.boot();
  }

  async initCamera(){
    const stream = await navigator.mediaDevices.getUserMedia({ video:true });
    this.video = document.createElement("video");
    this.video.srcObject = stream;
    this.video.autoplay = true;
    this.video.style.position="fixed";
    this.video.style.top="10px";
    this.video.style.left="10px";
    this.video.style.width="180px";
    this.video.style.borderRadius="12px";
    this.video.style.opacity="0.7";
    document.body.appendChild(this.video);
  }

  initVoice(){
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new Speech();
    this.recognition.lang = "es-AR";

    this.recognition.onresult = (e)=>{
      const cmd = e.results[0][0].transcript.toLowerCase();
      console.log("JARVIS escucha:", cmd);
      this.process(cmd);
    };

    this.recognition.onend = ()=> this.recognition.start();
    this.recognition.start();
  }

  speak(text){
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    speechSynthesis.speak(u);
  }

  process(cmd){

    if(cmd.includes("estado")){
      this.speak("Sistema CONSIA operativo al máximo nivel");
    }

    if(cmd.includes("activar ventas")){
      engine.run("ventas autopilot");
      this.speak("Ventas automatizadas activadas");
    }

    if(cmd.includes("crear cliente")){
      engine.run("crear lead");
      this.speak("Cliente generado");
    }

    if(cmd.includes("modo automático")){
      this.autopilot();
      this.speak("Autopilot activado");
    }
  }

  autopilot(){
    setInterval(()=>{
      engine.run("optimizar sistema");
      console.log("AUTO IA RUNNING");
    },5000);
  }

  boot(){
    setTimeout(()=>{
      this.speak("CONSIA JARVIS activo. Control total habilitado.");
    },1200);
  }

}

window.jarvis = new Jarvis();
