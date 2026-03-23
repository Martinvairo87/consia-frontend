class ConsiaAvatar{

  constructor(){
    this.voice = null;
    this.init();
  }

  init(){
    this.loadVoice();
    this.bindUI();
    this.autoStart();
  }

  loadVoice(){
    const voices = speechSynthesis.getVoices();
    this.voice = voices.find(v=>v.lang.includes("es")) || voices[0];
  }

  speak(text){
    const u = new SpeechSynthesisUtterance(text);
    u.voice = this.voice;
    u.rate = 1;
    u.pitch = 1;
    speechSynthesis.speak(u);
  }

  bindUI(){
    document.getElementById("avatar").onclick = ()=>{
      this.listen();
    };
  }

  listen(){
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = "es-AR";

    rec.onresult = (e)=>{
      const text = e.results[0][0].transcript.toLowerCase();
      console.log("voz:",text);
      this.process(text);
    };

    rec.start();
  }

  process(cmd){

    if(cmd.includes("estado")){
      this.speak("Sistema operativo al cien por ciento");
    }

    else if(cmd.includes("crear cliente")){
      engine.run("crear lead");
      this.speak("Cliente creado");
    }

    else if(cmd.includes("ventas")){
      this.speak("Mostrando métricas");
    }

    else{
      this.speak("Comando no reconocido");
    }
  }

  autoStart(){
    setTimeout(()=>{
      this.speak("CONSIA activo. Control total habilitado.");
    },1500);
  }

}

window.consia = new ConsiaAvatar();
