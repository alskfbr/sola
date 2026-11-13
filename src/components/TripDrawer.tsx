import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Trip } from "../types";
import TripCard from "./TripCard";

interface Props {
  trips: Trip[];
  loading: boolean;
  filterLabel: string | null;
  onClearFilter: () => void;
  onOpenTrip: (trip: Trip) => void;
}

/** Snap points as a fraction of the parent height. */
const SNAPS = [0.16, 0.45, 0.85];
const CLICK_THRESHOLD_PX = 5;

export default function TripDrawer({
  trips,
  loading,
  filterLabel,
  onClearFilter,
  onOpenTrip,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startY: number;
    startFraction: number;
    parentHeight: number;
    moved: boolean;
  } | null>(null);
  const [fraction, setFraction] = useState(SNAPS[1]);
  const [dragging, setDragging] = useState(false);

  // Reveal results when a place gets selected on the globe.
  useEffect(() => {
    if (filterLabel) setFraction((f) => Math.max(f, SNAPS[1]));
  }, [filterLabel]);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const parentHeight =
      sheetRef.current?.parentElement?.clientHeight ?? window.innerHeight;
    drag.current = {
      startY: e.clientY,
      startFraction: fraction,
      parentHeight,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    if (Math.abs(dy) > CLICK_THRESHOLD_PX) d.moved = true;
    const next = d.startFraction - dy / d.parentHeight;
    setFraction(Math.min(SNAPS[SNAPS.length - 1], Math.max(SNAPS[0], next)));
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    if (!d.moved) {
      setFraction(d.startFraction <= SNAPS[0] ? SNAPS[1] : SNAPS[0]);
      return;
    }
    setFraction((f) =>
      SNAPS.reduce((best, s) =>
        Math.abs(s - f) < Math.abs(best - f) ? s : best,
      ),
    );
  }

  return (
    <div
      ref={sheetRef}
      className={`drawer${dragging ? " dragging" : ""}`}
      style={{ height: `${fraction * 100}%` }}
    >
      <div
        className="drawer-handle"
        role="slider"
        aria-label="Resize trip list"
        aria-valuemin={SNAPS[0] * 100}
        aria-valuemax={SNAPS[SNAPS.length - 1] * 100}
        aria-valuenow={Math.round(fraction * 100)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="drawer-grip" />
        <div className="drawer-title">
          <strong>My trips</strong>
          <span className="muted small">
            {loading ? "Loading…" : `${trips.length} shown`}
          </span>
        </div>
      </div>

      {filterLabel && (
        <div className="filter-chip-row">
          <span className="filter-chip">
            {filterLabel}
            <button onClick={onClearFilter} aria-label="Clear filter">
              ×
            </button>
          </span>
        </div>
      )}

      <div className="drawer-list">
        {!loading && trips.length === 0 && (
          <p className="muted empty">
            {filterLabel ? `No trips in ${filterLabel} yet.` : "No trips yet."}
          </p>
        )}
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onOpen={onOpenTrip} />
        ))}
      </div>
    </div>
  );
}
