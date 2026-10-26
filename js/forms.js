import { getCarById, getCars } from "./data-service.js";

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showMessage(form, message) {
  const target = form.querySelector("[data-form-message]");
  target.textContent = message;
  target.hidden = false;
  target.focus();
}

function validatePhone(form) {
  const phone = form.elements.phone;
  phone.setCustomValidity("");
  const normalized = phone.value.replace(/[()\s.-]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(normalized)) {
    phone.setCustomValidity("Enter a phone number with 7 to 15 digits and an optional leading +.");
    phone.reportValidity();
    return false;
  }
  return true;
}

async function initContact() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const vehicleId = new URLSearchParams(location.search).get("vehicle");
  if (vehicleId) {
    try {
      const car = await getCarById(vehicleId);
      if (car) form.elements.subject.value = `Question about ${car.year} ${car.brand} ${car.model}`;
    } catch (error) {
      console.error("Vehicle context for the contact form could not be loaded.", error);
    }
  }
  form.elements.phone.addEventListener("input", () => form.elements.phone.setCustomValidity(""));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validatePhone(form)) return;
    if (!form.reportValidity()) return;
    showMessage(form, "Your form passed browser-side validation. This demo does not send messages; please contact the showroom directly.");
    form.reset();
  });
}

async function initTestDrive() {
  const form = document.querySelector("#test-drive-form");
  if (!form) return;
  const select = form.elements.vehicle;
  const status = form.querySelector("[data-vehicle-status]");
  const date = form.elements.date;
  form.elements.phone.addEventListener("input", () => form.elements.phone.setCustomValidity(""));
  date.min = localDateValue();
  try {
    const cars = await getCars();
    for (const car of cars) {
      const option = document.createElement("option");
      option.value = car.id;
      option.textContent = `${car.year} ${car.brand} ${car.model}`;
      select.append(option);
    }
    const vehicle = new URLSearchParams(location.search).get("vehicle");
    if (vehicle && cars.some((car) => car.id === vehicle)) select.value = vehicle;
    status.textContent = "";
  } catch (error) {
    console.error("Vehicle options for test drives could not be loaded.", error);
    select.disabled = true;
    status.textContent = "Vehicle options are unavailable. Please reload and try again.";
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validatePhone(form)) return;
    if (!form.reportValidity()) return;
    if (date.value < localDateValue()) {
      date.setCustomValidity("Choose today or a future date.");
      date.reportValidity();
      date.setCustomValidity("");
      return;
    }
    showMessage(form, "Your request passed browser-side validation. No booking has been sent or confirmed; a showroom representative must confirm an appointment.");
    form.reset();
  });
}

export async function initialize() {
  await initContact();
  await initTestDrive();
}
