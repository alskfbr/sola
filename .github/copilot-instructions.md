# Copilot instructions — Sola

Travel itinerary planner (Wanderlog-like). **Read [docs/REQUIREMENTS.md](../docs/REQUIREMENTS.md) for product scope before making changes**, and keep it updated when requirements change.

## Stack

- React 18 + TypeScript (strict) + Vite 6, React Router v6.
- 3D globe: `react-globe.gl` (three.js). `three` must stay on the same version range as `globe.gl` requires (currently `^0.187`) — duplicate three instances crash the renderer.
- Plain CSS in `src/index.css` (CSS variables, no UI framework).
- Node 20. Commands: `npm run dev`, `npm run build`, `npm run typecheck`.
- Dev shell on this machine is Git Bash on Windows: use `npx.cmd` / `node.exe` if `npx`/`node` complain about TTY.

## Structure

```
src/
  types/            Domain types (Trip, TripDestination, ItineraryDay, User, AuthSession)
  services/         Service interfaces + index.ts (single switch point mock → real API)
    mock/           Mock implementations and seed data (only imported by services/index.ts)
    geoService.ts   Loads country + province GeoJSON, normalises to GeoFeature
  context/          AuthContext (useAuth)
  components/       WorldGlobe, TripDrawer, TripCard, LoginModal, AppHeader, ProtectedRoute
  pages/            LandingPage, DashboardPage, ItineraryPage
  utils/trip.ts     Pure helpers: status, title fallback, date formatting, sorting, highlight map
public/data/        countries.geojson, admin1/{ISO3}.geojson
```

## Conventions

- UI talks to data only via `authService` / `tripService` from `src/services`. Never import `services/mock/*` from UI.
- Keep services async and returning plain domain types so a fetch-based implementation can drop in.
- Derived values (status, display title, relative dates) live in `utils/trip.ts` — don't store them on `Trip`.
- Country codes are ISO 3166-1 alpha-3; region codes are ISO 3166-2. Dates are `YYYY-MM-DD` parsed as local dates.
- Escape any data interpolated into HTML strings (e.g. globe tooltips).
- Validate redirect targets (`next` param) as same-origin relative paths.
- Function components + hooks only; no class components. No new dependencies without a clear need.
