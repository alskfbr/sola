import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshPhongMaterial } from "three";
import type { GeoFeature } from "../services/geoService";
import type { HighlightStatus } from "../utils/trip";

interface Props {
  features: GeoFeature[];
  highlights: Map<string, HighlightStatus>;
  selectedId: string | null;
  onSelect: (feature: GeoFeature | null) => void;
}

const COLORS = {
  visited: "rgba(245, 158, 11, 0.9)",
  planned: "rgba(34, 211, 238, 0.85)",
  selected: "rgba(244, 63, 94, 0.95)",
  land: "rgba(148, 163, 184, 0.35)",
  hover: "rgba(226, 232, 240, 0.6)",
  side: "rgba(15, 23, 42, 0.6)",
  stroke: "rgba(15, 23, 42, 0.8)",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export default function WorldGlobe({
  features,
  highlights,
  selectedId,
  onSelect,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const material = useMemo(
    () => new MeshPhongMaterial({ color: "#0b2545", shininess: 8 }),
    [],
  );

  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (controls) {
      controls.autoRotate = !selectedId;
      controls.autoRotateSpeed = 0.35;
    }
  }, [selectedId, size.width]);

  const capColor = (obj: object) => {
    const { id } = (obj as GeoFeature).properties;
    if (id === selectedId) return COLORS.selected;
    const status = highlights.get(id);
    if (status) return COLORS[status];
    return id === hoverId ? COLORS.hover : COLORS.land;
  };

  const altitude = (obj: object) => {
    const { id } = (obj as GeoFeature).properties;
    if (id === selectedId) return 0.04;
    if (id === hoverId) return 0.025;
    return highlights.has(id) ? 0.015 : 0.006;
  };

  const label = (obj: object) => {
    const { id, name } = (obj as GeoFeature).properties;
    const status = highlights.get(id);
    return `<div class="globe-label"><strong>${escapeHtml(name)}</strong>${
      status
        ? `<span>${status === "visited" ? "Visited" : "Planned"}</span>`
        : ""
    }</div>`;
  };

  return (
    <div ref={containerRef} className="globe-container">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          onGlobeReady={() =>
            globeRef.current?.pointOfView({ lat: 25, lng: 70, altitude: 2.2 })
          }
          globeMaterial={material}
          showAtmosphere
          atmosphereColor="#38bdf8"
          atmosphereAltitude={0.18}
          polygonsData={features}
          polygonCapColor={capColor}
          polygonSideColor={() => COLORS.side}
          polygonStrokeColor={() => COLORS.stroke}
          polygonAltitude={altitude}
          polygonLabel={label}
          polygonsTransitionDuration={250}
          onPolygonHover={(obj) =>
            setHoverId(obj ? (obj as GeoFeature).properties.id : null)
          }
          onPolygonClick={(obj, _event, { lat, lng }) => {
            const feature = obj as GeoFeature;
            const isSame = feature.properties.id === selectedId;
            onSelect(isSame ? null : feature);
            if (!isSame) {
              globeRef.current?.pointOfView(
                {
                  lat,
                  lng,
                  altitude: feature.properties.level === "region" ? 0.9 : 1.6,
                },
                800,
              );
            }
          }}
          onGlobeClick={() => onSelect(null)}
        />
      )}
    </div>
  );
}
