(() => {
  "use strict";

  // Inline "Gérer les cookies" manager for the Mentions légales page.
  // Separate ids from the floating banner (js/main.js) so both can coexist;
  // reads/writes the same localStorage key and mirrors the same GA load/deny behavior.
  const STORAGE_KEY = "pv-cookie-consent";
  const MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;
  const GA_ID = "G-XXXXXXXXXX";

  const toggle = document.getElementById("legalCookieToggle");
  const toggleLabel = document.getElementById("legalCookieToggleLabel");
  const saveBtn = document.getElementById("legalCookieSave");
  const statusEl = document.getElementById("legalCookieStatus");

  if (!toggle || !saveBtn) return;

  let draftEnabled = false;

  function setDraft(enabled) {
    draftEnabled = enabled;
    toggle.setAttribute("aria-checked", String(enabled));
    if (toggleLabel) toggleLabel.textContent = enabled ? "Activée" : "Désactivée";
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function gtagDefault() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }

  function gaLoad() {
    gtagDefault();
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (window.__pvGa || /X{4}/.test(GA_ID)) return;
    window.__pvGa = true;
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    const sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(sc);
  }

  function gaDeny() {
    if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
    const host = location.hostname;
    const root = host.replace(/^www\./, "");
    document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => /^_ga/.test(n)).forEach((n) => {
      ["", "; domain=" + host, "; domain=." + root].forEach((d) => {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  }

  function saveConsent(ok) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: ok, date: Date.now() }));
    } catch (e) {}
    ok ? gaLoad() : gaDeny();
    setStatus(ok ? "Mesure d'audience activée. Vos choix ont été enregistrés." : "Mesure d'audience désactivée. Vos choix ont été enregistrés.");
  }

  toggle.addEventListener("click", () => setDraft(!draftEnabled));
  saveBtn.addEventListener("click", () => saveConsent(draftEnabled));

  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (e) {}

  if (stored && Date.now() - stored.date < MAX_AGE_MS) {
    setDraft(!!stored.analytics);
    setStatus(stored.analytics ? "Mesure d'audience actuellement activée." : "Mesure d'audience actuellement désactivée.");
  } else {
    setDraft(false);
    setStatus("Vous n'avez pas encore fait de choix.");
  }
})();
