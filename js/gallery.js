import { getCars } from "./data-service.js";
import { showStatus } from "./components.js";

const FALLBACK_IMAGE = "assets/images/car-placeholder.svg";

function createGalleryItem(photo, index) {
  const article = document.createElement("article");
  article.className = "gallery-item";
  const button = document.createElement("button");
  button.className = "gallery-photo-button";
  button.type = "button";
  button.dataset.photoIndex = String(index);
  button.setAttribute("aria-label", `Enlarge photo of ${photo.year} ${photo.brand} ${photo.model}`);
  const image = document.createElement("img");
  image.src = photo.url || FALLBACK_IMAGE;
  image.alt = photo.alt || `${photo.year} ${photo.brand} ${photo.model}`;
  image.loading = "lazy";
  image.addEventListener("error", () => { image.src = FALLBACK_IMAGE; }, { once: true });
  button.append(image);
  const caption = document.createElement("div");
  caption.className = "gallery-caption";
  const heading = document.createElement("h2");
  heading.textContent = `${photo.year} ${photo.model}`;
  const brand = document.createElement("p");
  brand.textContent = photo.brand;
  caption.append(heading, brand);
  article.append(button, caption);
  return article;
}

export async function initialize() {
  const form = document.querySelector("#gallery-filters");
  const grid = document.querySelector("#gallery-grid");
  const count = document.querySelector("#gallery-count");
  const dialog = document.querySelector("#gallery-dialog");
  const dialogImage = document.querySelector("#gallery-dialog-image");
  const dialogCaption = document.querySelector("#gallery-dialog-caption");
  if (!form || !grid || !count || !dialog || !dialogImage || !dialogCaption) return;

  let photos;
  try {
    const cars = await getCars();
    const brands = [...new Set(cars.map((car) => car.brand))].sort();
    for (const brand of brands) {
      const option = document.createElement("option");
      option.value = brand;
      option.textContent = brand;
      form.elements.brand.append(option);
    }
    photos = cars.flatMap((car) => (car.images.length ? car.images : [{ url: FALLBACK_IMAGE }]).map((image) => ({
      ...image,
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year
    })));
  } catch (error) {
    console.error("Gallery photos could not be loaded.", error);
    showStatus(grid, "Vehicle photos could not be loaded. Please try again or check that the local server is running.", true);
    count.textContent = "Photos unavailable";
    return;
  }

  let visiblePhotos = photos;
  let activeIndex = 0;
  const render = () => {
    const keyword = form.elements.keyword.value.trim().toLowerCase();
    const brand = form.elements.brand.value;
    visiblePhotos = photos.filter((photo) => `${photo.brand} ${photo.model}`.toLowerCase().includes(keyword)
      && (!brand || photo.brand === brand));
    if (visiblePhotos.length) grid.replaceChildren(...visiblePhotos.map(createGalleryItem));
    else showStatus(grid, "No photos match these filters. Try another search or clear the filters.");
    count.textContent = `${visiblePhotos.length} ${visiblePhotos.length === 1 ? "photo" : "photos"}`;
  };

  const showPhoto = (index) => {
    activeIndex = (index + visiblePhotos.length) % visiblePhotos.length;
    const photo = visiblePhotos[activeIndex];
    dialogImage.src = photo.url || FALLBACK_IMAGE;
    dialogImage.alt = photo.alt || `${photo.year} ${photo.brand} ${photo.model}`;
    dialogImage.onerror = () => { dialogImage.src = FALLBACK_IMAGE; };
    dialogCaption.textContent = `${photo.year} ${photo.brand} ${photo.model} · ${activeIndex + 1} of ${visiblePhotos.length}`;
  };

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-photo-index]");
    if (!button) return;
    showPhoto(Number(button.dataset.photoIndex));
    dialog.showModal();
  });
  document.querySelector("#gallery-previous").addEventListener("click", () => showPhoto(activeIndex - 1));
  document.querySelector("#gallery-next").addEventListener("click", () => showPhoto(activeIndex + 1));
  document.querySelector("#gallery-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    dialog.close();
  });
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("reset", () => window.setTimeout(render, 0));
  render();
}