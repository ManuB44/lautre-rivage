// script.js (ne casse AUCUN lien externe)

(() => {
  const $ = (sel, root=document) => root.querySelector(sel);

  // ===== Topbar compact =====
  const topbar = $("#topbar");
  if (topbar) {
    const update = () => topbar.classList.toggle("compact", window.scrollY > 10);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  // ===== Reveal =====
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-in"));
  }

  // ===== Audio =====
  const audio = $("#ambience");
  const audioBtn = $("#audioBtn");
  const audioDot = $("#audioDot");

  const setAudioUI = (on) => {
    if (audioDot) audioDot.classList.toggle("on", on);
    if (audioBtn) audioBtn.setAttribute("aria-pressed", String(on));
  };

  const startAudio = async () => {
    if (!audio) return;
    try {
      audio.volume = 0.55;
      await audio.play();
      localStorage.setItem("ar_audio", "on");
      setAudioUI(true);
    } catch {
      localStorage.setItem("ar_audio", "off");
      setAudioUI(false);
    }
  };

  const stopAudio = () => {
    if (!audio) return;
    audio.pause();
    localStorage.setItem("ar_audio", "off");
    setAudioUI(false);
  };

  if (audioBtn && audio) {
    audioBtn.addEventListener("click", () => {
      if (audio.paused) startAudio();
      else stopAudio();
    });

    if (localStorage.getItem("ar_audio") === "on") startAudio();
    else setAudioUI(false);
  }

  // ===== Menu mobile (burger) =====
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  // overlay
  let overlay = $("#menuOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "menuOverlay";
    document.body.appendChild(overlay);
  }

  const openMenu = () => {
    if (!burger || !mobileMenu) return;
    mobileMenu.classList.add("open");
    overlay.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    if (!burger || !mobileMenu) return;
    mobileMenu.classList.remove("open");
    overlay.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };

  if (burger && mobileMenu) {
    burger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (mobileMenu.classList.contains("open")) closeMenu();
      else openMenu();
    });

    overlay.addEventListener("click", closeMenu);

    // clic sur un lien du menu => on ferme (ON NE BLOQUE PAS le lien)
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  // ===== Smooth scroll UNIQUEMENT pour les liens en # (et seulement si la cible existe) =====
  // IMPORTANT: on ne touche JAMAIS aux liens externes (TikTok/Discord/YouTube)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href.startsWith("#") || href.length < 2) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, false);

  // ===== Contact mailto (mets ton mail si tu veux) =====
  const form = $("#contactForm");
  if (form) {
    const TO = "manub44@proton.me";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const msg = String(fd.get("message") || "").trim();

      const subject = encodeURIComponent(`L’Autre Rivage — Message${name ? " de " + name : ""}`);
      const body = encodeURIComponent(`${msg}\n\n---\nNom: ${name || "-"}\nEmail: ${email || "-"}`);

      window.location.href = `mailto:${TO}?subject=${subject}&body=${body}`;
    });
  }
})();