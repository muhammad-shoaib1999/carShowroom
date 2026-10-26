const cache = new Map();
const CARS_URL = "data/cars.json";

async function loadJson(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path).then(async (response) => {
      if (!response.ok) throw new Error(`Could not load ${path} (${response.status}).`);
      return response.json();
    }));
  }
  return cache.get(path);
}

function validateCars(data) {
  if (!Array.isArray(data)) throw new Error("The vehicle data must be a JSON array.");
  const ids = new Set();
  for (const car of data) {
    const required = ["id", "brand", "model", "year", "price", "condition", "fuelType", "transmission", "status", "images"];
    if (!car || required.some((key) => car[key] === undefined || car[key] === null || car[key] === "")) {
      throw new Error("A vehicle record is missing one or more required fields.");
    }
    if (ids.has(car.id)) throw new Error(`Duplicate vehicle ID found: ${car.id}.`);
    ids.add(car.id);
    if (!Array.isArray(car.images) || !Array.isArray(car.features)) throw new Error(`Vehicle ${car.id} has invalid image or feature data.`);
  }
  return data;
}

export async function getCars() {
  return validateCars(await loadJson(CARS_URL));
}

export async function getCarById(id) {
  const cars = await getCars();
  return cars.find((car) => car.id === id) ?? null;
}

export async function getBrands() {
  const brands = await loadJson("data/brands.json");
  if (!Array.isArray(brands) || brands.some((brand) => typeof brand !== "string")) throw new Error("Brand data is invalid.");
  return brands;
}

export async function getTestimonials() {
  const data = await loadJson("data/testimonials.json");
  if (!Array.isArray(data)) throw new Error("Testimonial data must be a JSON array.");
  return data;
}

export async function getFaqs() {
  const data = await loadJson("data/faqs.json");
  if (!Array.isArray(data)) throw new Error("FAQ data must be a JSON array.");
  return data;
}

export function formatPrice(price, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function readIdList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) return [];
    return [...new Set(value)];
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return [];
  }
}

export function writeIdList(key, values) {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set(values)]));
    return true;
  } catch (error) {
    console.error(`Could not save ${key} in local storage.`, error);
    return false;
  }
}

export const favoriteIds = () => readIdList("autolux-favorites");
export const comparisonIds = () => readIdList("autolux-comparison");
