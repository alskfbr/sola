# Sola — Product Requirements

Travel itinerary planner (similar to Wanderlog). This file is the source of truth for product scope.
Update it when requirements change.

## 1. Pages & flows

| Route            | Access    | Purpose                                                       |
| ---------------- | --------- | ------------------------------------------------------------- |
| `/`              | Public    | Landing page (introduction + features) with login popup modal |
| `/app`           | Protected | Dashboard: 3D globe + draggable trip list                     |
| `/trips/:tripId` | Protected | Itinerary page for one trip                                   |

- Unauthenticated access to a protected route redirects to `/?login=1&next=<path>`, which opens the login modal.
  After login the user is sent to `next` (must be a same-origin relative path) or `/app`.
- Logout returns to `/`.

## 2. Authentication

- Login via email + password in a **modal** (not a separate page). Closes on Esc / backdrop / ×.
- Shows an inline error for invalid credentials.
- Session persists across reloads until it expires (mock: 7 days, stored in `localStorage`).
- Mock account: `demo@sola.travel` / `sola123`.

## 3. Dashboard (`/app`)

### 3.1 3D world globe

- Interactive, rotatable 3D globe (`react-globe.gl`). Auto-rotates when nothing is selected.
- **Two view modes** (toggle):
  - **Countries** — Natural Earth admin-0 polygons.
  - **States / Provinces** — admin-1 polygons. Boundaries are loaded for every country that has a trip;
    clicking any other country loads its provinces on demand. Countries without admin-1 data stay as country polygons.
- **Highlighting**
  - `visited` (amber) — place appears in at least one **completed** trip.
  - `planned` (cyan) — place appears only in draft / upcoming / ongoing trips.
  - `visited` wins over `planned`. Selected place is shown in red.
- **Click** a polygon → filter the trip list to trips containing that country (country mode) or
  province/state (province mode). Click it again or click the ocean to clear the filter.

### 3.2 Trip list (draggable bottom sheet)

- Sits below/over the globe; drag the handle to resize (snap points ≈ 16% / 45% / 85%); tapping the handle toggles.
- Expands automatically when a place is selected; shows a removable filter chip.
- Each trip card shows:
  - **Title** — `trip.title`, or if missing, the destination province/state names (fallback: country names).
  - **Date range** — e.g. "Mar 5 – 14, 2026", or "No dates yet".
  - **Relative date** — e.g. "Starts in 3 weeks", "Day 2 of 10", "Ended 8 months ago".
  - **Status badge** — `draft` (no start/end date), `upcoming`, `ongoing`, `completed`.
- Sort: ongoing → upcoming (soonest) → draft → completed (most recent).
- Clicking a card navigates to `/trips/:tripId`.

## 4. Itinerary page (`/trips/:tripId`)

- Header: title, status, date range, relative date, destination chips (region, country).
- Day-by-day list: day number, calendar date (derived from `startDate`, omitted for drafts), region, title, items.
- Items: optional time, title, optional description, category icon (sightseeing, food, transport, lodging, activity, note).

## 5. Data model (see `src/types/index.ts`)

- `Trip` → `destinations: TripDestination[]` (a trip **can span multiple countries**) and `days: ItineraryDay[]`.
- Country codes: ISO 3166-1 alpha-3 (`LKA`). Region codes: ISO 3166-2 (`LK-2`), matching geoBoundaries `shapeISO`.
- Dates are `YYYY-MM-DD` strings, parsed as local dates. `endDate` is inclusive.
- `TripStatus` is **derived** from dates, never stored.

## 6. Mock data (no backend yet)

- 1 user (`demo@sola.travel`).
- **Sri Lanka Highlights** — 10 days, 2026-03-05 → 2026-03-14 (completed), Western/Central/North Central/Uva/Southern provinces.
- **Uzbekistan** — 10 days, **no title and no dates** (draft) — exercises title fallback and draft status.
  Regions: Tashkent, Samarqand, Qashqadaryo, Bukhara, Xorazm.

## 7. Backend integration plan

- All data access goes through the interfaces in `src/services/authService.ts` and `src/services/tripService.ts`.
- `src/services/index.ts` is the single switch point: replace `mockAuthService` / `mockTripService`
  with HTTP implementations exposing the same interface. UI code must not import from `services/mock/*`.
- Suggested REST mapping:
  - `POST /auth/login` → `AuthSession`, `POST /auth/logout`, `GET /auth/session`
  - `GET /trips`, `GET /trips/:id`, `POST /trips`, `PATCH /trips/:id`, `DELETE /trips/:id`
- Real backend must hash passwords server-side and should prefer httpOnly cookies over `localStorage` tokens.

## 8. Geo data

- `public/data/countries.geojson` — Natural Earth 1:110m admin-0 (use `ADM0_A3` as the ISO3 code; `ISO_A3` is `-99` for some countries).
- `public/data/admin1/{ISO3}.geojson` — geoBoundaries gbOpen ADM1 simplified (bundled: `LKA`, `UZB`).
  Other countries are fetched at runtime from the geoBoundaries API.
- geoBoundaries polygons use RFC 7946 winding; they are rewound to d3/three-globe winding in `geoService.ts`.

## 9. Future / out of scope (not yet built)

- Sign-up, password reset, social login.
- Create / edit / delete trips in the UI (service methods already exist).
- Maps per day, places search, budgeting, collaboration/sharing.
