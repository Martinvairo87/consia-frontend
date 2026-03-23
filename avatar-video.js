const avatar = document.createElement("video");

avatar.src = "https://cdn.coverr.co/videos/coverr-woman-working-on-laptop-5173/1080p.mp4"; // reemplazable
avatar.autoplay = true;
avatar.loop = true;
avatar.muted = true;

avatar.style.position = "fixed";
avatar.style.bottom = "20px";
avatar.style.right = "20px";
avatar.style.width = "220px";
avatar.style.borderRadius = "16px";
avatar.style.boxShadow = "0 0 80px rgba(53,217,255,.6)";

document.body.appendChild(avatar);
