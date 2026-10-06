'use strict';



/**
 * PRELOAD
 * 
 * loading will be end after document is loaded
 */

const preloader = document.querySelector("[data-preload]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * REDUCED MOTION
 *
 * Single source of truth for motion preferences. Everything that moves is
 * gated on this, so the site is still fully usable with motion disabled.
 */

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const prefersReducedMotion = function () {
  return reducedMotionQuery.matches;
}



/**
 * NAVBAR
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);



/**
 * HEADER & BACK TOP BTN
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollPos = 0;

const onScroll = function () {
  const isScrolled = window.scrollY >= 50;

  header.classList.toggle("active", isScrolled);
  backTopBtn.classList.toggle("active", isScrolled);

  // hide the header on downward scroll, but leave it in place under reduced motion
  if (isScrolled && !prefersReducedMotion()) {
    header.classList.toggle("hide", lastScrollPos < window.scrollY);
  } else {
    header.classList.remove("hide");
  }

  lastScrollPos = window.scrollY;
}

window.addEventListener("scroll", onScroll);

// run once so the state is right on first paint — including a restored scroll
// position or a deep link, where no scroll event ever fires
onScroll();



/**
 * HERO SLIDER
 */

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
const heroSliderNextBtn = document.querySelector("[data-next-btn]");

let currentSlidePos = 0;
let lastActiveSliderItem = heroSliderItems[0];

const updateSliderPos = function () {
  lastActiveSliderItem.classList.remove("active");
  heroSliderItems[currentSlidePos].classList.add("active");
  lastActiveSliderItem = heroSliderItems[currentSlidePos];
}

const slideNext = function () {
  if (currentSlidePos >= heroSliderItems.length - 1) {
    currentSlidePos = 0;
  } else {
    currentSlidePos++;
  }

  updateSliderPos();
}

heroSliderNextBtn.addEventListener("click", slideNext);

const slidePrev = function () {
  if (currentSlidePos <= 0) {
    currentSlidePos = heroSliderItems.length - 1;
  } else {
    currentSlidePos--;
  }

  updateSliderPos();
}

heroSliderPrevBtn.addEventListener("click", slidePrev);

/**
 * auto slide
 *
 * Pauses on hover, on keyboard focus within the hero, while the tab is hidden,
 * and via the explicit pause control (WCAG 2.2.2).
 */

const sliderToggleBtn = document.querySelector("[data-slider-toggle]");

const AUTO_SLIDE_DELAY = 7000;

let autoSlideInterval = null;
let isAutoSlidePaused = false;

const startAutoSlide = function () {
  if (prefersReducedMotion() || isAutoSlidePaused || document.hidden || autoSlideInterval) return;

  autoSlideInterval = setInterval(slideNext, AUTO_SLIDE_DELAY);
}

const stopAutoSlide = function () {
  clearInterval(autoSlideInterval);
  autoSlideInterval = null;
}

heroSlider.addEventListener("mouseenter", stopAutoSlide);
heroSlider.addEventListener("mouseleave", startAutoSlide);

heroSlider.addEventListener("focusin", stopAutoSlide);

heroSlider.addEventListener("focusout", function (event) {
  if (!heroSlider.contains(event.relatedTarget)) startAutoSlide();
});

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    stopAutoSlide();
  } else {
    startAutoSlide();
  }
});

if (sliderToggleBtn) {
  sliderToggleBtn.addEventListener("click", function () {
    isAutoSlidePaused = !isAutoSlidePaused;

    this.setAttribute("aria-label", isAutoSlidePaused ? "Play slideshow" : "Pause slideshow");
    this.querySelector("ion-icon").setAttribute("name", isAutoSlidePaused ? "play-outline" : "pause-outline");

    if (isAutoSlidePaused) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  });
}

window.addEventListener("load", startAutoSlide);



/**
 * PARALLAX EFFECT
 */

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

if (parallaxItems.length && !prefersReducedMotion()) {

  let x, y;

  window.addEventListener("mousemove", function (event) {

    x = (event.clientX / window.innerWidth * 10) - 5;
    y = (event.clientY / window.innerHeight * 10) - 5;

    // reverse the number eg. 20 -> -20, -5 -> 5
    x = x - (x * 2);
    y = y - (y * 2);

    for (let i = 0, len = parallaxItems.length; i < len; i++) {
      x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
      y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
      parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    }

  });

}



/**
 * FORMS
 *
 * Netlify Forms submission with inline validation. Without JS the forms still
 * POST natively and fall through to Netlify's default success page.
 */

const todayISO = function () {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}

const isValidPhone = function (value) {
  return /^[+()\-\s\d]{7,20}$/.test(value.trim());
}

const isValidEmail = function (value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

const setFieldError = function (field, message) {
  const errorEl = document.getElementById(field.getAttribute("aria-describedby") || "");

  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }

  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.hidden = !message;
  }
}

const setFormStatus = function (statusEl, message, state) {
  if (!statusEl) return;

  statusEl.textContent = message || "";
  statusEl.classList.toggle("is-success", state === "success");
  statusEl.classList.toggle("is-error", state === "error");
}

const setFormBusy = function (form, isBusy) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  submitBtn.disabled = isBusy;
  submitBtn.setAttribute("aria-busy", String(isBusy));
}

const sendNetlifyForm = function (form) {
  return fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(new FormData(form)).toString(),
  }).then(function (response) {
    if (!response.ok) throw new Error("Request failed with status " + response.status);
    return response;
  });
}



/**
 * RESERVATION FORM
 */

const reservationForm = document.querySelector("[data-reservation-form]");
const reservationStatus = document.querySelector("[data-reservation-status]");

if (reservationForm) {

  const nameField = document.getElementById("res-name");
  const phoneField = document.getElementById("res-phone");
  const dateField = document.getElementById("res-date");

  dateField.min = todayISO();

  const validateReservation = function () {
    let firstInvalid = null;

    if (nameField.value.trim().length < 2) {
      setFieldError(nameField, "Please tell us your name.");
      firstInvalid = firstInvalid || nameField;
    } else {
      setFieldError(nameField, "");
    }

    if (!isValidPhone(phoneField.value)) {
      setFieldError(phoneField, "Enter a phone number we can reach you on.");
      firstInvalid = firstInvalid || phoneField;
    } else {
      setFieldError(phoneField, "");
    }

    if (!dateField.value) {
      setFieldError(dateField, "Choose a date for your visit.");
      firstInvalid = firstInvalid || dateField;
    } else if (dateField.value < todayISO()) {
      setFieldError(dateField, "Please choose today or a future date.");
      firstInvalid = firstInvalid || dateField;
    } else {
      setFieldError(dateField, "");
    }

    return firstInvalid;
  }

  reservationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstInvalid = validateReservation();

    if (firstInvalid) {
      setFormStatus(reservationStatus, "Please check the highlighted fields.", "error");
      firstInvalid.focus();
      return;
    }

    setFormBusy(reservationForm, true);
    setFormStatus(reservationStatus, "", "");

    sendNetlifyForm(reservationForm)
      .then(function () {
        reservationForm.reset();
        setFieldError(nameField, "");
        setFieldError(phoneField, "");
        setFieldError(dateField, "");
        setFormStatus(reservationStatus,
          "Thank you — your request is with the reservation desk. We will confirm by phone shortly.", "success");
      })
      .catch(function () {
        setFormStatus(reservationStatus,
          "Sorry, we could not send that. Please call +88 123 123456 and we will book you in.", "error");
      })
      .finally(function () {
        setFormBusy(reservationForm, false);
      });
  });

}



/**
 * NEWSLETTER FORM
 */

const newsletterForm = document.querySelector("[data-newsletter-form]");
const newsletterStatus = document.querySelector("[data-newsletter-status]");

if (newsletterForm) {

  const emailField = document.getElementById("news-email");

  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!isValidEmail(emailField.value)) {
      setFieldError(emailField, "Enter a valid email address.");
      emailField.focus();
      return;
    }

    setFieldError(emailField, "");
    setFormBusy(newsletterForm, true);
    setFormStatus(newsletterStatus, "", "");

    sendNetlifyForm(newsletterForm)
      .then(function () {
        newsletterForm.reset();
        setFormStatus(newsletterStatus, "You are on the list — cellar notes are on their way.", "success");
      })
      .catch(function () {
        setFormStatus(newsletterStatus, "Sorry, we could not subscribe you. Please try again later.", "error");
      })
      .finally(function () {
        setFormBusy(newsletterForm, false);
      });
  });

}



/**
 * MENU FILTER
 */

const menuFilterBtns = document.querySelectorAll("[data-filter]");
const menuItems = document.querySelectorAll("[data-category]");
const menuStatus = document.querySelector("[data-menu-status]");

const filterMenu = function (activeBtn) {
  const filter = activeBtn.dataset.filter;
  let visibleCount = 0;

  for (let i = 0; i < menuFilterBtns.length; i++) {
    const isActive = menuFilterBtns[i] === activeBtn;
    menuFilterBtns[i].classList.toggle("is-active", isActive);
    menuFilterBtns[i].setAttribute("aria-pressed", String(isActive));
  }

  for (let i = 0; i < menuItems.length; i++) {
    const matches = filter === "all" || menuItems[i].dataset.category === filter;
    menuItems[i].hidden = !matches;
    if (matches) visibleCount++;
  }

  if (menuStatus) {
    menuStatus.textContent = visibleCount + (visibleCount === 1 ? " dish shown" : " dishes shown");
  }
}

if (menuFilterBtns.length) {
  addEventOnElements(menuFilterBtns, "click", function () {
    filterMenu(this);
  });
}



/**
 * GALLERY LIGHTBOX
 */

const lightbox = document.querySelector("[data-lightbox]");
const lightboxCloseBtn = document.querySelector("[data-lightbox-close]");
const lightboxTriggers = document.querySelectorAll("[data-lightbox-src]");

if (lightbox && typeof lightbox.showModal === "function") {

  // scoped to the dialog so the triggers' own data-lightbox-* attributes cannot match
  const lightboxImg = lightbox.querySelector("[data-lightbox-img]");
  const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");

  addEventOnElements(lightboxTriggers, "click", function () {
    lightboxImg.src = this.dataset.lightboxSrc;
    lightboxImg.alt = this.dataset.lightboxAlt || "";
    lightboxCaption.textContent = this.dataset.lightboxCaption || "";
    lightbox.showModal();
  });

  lightboxCloseBtn.addEventListener("click", function () {
    lightbox.close();
  });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) lightbox.close();
  });

}



/**
 * SCROLL REVEAL
 *
 * [data-reveal] elements fade up as they enter the viewport. The hiding class
 * is only added when we can actually animate, so with JS off, reduced motion,
 * or no IntersectionObserver support everything simply stays visible.
 */

const revealItems = document.querySelectorAll("[data-reveal]");

if (revealItems.length && "IntersectionObserver" in window && !prefersReducedMotion()) {

  document.documentElement.classList.add("reveal-ready");

  window.addEventListener("load", function () {
    const revealObserver = new IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add("is-visible");
          revealObserver.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    for (let i = 0; i < revealItems.length; i++) {
      revealObserver.observe(revealItems[i]);
    }
  });

}



/**
 * SCROLL SPY
 *
 * Keeps the active navbar link in sync with the section in view.
 */

const navLinks = document.querySelectorAll(".navbar-link");
const spySections = [];

for (let i = 0; i < navLinks.length; i++) {
  const target = navLinks[i].getAttribute("href");

  if (target && target.charAt(0) === "#") {
    const section = document.querySelector(target);
    if (section) spySections.push({ link: navLinks[i], section: section });
  }
}

if (spySections.length && "IntersectionObserver" in window) {

  const setActiveNavLink = function (activeLink) {
    for (let i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.toggle("active", navLinks[i] === activeLink);
    }
  };

  const spyObserver = new IntersectionObserver(function (entries) {
    for (let i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;

      for (let j = 0; j < spySections.length; j++) {
        if (spySections[j].section === entries[i].target) {
          setActiveNavLink(spySections[j].link);
        }
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });

  for (let i = 0; i < spySections.length; i++) {
    spyObserver.observe(spySections[i].section);
  }

}



/**
 * MOTION PREFERENCE CHANGE
 *
 * React if the visitor flips the OS setting mid-session.
 */

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", function () {
    if (prefersReducedMotion()) {
      stopAutoSlide();
      document.documentElement.classList.remove("reveal-ready");
    } else {
      startAutoSlide();
    }
  });
}