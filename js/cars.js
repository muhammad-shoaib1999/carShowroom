import { getCars } from "./data-service.js";
import { renderCarCards, showStatus } from "./components.js";

const PAGE_SIZE = 6;

function fillSelect(select, values, label) {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
  select.setAttribute("aria-label", label);
}

function readFilters(form) {
  const data = new FormData(form);
  return Object.fromEntries(["keyword", "brand", "minPrice", "maxPrice", "year", "fuelType", "transmission", "condition", "sort"].map((key) => [key, data.get(key)?.toString().trim() || ""]));
}

function filterCars(cars, filters) {
  const keyword = filters.keyword.toLowerCase();
  return cars.filter((car) => {
    const haystack = `${car.brand} ${car.model}`.toLowerCase();
    return (!keyword || haystack.includes(keyword))
      && (!filters.brand || car.brand === filters.brand)
      && (!filters.minPrice || car.price >= Number(filters.minPrice))
      && (!filters.maxPrice || car.price <= Number(filters.maxPrice))
      && (!filters.year || String(car.year) === filters.year)
      && (!filters.fuelType || car.fuelType === filters.fuelType)
      && (!filters.transmission || car.transmission === filters.transmission)
      && (!filters.condition || car.condition === filters.condition);
  });
}

export async function initialize() {
  const form = document.querySelector("#inventory-filters");
  const grid = document.querySelector("#inventory-grid");
  const count = document.querySelector("#result-count");
  const loadMore = document.querySelector("#load-more");
  if (!form || !grid || !count || !loadMore) return;
  let cars;
  try {
    cars = await getCars();
    fillSelect(form.elements.brand, [...new Set(cars.map((car) => car.brand))].sort(), "Filter by brand");
    fillSelect(form.elements.year, [...new Set(cars.map((car) => String(car.year)))].sort((a, b) => Number(b) - Number(a)), "Filter by year");
    fillSelect(form.elements.fuelType, [...new Set(cars.map((car) => car.fuelType))].sort(), "Filter by fuel type");
    fillSelect(form.elements.transmission, [...new Set(cars.map((car) => car.transmission))].sort(), "Filter by transmission");
    fillSelect(form.elements.condition, [...new Set(cars.map((car) => car.condition))].sort(), "Filter by condition");
  } catch (error) {
    console.error("Inventory could not be loaded.", error);
    showStatus(grid, "The vehicle inventory could not be loaded. Please check your connection and try again.", true);
    count.textContent = "Inventory unavailable";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  for (const key of ["keyword", "brand", "minPrice", "maxPrice", "year", "fuelType", "transmission", "condition", "sort"]) {
    const value = params.get(key);
    if (value && form.elements[key]) form.elements[key].value = value;
  }
  let visibleLimit = PAGE_SIZE;

  const render = () => {
    const filters = readFilters(form);
    const min = filters.minPrice ? Number(filters.minPrice) : null;
    const max = filters.maxPrice ? Number(filters.maxPrice) : null;
    const error = form.querySelector("[data-filter-error]");
    if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0)) || (min !== null && max !== null && min > max)) {
      error.textContent = "Enter valid prices; minimum price must not exceed maximum price.";
      return;
    }
    error.textContent = "";
    let results = filterCars(cars, filters);
    if (filters.sort === "price-asc") results.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") results.sort((a, b) => b.price - a.price);
    if (filters.sort === "year-desc") results.sort((a, b) => b.year - a.year);
    if (filters.sort === "newest") results.sort((a, b) => (b.listedAt || "").localeCompare(a.listedAt || ""));
    const nextParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) nextParams.set(key, value);
    history.replaceState(null, "", `${location.pathname}${nextParams.size ? `?${nextParams}` : ""}`);
    const shown = results.slice(0, visibleLimit);
    if (shown.length) renderCarCards(grid, shown);
    else showStatus(grid, "No vehicles match these filters. Try changing or clearing your search.");
    count.textContent = `${results.length} ${results.length === 1 ? "vehicle" : "vehicles"} found`;
    loadMore.hidden = results.length <= visibleLimit;
  };

  form.addEventListener("input", () => { visibleLimit = PAGE_SIZE; render(); });
  form.addEventListener("change", () => { visibleLimit = PAGE_SIZE; render(); });
  form.addEventListener("submit", (event) => { event.preventDefault(); visibleLimit = PAGE_SIZE; render(); });
  form.addEventListener("reset", () => {
    window.setTimeout(() => { visibleLimit = PAGE_SIZE; render(); }, 0);
  });
  loadMore.addEventListener("click", () => { visibleLimit += PAGE_SIZE; render(); });
  render();
}
