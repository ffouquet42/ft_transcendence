// Imports des pages SPA
import { renderHome } from "./pages/Home";
import { renderGame } from "./pages/Game";
import { renderChat } from "./pages/Chat";

/* ========== ROUTER ========== */
const routes: Record<string, () => string> = {
  "/": renderHome,
  "/game": renderGame,
  "/chat": renderChat,
};

function renderRoute(path: string, push: boolean = true) {
  const render = routes[path] || renderHome;
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = render();
    if (push) history.pushState({}, "", path);
  }
}

// Interception des liens SPA
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.matches("[data-router]")) {
    e.preventDefault();
    const href = target.getAttribute("href");
    if (href) renderRoute(href);
  }
});

// Navigation back/forward
window.addEventListener("popstate", () => {
  renderRoute(window.location.pathname, false);
});

// Initial route
renderRoute(window.location.pathname, false);

/* ========== DOM READY (SignIn/SignUp logic) ========== */
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtnIn = document.getElementById("toggleSignIn");
  const formIn = document.getElementById("signin-form") as HTMLElement | null;
  const closeBtnIn = document.getElementById("closeSignInForm");

  const toggleBtnUp = document.getElementById("toggleSignUp");
  const formUp = document.getElementById("signup-form") as HTMLElement | null;
  const closeBtnUp = document.getElementById("closeSignUpForm");

  const toggleForm = (form: HTMLElement) => {
    form.classList.toggle("max-h-0");
    form.classList.toggle("opacity-0");
    form.classList.toggle("max-h-[1000px]");
    form.classList.toggle("opacity-100");
  };

  const closeForm = (form: HTMLElement) => {
    form.classList.add("max-h-0", "opacity-0");
    form.classList.remove("max-h-[1000px]", "opacity-100");
  };

  if (toggleBtnIn && formIn) toggleBtnIn.addEventListener("click", () => toggleForm(formIn));
  if (closeBtnIn && formIn) closeBtnIn.addEventListener("click", () => closeForm(formIn));
  if (toggleBtnUp && formUp) toggleBtnUp.addEventListener("click", () => toggleForm(formUp));
  if (closeBtnUp && formUp) closeBtnUp.addEventListener("click", () => closeForm(formUp));
});
