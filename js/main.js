/* ==========================================================================
   AarchiZone — interaction layer
   No dependencies. Everything is an enhancement over working HTML.
   ========================================================================== */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Header ---------- */
  const header = doc.querySelector("[data-header]");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll progress ---------- */
  const progress = doc.querySelector(".scroll-progress span");
  if (progress) {
    let ticking = false;
    const update = () => {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progress.style.transform = `scaleX(${p})`;
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------- Active nav ---------- */
  const page = body.dataset.page;
  doc.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
  });

  /* ---------- Mobile menu ---------- */
  const toggle = doc.querySelector("[data-menu-toggle]");
  const menu = doc.querySelector("[data-menu]");
  if (toggle && menu) {
    const focusables = () =>
      Array.from(menu.querySelectorAll('a[href], button:not([disabled])')).filter(
        (el) => el.offsetParent !== null
      );
    let lastFocus = null;

    const openMenu = () => {
      lastFocus = doc.activeElement;
      menu.classList.add("is-open");
      menu.removeAttribute("inert");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      body.classList.add("menu-open");
      const first = focusables()[0];
      if (first) window.setTimeout(() => first.focus(), 120);
    };

    const closeMenu = (returnFocus = true) => {
      menu.classList.remove("is-open");
      menu.setAttribute("inert", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      body.classList.remove("menu-open");
      if (returnFocus && lastFocus) lastFocus.focus();
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu(false));
    });

    doc.addEventListener("keydown", (e) => {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    menu.setAttribute("inert", "");
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980 && menu.classList.contains("is-open")) {
        closeMenu(false);
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealItems = doc.querySelectorAll("[data-reveal]");
  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((el) => el.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      revealItems.forEach((el) => observer.observe(el));
    }
  }

  /* ---------- Plan drawing ---------- */
  const plan = doc.querySelector("[data-plan]");
  if (plan) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      plan.classList.add("is-visible");
    } else {
      const planObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              plan.classList.add("is-visible");
              planObserver.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      planObserver.observe(plan);
    }
  }

  /* ---------- Hero pointer parallax ---------- */
  const hero = doc.querySelector("[data-hero]");
  const heroImg = doc.querySelector("[data-hero-img]");
  if (hero && heroImg && finePointer && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroImg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(
        2
      )}px, 0) scale(1.045)`;
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * -18;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    hero.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- Cursor label on project cards ---------- */
  const cursor = doc.querySelector("[data-cursor]");
  if (cursor && finePointer && !reduceMotion) {
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    let active = false;
    let raf = null;

    const moveCursor = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${
        active ? 1 : 0.6
      })`;
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) {
        raf = requestAnimationFrame(moveCursor);
      } else {
        raf = null;
      }
    };

    doc.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(moveCursor);
      },
      { passive: true }
    );

    doc.querySelectorAll("[data-cursor-target]").forEach((card) => {
      card.addEventListener("pointerenter", () => {
        active = true;
        cursor.classList.add("is-active");
        if (!raf) raf = requestAnimationFrame(moveCursor);
      });
      card.addEventListener("pointerleave", () => {
        active = false;
        cursor.classList.remove("is-active");
        if (!raf) raf = requestAnimationFrame(moveCursor);
      });
    });
  }

  /* ---------- Project dialogs ---------- */
  const projects = {
    tanishq: {
      title: "Tanishq Showroom",
      category: "Retail",
      location: "Gurugram, Haryana",
      image: "assets/img/project-tanishq.webp",
      alt: "Tanishq showroom facade with a textured stone portal and illuminated brand signage.",
      body: "A retail facade designed as a threshold. A deep, textured stone portal, a precise metal frame and warm integrated lighting let the jewellery do the talking. The intervention is quiet at street level and confident above it.",
      scope: "Facade design · Retail identity · Lighting coordination",
      typology: "Retail",
      status: "Built",
    },
    phs: {
      title: "PHS Business Centre",
      category: "Commercial",
      location: "Gurugram, Haryana",
      image: "assets/img/project-phs.webp",
      alt: "PHS Business Centre, a five-storey commercial building with glass balconies and dark louvre cladding.",
      body: "A five-storey commercial building organised around one idea: give every floor a shaded edge. Deep balconies, dark louvre panels and clear glazing keep the facade calm while the interiors stay open to light.",
      scope: "Architecture · Facade · Common areas",
      typology: "Commercial",
      status: "Built",
    },
    apartments: {
      title: "Residential Apartments",
      category: "Residential",
      location: "Gurugram, Haryana",
      image: "assets/img/project-apartments.webp",
      alt: "Five-storey residential building with orange louvre panels, white bays and recessed balconies.",
      body: "A residential block that breaks its mass with white bays, timber-toned louvres and recessed balconies. The rhythm gives each home a private edge without losing the collective face of the building.",
      scope: "Architecture · Facade",
      typology: "Residential",
      status: "Built",
    },
    residence: {
      title: "Private Residence",
      category: "Residential",
      location: "Gurugram, Haryana",
      image: "assets/img/project-residence.webp",
      alt: "Contemporary residence at dusk with stacked planted balconies and floor-to-ceiling glazing.",
      body: "A contemporary home planned around stacked, planted balconies. Full-height glazing, warm timber soffits and a dark stone base give the house a strong horizontal grain and a soft evening presence.",
      scope: "Architecture · Interiors",
      typology: "Residential",
      status: "Built",
    },
  };

  const dialog = doc.querySelector("[data-project-dialog]");
  if (dialog && typeof dialog.showModal === "function") {
    const dTitle = dialog.querySelector("[data-dialog-title]");
    const dCategory = dialog.querySelector("[data-dialog-category]");
    const dImage = dialog.querySelector("[data-dialog-image]");
    const dBody = dialog.querySelector("[data-dialog-body]");
    const dScope = dialog.querySelector("[data-dialog-scope]");
    const dTypology = dialog.querySelector("[data-dialog-typology]");
    const dLocation = dialog.querySelector("[data-dialog-location]");
    const dStatus = dialog.querySelector("[data-dialog-status]");
    const closeBtn = dialog.querySelector("[data-dialog-close]");
    let trigger = null;

    const openProject = (key, el) => {
      const p = projects[key];
      if (!p) return;
      trigger = el;
      dTitle.textContent = p.title;
      dCategory.textContent = `${p.category} — ${p.location}`;
      dImage.src = p.image;
      dImage.alt = p.alt;
      dBody.textContent = p.body;
      dScope.textContent = p.scope;
      dTypology.textContent = p.typology;
      dLocation.textContent = p.location;
      dStatus.textContent = p.status;
      body.classList.add("menu-open");
      dialog.showModal();
      closeBtn.focus();
    };

    doc.querySelectorAll("[data-project]").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        openProject(card.dataset.project, card);
      });
    });

    const closeDialog = () => {
      dialog.close();
    };

    closeBtn.addEventListener("click", closeDialog);
    dialog.addEventListener("close", () => {
      body.classList.remove("menu-open");
      if (trigger) trigger.focus();
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) closeDialog();
    });
  }

  /* ---------- Project filters ---------- */
  const filterBtns = doc.querySelectorAll("[data-filter]");
  const projectCards = doc.querySelectorAll("[data-category]");
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        projectCards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.hidden = !show;
        });
      });
    });
  }

  /* ---------- Contact form ---------- */
  const form = doc.querySelector("[data-contact-form]");
  if (form) {
    const status = doc.querySelector("[data-form-status]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const type = String(data.get("type") || "General enquiry").trim();
      const location = String(data.get("location") || "").trim();
      const message = String(data.get("message") || "").trim();

      const subject = `Project enquiry — ${type}${name ? ` — ${name}` : ""}`;
      const lines = [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        `Project type: ${type}`,
        location ? `Location: ${location}` : null,
        "",
        message,
      ].filter(Boolean);
      const href = `mailto:aarchizone80@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(lines.join("\n"))}`;

      window.location.href = href;
      if (status) {
        status.textContent =
          "Your email app should open with the enquiry ready to send. If it does not, write to aarchizone80@gmail.com or call +91 98182 38524.";
        status.classList.add("is-visible");
      }
    });
  }

  /* ---------- Local time ---------- */
  const clocks = doc.querySelectorAll("[data-time]");
  if (clocks.length) {
    const updateTime = () => {
      const time = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
      clocks.forEach((el) => {
        el.textContent = `${time} IST`;
      });
    };
    updateTime();
    window.setInterval(updateTime, 60000);
  }

  /* ---------- Current year ---------- */
  doc.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Native details: close siblings (optional, quiet) ---------- */
  doc.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      const parent = item.closest(".faq");
      if (!parent) return;
      parent.querySelectorAll(".faq-item[open]").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Prevent internal placeholder links from jumping ---------- */
  doc.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener("click", (e) => e.preventDefault());
  });
})();
