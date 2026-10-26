import { getCars, getBrands, getTestimonials } from "./data-service.js";
import { renderCarCards, showStatus } from "./components.js";

function populateBrandSelect(select, brands) {
  for (const brand of brands) {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    select.append(option);
  }
}

function renderBrands(target, brands) {
  target.replaceChildren();
  for (const brand of brands) {
    const link = document.createElement("a");
    link.className = "brand-tile";
    link.href = `cars.html?brand=${encodeURIComponent(brand)}`;
    link.textContent = brand;
    target.append(link);
  }
}

function renderTestimonials(target, testimonials) {
  target.replaceChildren();
  for (const item of testimonials.slice(0, 3)) {
    const article = document.createElement("article");
    article.className = "testimonial-card";
    const quote = document.createElement("blockquote");
    quote.textContent = `“${item.text}”`;
    const name = document.createElement("div");
    name.className = "testimonial-name";
    name.textContent = item.name;
    const meta = document.createElement("div");
    meta.className = "testimonial-meta";
    meta.textContent = `${"★".repeat(Math.max(0, Math.min(5, Number(item.rating) || 0)))} · Demonstration content${item.vehicle ? ` · ${item.vehicle}` : ""}`;
    article.append(quote, name, meta);
    target.append(article);
  }
}

export async function initialize() {
  const featured = document.querySelector("#featured-cars");
  const brandsTarget = document.querySelector("#popular-brands");
  const testimonialsTarget = document.querySelector("#testimonials");
  const searchForm = document.querySelector("#home-search");
  if (!featured || !brandsTarget || !testimonialsTarget || !searchForm) return;
  try {
    const [cars, brands, testimonials] = await Promise.all([getCars(), getBrands(), getTestimonials()]);
    const featuredCars = cars.filter((car) => car.featured === true).slice(0, 4);
    if (featuredCars.length) renderCarCards(featured, featuredCars);
    else showStatus(featured, "There are no featured vehicles at the moment.");
    const inventoryBrands = [...new Set(cars.map((car) => car.brand))];
    const availableBrands = brands.filter((brand) => inventoryBrands.includes(brand));
    renderBrands(brandsTarget, availableBrands);
    populateBrandSelect(searchForm.elements.brand, availableBrands);
    if (testimonials.length) renderTestimonials(testimonialsTarget, testimonials);
    else showStatus(testimonialsTarget, "Customer testimonials will appear here when available.");
  } catch (error) {
    console.error("Homepage data could not be loaded.", error);
    showStatus(featured, "Featured vehicles could not be loaded. Please try again later.", true);
    showStatus(brandsTarget, "Available brands could not be loaded.", true);
    showStatus(testimonialsTarget, "Testimonials could not be loaded.", true);
  }
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(searchForm);
    const min = data.get("minPrice")?.toString().trim() || "";
    const max = data.get("maxPrice")?.toString().trim() || "";
    if ((min && Number(min) < 0) || (max && Number(max) < 0) || (min && max && Number(min) > Number(max))) {
      searchForm.querySelector("[data-search-error]").textContent = "Enter valid prices, with minimum no greater than maximum.";
      return;
    }
    const params = new URLSearchParams();
    for (const key of ["keyword", "brand", "minPrice", "maxPrice"]) {
      const value = data.get(key)?.toString().trim();
      if (value) params.set(key, value);
    }
    window.location.href = `cars.html${params.size ? `?${params.toString()}` : ""}`;
  });
  searchForm.addEventListener("reset", () => {
    const error = searchForm.querySelector("[data-search-error]");
    if (error) error.textContent = "";
  });
}
