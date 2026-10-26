import { getFaqs } from "./data-service.js";
import { showStatus } from "./components.js";

export async function initialize() {
  const target = document.querySelector("#faq-list");
  if (!target) return;
  try {
    const faqs = await getFaqs();
    if (!faqs.length) {
      showStatus(target, "Frequently asked questions will be added soon.");
      return;
    }
    const fragment = document.createDocumentFragment();
    faqs.forEach((faq, index) => {
      const item = document.createElement("section");
      item.className = "faq-item";
      const button = document.createElement("button");
      const answerId = `faq-answer-${index + 1}`;
      button.className = "faq-question";
      button.type = "button";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", answerId);
      const question = document.createElement("span");
      question.textContent = faq.question;
      const indicator = document.createElement("span");
      indicator.setAttribute("aria-hidden", "true");
      indicator.textContent = "+";
      button.append(question, indicator);
      const answer = document.createElement("div");
      answer.className = "faq-answer";
      answer.id = answerId;
      answer.hidden = true;
      answer.textContent = faq.answer;
      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        indicator.textContent = expanded ? "+" : "−";
        answer.hidden = expanded;
      });
      item.append(button, answer);
      fragment.append(item);
    });
    target.replaceChildren(fragment);
  } catch (error) {
    console.error("FAQ content could not be loaded.", error);
    showStatus(target, "Frequently asked questions could not be loaded. Please try again later.", true);
  }
}
