import { comparisonIds, favoriteIds, formatPrice, getCarById, getCars, writeIdList } from "./data-service.js";
import { renderCarCards, showStatus } from "./components.js";

function setActionState(button, pressed, activeText, inactiveText) {
  button.setAttribute("aria-pressed", String(pressed));
  button.textContent = pressed ? activeText : inactiveText;
}

function renderDetails(target, car) {
  const layout = document.createElement("div");
  layout.className = "detail-layout";
  const gallery = document.createElement("div");
  const main = document.createElement("div");
  main.className = "gallery-main";
  const mainImage = document.createElement("img");
  mainImage.src = car.images[0]?.url || "assets/images/car-placeholder.svg";
  mainImage.alt = car.images[0]?.alt || `${car.year} ${car.brand} ${car.model}`;
  mainImage.addEventListener("error", () => { mainImage.src = "assets/images/car-placeholder.svg"; }, { once: true });
  main.append(mainImage);
  gallery.append(main);
  const thumbs = document.createElement("div");
  thumbs.className = "gallery-thumbs";
  car.images.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-thumb";
    button.setAttribute("aria-label", `Show image ${index + 1}`);
    button.setAttribute("aria-pressed", String(index === 0));
    const image = document.createElement("img");
    image.src = item.url;
    image.alt = "";
    image.addEventListener("error", () => { image.src = "assets/images/car-placeholder.svg"; }, { once: true });
    button.append(image);
    button.addEventListener("click", () => {
      mainImage.src = item.url;
      mainImage.alt = item.alt || `${car.year} ${car.brand} ${car.model}`;
      thumbs.querySelectorAll("button").forEach((thumb) => thumb.setAttribute("aria-pressed", String(thumb === button)));
    });
    thumbs.append(button);
  });
  gallery.append(thumbs);

  const panel = document.createElement("section");
  panel.className = "detail-panel";
  const status = document.createElement("span");
  status.className = "badge";
  status.textContent = `${car.condition} · ${car.status}`;
  const heading = document.createElement("h1");
  heading.textContent = `${car.year} ${car.brand} ${car.model}`;
  const price = document.createElement("p");
  price.className = "detail-price";
  price.textContent = formatPrice(car.price, car.currency);
  const description = document.createElement("p");
  description.textContent = car.description;
  const specs = document.createElement("dl");
  specs.className = "spec-list";
  const values = [["Mileage", `${Number(car.mileageKm).toLocaleString("en-PK")} km`], ["Fuel", car.fuelType], ["Transmission", car.transmission], ["Engine", `${car.engineCc} cc`], ["Color", car.color], ["Year", String(car.year)]];
  values.forEach(([label, value]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    wrapper.append(term, detail);
    specs.append(wrapper);
  });
  const actions = document.createElement("div");
  actions.className = "form-actions";
  const favorite = document.createElement("button");
  favorite.className = "button button-secondary";
  favorite.type = "button";
  const updateFavorite = () => setActionState(favorite, favoriteIds().includes(car.id), "Saved to favorites", "Add to favorites");
  updateFavorite();
  favorite.addEventListener("click", () => {
    const ids = favoriteIds();
    const next = ids.includes(car.id) ? ids.filter((id) => id !== car.id) : [...ids, car.id];
    if (writeIdList("autolux-favorites", next)) updateFavorite();
  });
  const compare = document.createElement("button");
  compare.className = "button button-secondary";
  compare.type = "button";
  const updateCompare = () => setActionState(compare, comparisonIds().includes(car.id), "Added to compare", "Add to compare");
  updateCompare();
  compare.addEventListener("click", () => {
    const ids = comparisonIds();
    const next = ids.includes(car.id) ? ids.filter((id) => id !== car.id) : ids.length < 3 ? [...ids, car.id] : null;
    if (!next) {
      compare.textContent = "Compare is limited to 3 cars";
      return;
    }
    if (writeIdList("autolux-comparison", next)) updateCompare();
  });
  const contact = document.createElement("a");
  contact.className = "button";
  contact.href = `contact.html?vehicle=${encodeURIComponent(car.id)}`;
  contact.textContent = "Ask about this car";
  const testDrive = document.createElement("a");
  testDrive.className = "button button-secondary";
  testDrive.href = `test-drive.html?vehicle=${encodeURIComponent(car.id)}`;
  testDrive.textContent = "Request a test drive";
  actions.append(favorite, compare, contact, testDrive);
  const featureTitle = document.createElement("h2");
  featureTitle.textContent = "Features";
  const featureList = document.createElement("ul");
  featureList.className = "feature-list";
  car.features.forEach((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    featureList.append(item);
  });
  panel.append(status, heading, price, description, specs, actions, featureTitle, featureList);
  layout.append(gallery, panel);
  target.replaceChildren(layout);
}

export async function initialize() {
  const target = document.querySelector("#vehicle-details");
  const similarTarget = document.querySelector("#similar-cars");
  const id = new URLSearchParams(location.search).get("id");
  if (!target) return;
  if (!id) {
    showStatus(target, "No vehicle was selected. Browse the inventory to choose a car.", true);
    return;
  }
  try {
    const car = await getCarById(id);
    if (!car) {
      showStatus(target, "We could not find that vehicle. It may have been removed or the link may be invalid.", true);
      return;
    }
    document.title = `${car.year} ${car.brand} ${car.model} | AutoLux`;
    renderDetails(target, car);
    if (similarTarget) {
      const allCars = await getCars();
      const similar = allCars.filter((item) => item.id !== car.id && item.brand === car.brand).slice(0, 3);
      if (similar.length) renderCarCards(similarTarget, similar);
      else similarTarget.closest("#similar-cars-section").hidden = true;
    }
  } catch (error) {
    console.error("Vehicle details could not be loaded.", error);
    showStatus(target, "Vehicle details could not be loaded. Please try again later.", true);
  }
}
