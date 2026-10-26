import { comparisonIds, favoriteIds, formatPrice, writeIdList } from "./data-service.js";

export function showStatus(target, message, isError = false) {
  target.replaceChildren();
  const box = document.createElement("p");
  box.className = `status-message${isError ? " is-error" : ""}`;
  box.textContent = message;
  target.append(box);
}

function detailsUrl(car) {
  return `car-details.html?id=${encodeURIComponent(car.id)}`;
}

function makeFavoriteButton(car) {
  const button = document.createElement("button");
  const update = () => {
    const active = favoriteIds().includes(car.id);
    button.className = "favorite-button";
    button.type = "button";
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? `Remove ${car.brand} ${car.model} from favorites` : `Save ${car.brand} ${car.model} to favorites`);
    button.textContent = active ? "♥" : "♡";
  };
  update();
  button.addEventListener("click", () => {
    const ids = favoriteIds();
    const next = ids.includes(car.id) ? ids.filter((id) => id !== car.id) : [...ids, car.id];
    if (!writeIdList("autolux-favorites", next)) {
      button.setAttribute("aria-label", "Could not update favorites");
      return;
    }
    update();
    document.dispatchEvent(new CustomEvent("autolux:favorites-changed"));
  });
  return button;
}

function makeCompareButton(car) {
  const button = document.createElement("button");
  button.className = "button button-secondary button-small";
  button.type = "button";
  const update = () => {
    const ids = comparisonIds();
    button.textContent = ids.includes(car.id) ? "Added to compare" : "Compare";
    button.setAttribute("aria-pressed", String(ids.includes(car.id)));
  };
  update();
  button.addEventListener("click", () => {
    const ids = comparisonIds();
    let next;
    if (ids.includes(car.id)) next = ids.filter((id) => id !== car.id);
    else if (ids.length >= 3) {
      button.textContent = "Compare up to 3 cars";
      return;
    } else next = [...ids, car.id];
    if (!writeIdList("autolux-comparison", next)) return;
    update();
  });
  return button;
}

export function createCarCard(car) {
  const article = document.createElement("article");
  article.className = "car-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "car-card-image-wrap";
  const imageLink = document.createElement("a");
  imageLink.className = "car-card-image-link";
  imageLink.href = detailsUrl(car);
  imageLink.setAttribute("aria-label", `View ${car.year} ${car.brand} ${car.model} details`);
  const image = document.createElement("img");
  image.className = "car-card-image";
  image.src = car.images[0]?.url || "assets/images/car-placeholder.svg";
  image.alt = car.images[0]?.alt || `${car.year} ${car.brand} ${car.model}`;
  image.loading = "lazy";
  image.addEventListener("error", () => { image.src = "assets/images/car-placeholder.svg"; }, { once: true });
  imageLink.append(image);
  imageWrap.append(imageLink);

  const body = document.createElement("div");
  body.className = "car-card-body";
  const topline = document.createElement("div");
  topline.className = "car-card-topline";
  const brand = document.createElement("span");
  brand.textContent = car.brand;
  const status = document.createElement("span");
  status.className = "badge";
  status.textContent = car.status;
  topline.append(brand, status);
  const heading = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = detailsUrl(car);
  titleLink.textContent = `${car.year} ${car.model}`;
  heading.append(titleLink);
  const price = document.createElement("p");
  price.className = "car-price";
  price.textContent = formatPrice(car.price, car.currency);
  const specs = document.createElement("div");
  specs.className = "car-specs";
  [car.condition, `${Number(car.mileageKm).toLocaleString("en-PK")} km`, car.fuelType, car.transmission].forEach((item) => {
    const spec = document.createElement("span");
    spec.textContent = item;
    specs.append(spec);
  });
  const actions = document.createElement("div");
  actions.className = "car-card-actions";
  const view = document.createElement("a");
  view.className = "button button-small";
  view.href = detailsUrl(car);
  view.textContent = "View details";
  const actionGroup = document.createElement("div");
  actionGroup.className = "filter-actions";
  actionGroup.append(makeCompareButton(car), makeFavoriteButton(car));
  actions.append(view, actionGroup);
  body.append(topline, heading, price, specs, actions);
  article.append(imageWrap, body);
  return article;
}

export function renderCarCards(target, cars) {
  target.replaceChildren(...cars.map(createCarCard));
}

export function initializeHeader() {
  const nav = document.querySelector(".primary-nav");
  const toggle = document.querySelector(".menu-toggle");
  const page = document.body.dataset.page;
  const navPage = page === "details" ? "cars" : page;
  const active = document.querySelector(`[data-nav="${navPage}"]`);
  active?.setAttribute("aria-current", "page");

  if (!nav || !toggle) return;
  const close = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      toggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) close();
  });
}
