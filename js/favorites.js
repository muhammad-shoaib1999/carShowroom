import { favoriteIds, getCars, writeIdList } from "./data-service.js";
import { renderCarCards, showStatus } from "./components.js";

export async function initialize() {
  const target = document.querySelector("#favorite-cars");
  if (!target) return;
  const render = async () => {
    try {
      const cars = await getCars();
      const ids = favoriteIds();
      const saved = cars.filter((car) => ids.includes(car.id));
      const validIds = new Set(cars.map((car) => car.id));
      const cleaned = ids.filter((id) => validIds.has(id));
      if (cleaned.length !== ids.length) writeIdList("autolux-favorites", cleaned);
      if (saved.length) renderCarCards(target, saved);
      else showStatus(target, "You have no saved vehicles yet. Browse the inventory and tap the heart to save a car.");
    } catch (error) {
      console.error("Favorites could not be loaded.", error);
      showStatus(target, "Your favorites could not be loaded. Please try again later.", true);
    }
  };
  await render();
  document.addEventListener("autolux:favorites-changed", render);
}
