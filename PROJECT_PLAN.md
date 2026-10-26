# AutoLux Showroom Project Plan

## Scope and goals

Build a responsive, accessible, frontend-only car showroom using semantic HTML, CSS, vanilla JavaScript modules, and JSON. Inventory and supporting content come from local JSON files; favorites and comparisons persist in the browser. Form submissions are demonstrations and are not sent to a showroom.

## Pages and primary sections

| Page | Purpose and sections |
| --- | --- |
| `index.html` | Hero, inventory search, featured cars, available brands, service values, testimonials, final CTA |
| `cars.html` | Search and combined filters, sorting, result count, cards, load-more |
| `car-details.html` | ID-based vehicle details, image gallery, favorite/compare actions, similar cars |
| `compare.html` | Side-by-side specifications for up to three vehicles |
| `favorites.html` | Persisted favorite vehicle cards |
| `about.html` | Showroom introduction, values, and contact CTA |
| `contact.html` | Configurable showroom information and validated demo contact form |
| `test-drive.html` | JSON-backed vehicle selector and validated demo request form |
| `faq.html` | Accessible FAQ accordion backed by JSON |
| `404.html` | Branded not-found page |

## Shared architecture

- `components/header.html`, `components/footer.html`: loaded into each page by `js/components.js`.
- `js/data-service.js`: cached JSON requests, inventory validation, lookups, and local-storage helpers.
- `js/app.js`: shared component loading and page module dispatch.
- Feature modules: `cars.js`, `car-details.js`, `compare.js`, `favorites.js`, `forms.js`, `faq.js`, `home.js`.
- `js/components.js`: shared navigation, car-card DOM construction, and favorite/compare controls.
- CSS design tokens and shared responsive rules live in `css/variables.css`, `global.css`, `components.css`, and `responsive.css`.

## Data model

Vehicles have unique `id`, `brand`, `model`, `year`, `price`, `currency`, `condition`, `fuelType`, `transmission`, `mileageKm`, `engineCc`, `color`, `status`, `featured`, `listedAt`, `images`, `description`, and `features` fields. Brands, testimonials, and FAQs are separate JSON datasets. Images use descriptive objects with `url` and `alt` fields.

## User journeys and validation

- Home and inventory searches pass filters in the URL; inventory combines keyword, brand, price, year, fuel, transmission, and condition filters.
- Vehicle detail URLs use `car-details.html?id=...`; test-drive links prefill the car ID.
- Favorites and comparisons are stored as ID arrays; invalid storage content is ignored safely. Comparison is capped at three.
- Contact and test-drive forms validate required values and show clear demo-only confirmation. Test-drive dates cannot be in the past.
- Unknown vehicle IDs and failed data loads display explicit error states.

## Responsive and accessibility targets

Mobile-first layouts target 320, 375, 425, 768, 1024, 1440, and 1920px widths. Semantic landmarks, labeled controls, keyboard-operable navigation and FAQ, visible focus, reduced motion, responsive imagery, and page-specific metadata are included. These are implementation targets, not a claim of formal compliance.

## Verification checklist

- [x] Create all ten page entry points and shared component placeholders.
- [x] Add sample JSON datasets and reusable data service.
- [x] Implement inventory, details, favorites, comparison, forms, FAQ, and homepage modules.
- [x] Add shared responsive styles and setup documentation.
- [x] Serve the site over HTTP and verify page loading and responsive layouts at all target viewport widths.
- [ ] Replace demonstration inventory and placeholder showroom contact details with verified business information.

## Verification performed

- All ten HTML pages returned HTTP 200 through a local static server and initialized without browser page errors.
- All seven target viewport widths (320, 375, 425, 768, 1024, 1440, and 1920px) were checked for horizontal overflow on every page; none was detected.
- Browser checks covered home search-to-inventory filtering, inventory filtering and load-more, favorites persistence, three-car comparison limit, valid and invalid vehicle detail IDs, test-drive preselection and past-date rejection, contact/test-drive required fields and phone validation, mobile menu open/Escape close, and FAQ expansion.
- A final console pass across all ten pages reported no browser console errors or uncaught page exceptions.
- All four JSON files parsed successfully; the 12 sample car IDs are unique.

## Folder structure

```text
index.html, cars.html, car-details.html, compare.html, favorites.html
about.html, contact.html, test-drive.html, faq.html, 404.html
components/  css/  js/  data/  assets/images/
```

## Known limitations

This static project has no backend. Contact and test-drive forms do not send or confirm real requests. Sample vehicles and testimonials are demonstration content and must be replaced or verified before production use. The contact fields are configurable placeholders, not real showroom information.
