import { comparisonIds, formatPrice, getCars, writeIdList } from "./data-service.js";
import { showStatus } from "./components.js";

const fields = [
  ["Price", (car) => formatPrice(car.price, car.currency)],
  ["Year", (car) => car.year],
  ["Condition", (car) => car.condition],
  ["Mileage", (car) => `${Number(car.mileageKm).toLocaleString("en-PK")} km`],
  ["Fuel", (car) => car.fuelType],
  ["Transmission", (car) => car.transmission],
  ["Engine", (car) => `${car.engineCc} cc`],
  ["Color", (car) => car.color],
  ["Availability", (car) => car.status]
];

export async function initialize() {
  const target = document.querySelector("#comparison-content");
  if (!target) return;
  try {
    const cars = await getCars();
    const render = () => {
      const ids = comparisonIds();
      const selected = ids.map((id) => cars.find((car) => car.id === id)).filter(Boolean).slice(0, 3);
      if (selected.length !== ids.length) writeIdList("autolux-comparison", selected.map((car) => car.id));
      if (!selected.length) {
        showStatus(target, "Your comparison is empty. Browse available cars and select Compare on up to three vehicles.");
        const browse = document.createElement("a");
        browse.className = "button";
        browse.href = "cars.html";
        browse.textContent = "Browse cars";
        target.append(browse);
        return;
      }
      const wrap = document.createElement("div");
      wrap.className = "compare-wrap";
      const table = document.createElement("table");
      table.className = "compare-table";
      const head = document.createElement("thead");
      const headRow = document.createElement("tr");
      const blank = document.createElement("th");
      blank.scope = "col";
      blank.textContent = "Vehicle";
      headRow.append(blank);
      selected.forEach((car) => {
        const cell = document.createElement("th");
        cell.scope = "col";
        const img = document.createElement("img");
        img.className = "compare-image";
        img.src = car.images[0]?.url || "assets/images/car-placeholder.svg";
        img.alt = car.images[0]?.alt || `${car.year} ${car.brand} ${car.model}`;
        img.addEventListener("error", () => { img.src = "assets/images/car-placeholder.svg"; }, { once: true });
        const link = document.createElement("a");
        link.href = `car-details.html?id=${encodeURIComponent(car.id)}`;
        link.textContent = `${car.year} ${car.brand} ${car.model}`;
        const remove = document.createElement("button");
        remove.className = "button button-quiet button-small";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
          writeIdList("autolux-comparison", comparisonIds().filter((id) => id !== car.id));
          render();
        });
        cell.append(img, document.createElement("br"), link, document.createElement("br"), remove);
        headRow.append(cell);
      });
      head.append(headRow);
      table.append(head);
      const body = document.createElement("tbody");
      fields.forEach(([label, getValue]) => {
        const row = document.createElement("tr");
        const title = document.createElement("th");
        title.scope = "row";
        title.textContent = label;
        row.append(title);
        selected.forEach((car) => {
          const value = document.createElement("td");
          value.textContent = String(getValue(car));
          row.append(value);
        });
        body.append(row);
      });
      table.append(body);
      wrap.append(table);
      const actions = document.createElement("div");
      actions.className = "form-actions";
      const clear = document.createElement("button");
      clear.className = "button button-secondary";
      clear.type = "button";
      clear.textContent = "Clear comparison";
      clear.addEventListener("click", () => {
        writeIdList("autolux-comparison", []);
        render();
      });
      actions.append(clear);
      target.replaceChildren(wrap, actions);
    };
    render();
  } catch (error) {
    console.error("Comparison data could not be loaded.", error);
    showStatus(target, "Vehicle comparison could not be loaded. Please try again later.", true);
  }
}
