import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";

export type GeoLevel = "country" | "region";

export interface GeoProps {
  /** ISO 3166-1 alpha-3 for countries, ISO 3166-2 for regions */
  id: string;
  name: string;
  level: GeoLevel;
  countryCode: string;
}

export type GeoFeature = Feature<Polygon | MultiPolygon, GeoProps>;

interface NaturalEarthProps {
  ADM0_A3: string;
  ADMIN: string;
}

interface GeoBoundariesProps {
  shapeName: string;
  shapeISO?: string;
}

const BASE = import.meta.env.BASE_URL;
const GEOBOUNDARIES_API = "https://www.geoboundaries.org/api/current/gbOpen";

let countriesPromise: Promise<GeoFeature[]> | null = null;
const admin1Promises = new Map<string, Promise<GeoFeature[] | null>>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  // Throws on Vite's SPA HTML fallback for missing files, which callers treat as "not found".
  return (await res.json()) as T;
}

/** Natural Earth 1:110m countries, bundled in /public/data. */
export function loadCountries(): Promise<GeoFeature[]> {
  countriesPromise ??= fetchJson<
    FeatureCollection<Polygon | MultiPolygon, NaturalEarthProps>
  >(`${BASE}data/countries.geojson`)
    .then((fc) =>
      fc.features.map((f) => ({
        ...f,
        properties: {
          id: f.properties.ADM0_A3,
          name: f.properties.ADMIN,
          level: "country" as const,
          countryCode: f.properties.ADM0_A3,
        },
      })),
    )
    .catch((err) => {
      countriesPromise = null;
      throw err;
    });
  return countriesPromise;
}

type Ring = Position[];

/** Planar shoelace; positive means clockwise in lng/lat space. */
function isClockwise(ring: Ring): boolean {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += (ring[i + 1][0] - ring[i][0]) * (ring[i + 1][1] + ring[i][1]);
  }
  return sum > 0;
}

/** three-globe follows d3: clockwise exterior rings, counter-clockwise holes (opposite of RFC 7946). */
function rewindPolygon(rings: Ring[]): Ring[] {
  return rings.map((ring, i) =>
    isClockwise(ring) === (i === 0) ? ring : [...ring].reverse(),
  );
}

function rewind(geometry: Polygon | MultiPolygon): Polygon | MultiPolygon {
  return geometry.type === "Polygon"
    ? { ...geometry, coordinates: rewindPolygon(geometry.coordinates) }
    : { ...geometry, coordinates: geometry.coordinates.map(rewindPolygon) };
}

function toRawGithubUrl(url: string): string {
  return url.replace(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/raw\/(.+)$/,
    "https://raw.githubusercontent.com/$1/$2/$3",
  );
}

async function fetchAdmin1Collection(iso3: string) {
  type Collection = FeatureCollection<
    Polygon | MultiPolygon,
    GeoBoundariesProps
  >;
  try {
    return await fetchJson<Collection>(`${BASE}data/admin1/${iso3}.geojson`);
  } catch {
    const meta = await fetchJson<{ simplifiedGeometryGeoJSON: string }>(
      `${GEOBOUNDARIES_API}/${iso3}/ADM1/`,
    );
    return fetchJson<Collection>(
      toRawGithubUrl(meta.simplifiedGeometryGeoJSON),
    );
  }
}

/**
 * Province/state (ADM1) boundaries for one country.
 * Uses the bundled file when present, otherwise the geoBoundaries API. Resolves null if unavailable.
 */
export function loadAdmin1(iso3: string): Promise<GeoFeature[] | null> {
  if (!/^[A-Z]{3}$/.test(iso3)) return Promise.resolve(null);
  let promise = admin1Promises.get(iso3);
  if (!promise) {
    promise = fetchAdmin1Collection(iso3)
      .then((fc) =>
        fc.features
          .filter(
            (f) =>
              f.geometry?.type === "Polygon" ||
              f.geometry?.type === "MultiPolygon",
          )
          .map((f) => ({
            ...f,
            geometry: rewind(f.geometry),
            properties: {
              id: f.properties.shapeISO || `${iso3}-${f.properties.shapeName}`,
              name: f.properties.shapeName,
              level: "region" as const,
              countryCode: iso3,
            },
          })),
      )
      .catch(() => null);
    admin1Promises.set(iso3, promise);
  }
  return promise;
}
