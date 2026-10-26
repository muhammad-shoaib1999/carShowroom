import { initializeHeader } from "./components.js";

async function loadComponent(selector, url, label) {
  const target = document.querySelector(selector);
  if (!target) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status}).`);
    const markup = await response.text();
    const template = document.createElement("template");
    template.innerHTML = markup;
    target.replaceWith(template.content);
  } catch (error) {
    console.error(`Unable to load shared ${label}.`, error);
    const message = document.createElement("p");
    message.className = "status-message is-error";
    message.textContent = `The shared ${label} could not be loaded. Please reload the page or check the local server.`;
    target.replaceChildren(message);
  }
}

const pageModules = {
  home: "./home.js",
  cars: "./cars.js",
  details: "./car-details.js",
  favorites: "./favorites.js",
  compare: "./compare.js",
  contact: "./forms.js",
  "test-drive": "./forms.js",
  faq: "./faq.js"
};

async function start() {
  await Promise.all([
    loadComponent("#site-header", "components/header.html", "header"),
    loadComponent("#site-footer", "components/footer.html", "footer")
  ]);
  initializeHeader();
  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
  const modulePath = pageModules[document.body.dataset.page];
  if (modulePath) {
    try {
      const pageModule = await import(modulePath);
      await pageModule.initialize();
    } catch (error) {
      console.error("Page initialization failed.", error);
      const target = document.querySelector("[data-page-content]");
      if (target) {
        const message = document.createElement("p");
        message.className = "status-message is-error";
        message.textContent = "This page could not be loaded. Please try again or check that the local server is running.";
        target.replaceChildren(message);
      }
    }
  }
}

start();
