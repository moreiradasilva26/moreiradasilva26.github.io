(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wash = document.querySelector(".page-wash");

  if (!reduceMotion && wash) {
    requestAnimationFrame(() => wash.classList.add("is-entering"));
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-navigation");
  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    };
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    document.body.classList.add("has-motion");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -22px 0px" });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  }

  const countElements = [...document.querySelectorAll("[data-count-to]")];
  const formatCount = (element, value) => {
    const formatted = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(value);
    const suffix = element.dataset.countSuffix || "";
    return `${formatted}${suffix === " Jahre" && value === 1 ? " Jahr" : suffix}`;
  };
  if (countElements.length && !reduceMotion && "IntersectionObserver" in window) {
    const animationFrames = new WeakMap();
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        const target = Number(element.dataset.countTo);
        if (!Number.isFinite(target) || target < 0) return;
        if (!entry.isIntersecting) {
          const frame = animationFrames.get(element);
          if (frame !== undefined) cancelAnimationFrame(frame);
          animationFrames.delete(element);
          element.textContent = formatCount(element, 0);
          return;
        }

        let startTime = null;
        const duration = target <= 10 ? 2100 : 1300;
        const animate = (timestamp) => {
          if (!element.isConnected) {
            animationFrames.delete(element);
            return;
          }
          if (startTime === null) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const eased = target <= 10 ? progress : 1 - Math.pow(1 - progress, 3);
          element.textContent = formatCount(element, Math.round(target * eased));
          if (progress < 1) {
            animationFrames.set(element, requestAnimationFrame(animate));
          } else {
            element.textContent = formatCount(element, target);
            animationFrames.delete(element);
          }
        };
        animationFrames.set(element, requestAnimationFrame(animate));
      });
    }, { threshold: 0.3 });
    countElements.forEach((element) => {
      element.textContent = formatCount(element, 0);
      counterObserver.observe(element);
    });
  }

  if (!reduceMotion && wash) {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.hash) return;
      event.preventDefault();
      wash.classList.remove("is-entering");
      wash.classList.add("is-exiting");
      window.setTimeout(() => window.location.assign(destination.href), 190);
    });
  }

  const form = document.getElementById("lead-form");
  const feedback = document.getElementById("form-feedback");
  if (form && feedback) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      feedback.textContent = "Danke – die Angaben wurden nicht versendet oder gespeichert. Bitte richten Sie vor dem Livegang einen Empfänger und einen sicheren Übermittlungsweg ein.";
      feedback.classList.add("is-feedback");
    });
  }
})();
