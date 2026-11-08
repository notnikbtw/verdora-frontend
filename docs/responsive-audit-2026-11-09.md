# Responsive browser audit — 2026-11-09

Checked the local Vite app in headless Chromium through Playwright.
API responses were intercepted with test fixtures: a signed-in customer,
25 categories, 16 products with long names and discounts, and a three-line cart.
External requests and API writes were blocked. No real orders were created.

## Layout coverage

Checked `/catalog`, `/products/1`, `/cart`, and `/checkout` at widths
360, 390, 640, 768, 900, 1024, 1100, 1280, and 1440 px, with a 900 px viewport
height. All 36 combinations had no document-level horizontal overflow and no
uncaught JavaScript errors.

Screenshots of all four pages at 390 and 1024 px were captured. The mobile cart,
catalog, product page, checkout, tablet checkout, and mobile sidebar were
visually reviewed.

## Interaction checks

- Expanded mobile filters and loaded categories through category 20.
- Opened and closed the mobile navigation sidebar.
- Accepted the terms in Cart and followed Proceed to Checkout successfully.
- Focused and scrolled the email field into view at 390 × 450 px.
- Followed five related-product cards using client-side navigation; exactly
  one main gallery image remained after each transition.

## Changes from the audit

- ProductCarousel places its title and controls on separate rows on phones.
  View all stays on one line, and navigation buttons have 44 px touch targets.
- Removed unused Orders imports and query state that were blocking TypeScript
  compilation in the current working tree.

Targeted ESLint, production build, and git diff whitespace checks passed.

## Limits

This audit used fixed test data, not the deployed backend. It does not establish
real authentication, payment, or order-placement correctness. A reduced
viewport height does not reproduce a native software keyboard. Physical
iPhone/Android devices, Safari, touch gestures, and screen readers still need
separate checks.

## Catalog restoration and active filters follow-up

Browser checks with the same fixtures passed for:

- Restoring page 2, price sorting, list view, and a 918 px mobile scroll position
  after opening a product, reloading that product page, and going Back.
- Restoring desktop pagination and scroll position on Back.
- Showing and independently removing category, minimum price, maximum price,
  discount, and search filter chips; Back restores the previous filters.
- Clearing all filters while retaining sort and view preferences.
- Correcting a URL whose requested page exceeds the filtered result count.
- Supporting the existing `categoryId` and `onSale` URL aliases.
- Keeping chips within the viewport at 360, 390, 768, 1024, and 1440 px,
  including a long search string without spaces.

No uncaught JavaScript errors were recorded during these checks. Scroll
positions are stored per history entry and catalog URL in session storage;
at most 50 entries are retained. Pages in the URL are one-based, while API
requests continue to use zero-based pages.
