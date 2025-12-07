// scripts/index_ui.js - UI handlers for login/signup page

function initPasswordToggle() {
  const togglePassword = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isPwd = passwordInput.type === "password";
      passwordInput.type = isPwd ? "text" : "password";
    });
  }
}

function initFormToggle() {
  const toggleForm = document.getElementById("toggle-form");
  const toggleForm2 = document.getElementById("toggle-form-2");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const signupTexts = document.querySelectorAll(".signup-text");
  const signupBtns = document.querySelectorAll(".signup-btn");
  const backArrow = document.getElementById("back-to-login");

  function toggleForms() {
    const isLogin = loginForm.classList.contains("active");
    const from = isLogin ? loginForm : signupForm;
    const to = isLogin ? signupForm : loginForm;

    from.classList.remove("active");
    from.classList.add("hidden");
    to.classList.remove("hidden");
    to.classList.add("active");

    const show = isLogin ? "none" : "inline";
    signupTexts.forEach((el) => (el.style.display = show));
    signupBtns.forEach((el) => (el.style.display = show));
  }

  if (toggleForm) toggleForm.addEventListener("click", toggleForms);
  if (toggleForm2) toggleForm2.addEventListener("click", toggleForms);

  if (backArrow) {
    backArrow.addEventListener("click", () => {
      signupForm.classList.remove("active");
      signupForm.classList.add("hidden");

      loginForm.classList.remove("hidden");
      loginForm.classList.add("active");

      signupTexts.forEach((el) => (el.style.display = "inline"));
      signupBtns.forEach((el) => (el.style.display = "inline"));
    });
  }
}

function initIntroAnimation() {
  window.addEventListener("load", () => {
    const intro = document.getElementById("intro-screen");
    const flyingLogo = intro?.querySelector("img");
    const headerLogo = document.querySelector(".join-logo");

    if (!intro || !flyingLogo || !headerLogo) {
      document.body.classList.add("loaded");
      return;
    }

    const isMobile = window.matchMedia("(max-width: 480px)").matches;

    if (isMobile) {
      flyingLogo.src = "img/logo/join_logo_white.svg";
      flyingLogo.style.width = "150px";
      flyingLogo.style.transition = "opacity 0.3s ease";
      flyingLogo.style.opacity = "0";
      setTimeout(() => (flyingLogo.style.opacity = "1"), 30);

      setTimeout(() => {
        flyingLogo.style.opacity = "0";
        setTimeout(() => {
          intro.style.backgroundColor = "white";
          flyingLogo.src = "img/logo/Logo for Favicon construction.svg";
          flyingLogo.style.opacity = "1";
          startFlyAnimation();
        }, 200);
      }, 300);
    } else {
      startFlyAnimation();
    }

    function startFlyAnimation() {
      const holdMs = 150,
        flyMs = 1200,
        easing = "cubic-bezier(0.7,0,0.3,1)";
      intro.style.opacity = "1";
      setTimeout(() => {
        const s = flyingLogo.getBoundingClientRect(),
          e = headerLogo.getBoundingClientRect();
        const dx = e.left + e.width / 2 - (s.left + s.width / 2);
        const dy = e.top + e.height / 2 - (s.top + s.height / 2);
        const scale = (e.width || 110) / s.width;
        flyingLogo.style.transformOrigin = "center";
        flyingLogo.animate(
          [
            { transform: "translate(0,0) scale(1)" },
            { transform: `translate(${dx}px,${dy}px) scale(${scale})` },
          ],
          { duration: flyMs, easing, fill: "forwards" }
        ).onfinish = () => {
          document.body.classList.add("loaded");
          intro.style.opacity = "0";
          setTimeout(() => intro.remove(), 800);
        };
      }, holdMs);
    }
  });
}

// Initialize all UI handlers on load
document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initFormToggle();
});

initIntroAnimation();
