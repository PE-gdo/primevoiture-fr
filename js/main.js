(() => {
  "use strict";

  // --- Nav dropdown ("Aides par véhicule") ---
  const dropdown = document.getElementById("vehiculesDropdown");
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (dropdown && dropdownToggle && dropdownMenu) {
    function openMenu() {
      dropdownMenu.hidden = false;
      dropdownToggle.setAttribute("aria-expanded", "true");
    }
    function closeMenu() {
      dropdownMenu.hidden = true;
      dropdownToggle.setAttribute("aria-expanded", "false");
    }
    dropdown.addEventListener("mouseenter", openMenu);
    dropdown.addEventListener("mouseleave", closeMenu);
    dropdownToggle.addEventListener("click", (e) => {
      if (dropdownMenu.hidden) {
        e.preventDefault();
        openMenu();
      }
    });
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeMenu();
    });
  }

  // --- FAQ accordion (single item open at a time) ---
  // Supports multiple independent accordions per page via [data-accordion].
  document.querySelectorAll(".faq-list, [data-accordion]").forEach((faqList) => {
    faqList.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      const icon = item.querySelector(".faq-icon");
      if (!question || !answer) return;
      question.addEventListener("click", () => {
        const willOpen = answer.hidden;
        faqList.querySelectorAll(".faq-item").forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").hidden = true;
          const otherIcon = other.querySelector(".faq-icon");
          if (otherIcon) otherIcon.textContent = "+";
        });
        if (willOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
          answer.hidden = false;
          if (icon) icon.textContent = "–";
        }
      });
    });
  });

  // --- Cookie consent banner ---
  const STORAGE_KEY = "pv-cookie-consent";
  const MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;
  const GA_ID = "G-4Y4YN1XBNR";

  const banner = document.getElementById("cookieBanner");
  const details = document.getElementById("cookieDetails");
  const acceptBtn = document.getElementById("cookieAccept");
  const refuseBtn = document.getElementById("cookieRefuse");
  const saveDraftBtn = document.getElementById("cookieSaveDraft");
  const customizeBtn = document.getElementById("cookieCustomize");
  const toggleDraft = document.getElementById("cookieToggleDraft");
  const toggleLabel = document.getElementById("cookieToggleLabel");
  const manageCookiesLink = document.getElementById("manageCookiesLink");

  if (!banner) return;

  let draftEnabled = false;

  function setDraft(enabled) {
    draftEnabled = enabled;
    toggleDraft.setAttribute("aria-checked", String(enabled));
    toggleLabel.textContent = enabled ? "Activée" : "Désactivée";
  }

  function showDetails() {
    details.hidden = false;
    saveDraftBtn.hidden = false;
    customizeBtn.hidden = true;
  }

  function openBanner(prefillDraft) {
    setDraft(!!prefillDraft);
    banner.hidden = false;
  }

  function closeBanner() {
    banner.hidden = true;
    details.hidden = true;
    saveDraftBtn.hidden = true;
    customizeBtn.hidden = false;
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
    closeBanner();
    ok ? gaLoad() : gaDeny();
  }

  acceptBtn.addEventListener("click", () => saveConsent(true));
  refuseBtn.addEventListener("click", () => saveConsent(false));
  saveDraftBtn.addEventListener("click", () => saveConsent(draftEnabled));
  customizeBtn.addEventListener("click", showDetails);
  toggleDraft.addEventListener("click", () => setDraft(!draftEnabled));
  manageCookiesLink.addEventListener("click", (e) => {
    e.preventDefault();
    showDetails();
    openBanner(false);
  });

  gtagDefault();
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (e) {}

  if (stored && Date.now() - stored.date < MAX_AGE_MS) {
    if (stored.analytics) gaLoad();
  } else {
    openBanner(false);
  }
})();
