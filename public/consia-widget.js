(() => {
  if (window.__CONSIA_WIDGET_LOADED__) return;
  window.__CONSIA_WIDGET_LOADED__ = true;

  const currentScript = document.currentScript || [...document.scripts].find(s => /consia-widget\.js/.test(s.src));
  const site = currentScript?.dataset?.site || 'consia';
  const page = currentScript?.dataset?.page || 'avatar-premium.html';
  const api = currentScript?.dataset?.api || localStorage.getItem('CONSIA_API_BASE') || 'https://api.consia.world';
  const host = (() => {
    try { return new URL(currentScript?.src || 'https://consia.world/consia-widget.js').origin; }
    catch { return 'https://consia.world'; }
  })();
  const iframeUrl = `${host}/${page}?site=${encodeURIComponent(site)}&api=${encodeURIComponent(api)}`;

  const style = document.createElement('style');
  style.textContent = `
    .consia-launcher{position:fixed;right:20px;bottom:20px;z-index:2147483640;width:64px;height:64px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(135deg,rgba(91,140,255,.94),rgba(125,230,255,.82));box-shadow:0 20px 50px rgba(0,0,0,.32);display:grid;place-items:center;cursor:pointer;font:800 16px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;color:#fff;backdrop-filter:blur(12px)}
    .consia-launcher:hover{transform:translateY(-1px)}
    .consia-panel{position:fixed;right:20px;bottom:96px;z-index:2147483641;width:min(430px,calc(100vw - 24px));height:min(760px,calc(100vh - 120px));background:rgba(7,11,27,.78);border:1px solid rgba(255,255,255,.12);border-radius:28px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.45);backdrop-filter:blur(14px);display:none}
    .consia-panel.open{display:block}
    .consia-panel iframe{width:100%;height:100%;border:0;background:#050916}
    .consia-close{position:absolute;top:10px;right:10px;z-index:2;width:34px;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(0,0,0,.38);color:#fff;cursor:pointer;font:800 14px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif}
    @media (max-width:640px){.consia-panel{right:12px;left:12px;bottom:88px;width:auto;height:min(78vh,700px)}.consia-launcher{right:12px;bottom:12px}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'consia-panel';
  panel.innerHTML = `<button class="consia-close" aria-label="Cerrar">×</button><iframe title="CONSIA Widget" src="${iframeUrl}"></iframe>`;

  const launcher = document.createElement('button');
  launcher.className = 'consia-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Abrir CONSIA');
  launcher.textContent = 'C';

  launcher.onclick = () => panel.classList.toggle('open');
  panel.querySelector('.consia-close').onclick = () => panel.classList.remove('open');

  document.body.appendChild(panel);
  document.body.appendChild(launcher);
})();
