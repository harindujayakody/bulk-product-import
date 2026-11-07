# bulk-product-import

A small browser tool for building WooCommerce product lists in bulk and
exporting them as CSV, ready to import into WooCommerce (used for Fuji
Express / fuji.lk bulk uploads).

Products, categories and history are stored in `localStorage`
(`woocommerce_products`, `woocommerce_history`, `woocommerce_categories`)
— there is no server and no data leaves the browser.

## Setup

```bash
npm install
npm start        # dev server on http://localhost:3000
npm test         # Jest tests (csv.test.js, App.test.js)
npm run build    # production build into build/
```

## Usage

1. Add products (SKU, name, description, price, categories, tags, brand,
   SEO description, focus keyword).
2. Export **WooCommerce CSV** (`woocommerce-products-YYYY-MM-DD.csv`) or the
   categories list. The CSV writer (`src/csv.js`) quotes every field and
   doubles embedded double-quotes, so values containing commas or quotes
   import cleanly.
3. Import the CSV into WooCommerce (Products → Import).

## Stack notes

- Create React App 5 (`react-scripts` 5.0.1) with **React 18.3.1**. CRA 5 is
  unmaintained and does not support React 19, so React is pinned to 18 —
  do not upgrade `react`/`react-dom` past 18 while this app stays on CRA.
  If a React 19 upgrade is ever wanted, the app needs to migrate off CRA
  (e.g. Vite) first.

## License

MIT — see [LICENSE](LICENSE).
