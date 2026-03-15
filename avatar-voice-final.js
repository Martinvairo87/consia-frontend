
(() => {
  function create(options = {}) {
    const state = {
      lang: options.lang || "es-AR",
      muted: !!options.muted,
      recognition: null,
      listening: false
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    function supports() {
      return {
        asr: !!SpeechRecognition,
        tts: "speechSynthesis" in window
      };
    }

    function ensureRecognition() {
      if (!SpeechRecognition) return null;
      if (state.recognition) return state.recognition;
      const rec = new SpeechRecognition();
      rec.lang = state.lang;
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        state.listening = true;
        options.onStateChange?.("listening");
      };

      rec.onend = () => {
        state.listening = false;
        options.onStateChange?.("idle");
      };

      rec.onerror = (e) => {
        state.listening = false;
        options.onError?.(e);
        options.onStateChange?.("idle");
      };

      rec.onresult = (e) => {
        const text = e.results?.[0]?.[0]?.transcript || "";
        if (text) options.onTranscript?.(text);
      };

      state.recognition = rec;
      return rec;
    }

    function startListening() {
      const rec = ensureRecognition();
      if (!rec) {
        options.onError?.({ error: "speech_recognition_not_supported" });
        return false;
      }
      rec.lang = state.lang;
      try {
        rec.start();
        return true;
      } catch {
        return false;
      }
    }

    function stopListening() {
      if (state.recognition) {
        try { state.recognition.stop(); } catch {}
      }
      state.listening = false;
      options.onStateChange?.("idle");
    }

    function speak(text) {
      if (state.muted) return false;
      if (!("speechSynthesis" in window)) {
        options.onError?.({ error: "speech_synthesis_not_supported" });
        return false;
      }
      stopSpeaking();
      const utter = new SpeechSynthesisUtterance(String(text || "").slice(0, 1800));
      utter.lang = state.lang;
      utter.rate = 1;
      utter.pitch = 1;
      utter.onstart = () => options.onStateChange?.("speaking");
      utter.onend = () => options.onStateChange?.("idle");
      utter.onerror = () => options.onStateChange?.("idle");
      window.speechSynthesis.speak(utter);
      return true;
    }

    function stopSpeaking() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      options.onStateChange?.("idle");
    }

    function setLang(lang) {
      state.lang = lang || "es-AR";
      if (state.recognition) state.recognition.lang = state.lang;
    }

    function setMuted(value) {
      state.muted = !!value;
    }

    function isListening() {
      return state.listening;
    }

    return {
      supports,
      startListening,
      stopListening,
      speak,
      stopSpeaking,
      setLang,
      setMuted,
      isListening
    };
  }

  function updateOrb(el, mode) {
    if (!el) return;
    el.classList.remove("listening", "speaking", "busy");
    if (mode === "listening") el.classList.add("listening");
    if (mode === "speaking") el.classList.add("speaking");
    if (mode === "busy") el.classList.add("busy");
  }

  window.CONSIAVoiceAvatar = {
    create,
    updateOrb
  };
})();
