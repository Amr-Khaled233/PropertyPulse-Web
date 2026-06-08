# Your property dataset goes here

Put your file in this folder as **one** of:

- `properties.json` — an array of objects (recommended), or `{ "properties": [...] }`
- `properties.csv` — a header row followed by data rows

Then, from the repo root, run:

```bash
# add to the existing data
npm run import:properties --workspace @propertypulse/server

# OR wipe the old seed/imported rows first, then load yours
npm run import:properties --workspace @propertypulse/server -- --replace
```

## What the importer does

- Keeps **only Cairo & Giza** properties (Cairo, New Cairo, Maadi, Heliopolis,
  Nasr City, Giza, 6th of October, Sheikh Zayed, Dokki, Mohandessin, …).
- Maps flexible column names — any of these work (case-insensitive):
  - title: `title` / `name` / `listing`
  - type: `type` / `property_type` / `category` (apartment, villa, townhouse, commercial, land, house)
  - status: `status` / `purpose` (for_sale, for_rent, …)
  - price: `price` / `amount` / `value`  **(required)**
  - area: `area_sqm` / `area` / `size` / `sqm`  **(required)**
  - bedrooms: `bedrooms` / `beds` / `rooms`
  - bathrooms: `bathrooms` / `baths`
  - city: `city` / `governorate` / `region` / `area`
  - address: `address` / `location` / `compound` / `neighborhood`
  - lat/lng, images (`image` / `photos`, separated by `,` `;` or `|`), description
- Currency defaults to **EGP**, country to **Egypt**, `source = user-dataset`.

After it runs, the web app (with `VITE_USE_MOCK=false`) shows this data and the
AI generates reports from it. No SQL or chat upload needed.
