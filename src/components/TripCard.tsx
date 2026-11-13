import type { Trip } from "../types";
import {
  formatDateRange,
  getRelativeDateLabel,
  getTripCountries,
  getTripStatus,
  getTripTitle,
} from "../utils/trip";

interface Props {
  trip: Trip;
  onOpen: (trip: Trip) => void;
}

export default function TripCard({ trip, onOpen }: Props) {
  const status = getTripStatus(trip);
  const range = formatDateRange(trip);

  return (
    <button className="trip-card" onClick={() => onOpen(trip)}>
      <div className="trip-card-head">
        <h3>{getTripTitle(trip)}</h3>
        <span className={`badge badge-${status}`}>{status}</span>
      </div>
      <p className="trip-card-dates">{range ?? "No dates yet"}</p>
      <p className="muted small">
        {getRelativeDateLabel(trip)} · {trip.days.length} days ·{" "}
        {getTripCountries(trip).join(", ")}
      </p>
    </button>
  );
}
