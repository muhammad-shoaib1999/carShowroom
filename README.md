# AutoLux Car Showroom

Responsive, frontend-only car showroom built with HTML, CSS, vanilla JavaScript modules, and JSON.

## Run locally

This project uses `fetch()` for shared HTML components and JSON data, so do not open the pages using `file://`.

1. Open the project folder in VS Code.
2. Start the folder with the VS Code Live Server extension (or another static HTTP server).
3. Open the served `index.html`.

No build step or package installation is required. Modern browsers with ES module and Fetch API support are required.

## Features

- Eleven connected pages with a shared responsive header and footer.
- Search, multi-filter, sort, load-more, and URL-based inventory filtering.
- JSON-backed sample inventory, featured cars, brands, testimonials, and FAQs.
- Vehicle details and gallery, favorites, and comparison for up to three cars.
- Inventory-backed vehicle photo gallery with brand and keyword filters.
- Validated contact and test-drive demo forms.
- Accessible mobile navigation, keyboard-operable FAQ, focus styles, and reduced-motion support.

## Verification

The pages and primary flows were checked in a browser through a local static server. All ten pages returned successfully, no horizontal overflow was detected at 320, 375, 425, 768, 1024, 1440, or 1920px, and no browser console errors or uncaught page exceptions occurred during the final pass. Search, filtering, load-more, favorites, the three-car comparison limit, detail IDs, test-drive and contact validation, the mobile menu, and FAQ expansion were exercised.

## Project structure

```text
components/  Shared header and footer HTML
css/         Design tokens and responsive shared styles
data/        Demo cars, brands, FAQs, and testimonials
js/          Shared services and page-specific ES modules
assets/      Local project assets
*.html       Eleven page entry points
PROJECT_PLAN.md
```

## Data and configuration

Update `data/cars.json`, `brands.json`, `faqs.json`, and `testimonials.json` with verified content. Vehicle images may be remote URLs. Do not present demonstration testimonials as genuine reviews. Replace the clearly marked showroom contact placeholders in `components/footer.html` and `contact.html` only with authorized business details.

## Limitations

There is no backend or booking system. Form confirmations only indicate that browser-side validation succeeded; no message or booking is sent or confirmed. Favorites and comparisons are stored in this browser's local storage.
