import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import TripDrawer from "../components/TripDrawer";
import WorldGlobe from "../components/WorldGlobe";
import { tripService } from "../services";
import {
  loadAdmin1,
  loadCountries,
  type GeoFeature,
  type GeoLevel,
} from "../services/geoService";
import type { Trip } from "../types";
import { getHighlightMap, sortTrips, tripMatchesPlace } from "../utils/trip";

type Selection = GeoFeature["properties"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<GeoLevel>("country");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [countries, setCountries] = useState<GeoFeature[]>([]);
  const [admin1, setAdmin1] = useState<Record<string, GeoFeature[]>>({});
  const [admin1Loading, setAdmin1Loading] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripService
      .listTrips()
      .then(setTrips)
      .catch(() => setError("Could not load your trips."))
      .finally(() => setTripsLoading(false));
    loadCountries()
      .then(setCountries)
      .catch(() => setError("Could not load map data."));
  }, []);

  const ensureAdmin1 = useCallback(async (codes: string[]) => {
    if (codes.length === 0) return;
    setAdmin1Loading(true);
    const results = await Promise.all(
      codes.map(async (c) => [c, await loadAdmin1(c)] as const),
    );
    setAdmin1((prev) => {
      const next = { ...prev };
      for (const [code, features] of results)
        if (features) next[code] = features;
      return next;
    });
    setAdmin1Loading(false);
  }, []);

  // In province mode, pre-load boundaries for every country that has a trip.
  useEffect(() => {
    if (mode !== "region") return;
    const codes = [
      ...new Set(
        trips.flatMap((t) => t.destinations.map((d) => d.countryCode)),
      ),
    ];
    ensureAdmin1(codes);
  }, [mode, trips, ensureAdmin1]);

  const features = useMemo(() => {
    if (mode === "country") return countries;
    return [
      ...countries.filter((c) => !admin1[c.properties.id]),
      ...Object.values(admin1).flat(),
    ];
  }, [mode, countries, admin1]);

  const highlights = useMemo(() => getHighlightMap(trips), [trips]);

  const visibleTrips = useMemo(() => {
    const filtered = selection
      ? trips.filter((t) => tripMatchesPlace(t, selection.level, selection.id))
      : trips;
    return sortTrips(filtered);
  }, [trips, selection]);

  const handleSelect = useCallback(
    (feature: GeoFeature | null) => {
      setSelection(feature?.properties ?? null);
      // Clicking a country in province mode loads its provinces on demand.
      if (
        feature &&
        mode === "region" &&
        feature.properties.level === "country"
      ) {
        ensureAdmin1([feature.properties.id]);
      }
    },
    [mode, ensureAdmin1],
  );

  function switchMode(next: GeoLevel) {
    setMode(next);
    setSelection(null);
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="dashboard">
        <WorldGlobe
          features={features}
          highlights={highlights}
          selectedId={selection?.id ?? null}
          onSelect={handleSelect}
        />

        <div className="globe-toolbar">
          <div className="segmented" role="group" aria-label="Map level">
            <button
              className={mode === "country" ? "active" : ""}
              onClick={() => switchMode("country")}
            >
              Countries
            </button>
            <button
              className={mode === "region" ? "active" : ""}
              onClick={() => switchMode("region")}
            >
              States / Provinces
            </button>
          </div>
          {admin1Loading && (
            <span className="muted small">Loading provinces…</span>
          )}
        </div>

        <div className="legend">
          <span>
            <i className="dot dot-visited" /> Visited
          </span>
          <span>
            <i className="dot dot-planned" /> Planned
          </span>
        </div>

        {error && <div className="toast-error">{error}</div>}

        <TripDrawer
          trips={visibleTrips}
          loading={tripsLoading}
          filterLabel={selection?.name ?? null}
          onClearFilter={() => setSelection(null)}
          onOpenTrip={(trip) =>
            navigate(`/trips/${encodeURIComponent(trip.id)}`)
          }
        />
      </main>
    </div>
  );
}
