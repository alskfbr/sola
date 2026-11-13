import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { tripService } from "../services";
import type { ItineraryCategory, Trip } from "../types";
import {
  formatDateRange,
  formatDayDate,
  getRelativeDateLabel,
  getTripStatus,
  getTripTitle,
} from "../utils/trip";

const CATEGORY_ICON: Record<ItineraryCategory, string> = {
  sightseeing: "📍",
  food: "🍽️",
  transport: "🚆",
  lodging: "🛏️",
  activity: "🥾",
  note: "📝",
};

export default function ItineraryPage() {
  const { tripId = "" } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );

  useEffect(() => {
    setState("loading");
    tripService
      .getTrip(tripId)
      .then((t) => {
        setTrip(t);
        setState(t ? "ready" : "missing");
      })
      .catch(() => setState("error"));
  }, [tripId]);

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="itinerary">
        <Link to="/app" className="back-link">
          ← Back to globe
        </Link>

        {state === "loading" && <p className="muted">Loading itinerary…</p>}
        {state === "missing" && <p>Trip not found.</p>}
        {state === "error" && (
          <p className="form-error">Could not load this trip.</p>
        )}

        {state === "ready" && trip && (
          <>
            <header className="itinerary-header">
              <div className="trip-card-head">
                <h1>{getTripTitle(trip)}</h1>
                <span className={`badge badge-${getTripStatus(trip)}`}>
                  {getTripStatus(trip)}
                </span>
              </div>
              <p className="lead">{formatDateRange(trip) ?? "Dates not set"}</p>
              <p className="muted">{getRelativeDateLabel(trip)}</p>
              <div className="chips">
                {trip.destinations.map((d) => (
                  <span
                    key={`${d.countryCode}-${d.regionCode ?? ""}`}
                    className="chip"
                  >
                    {d.regionName ? `${d.regionName}, ` : ""}
                    {d.countryName}
                  </span>
                ))}
              </div>
            </header>

            <ol className="days">
              {trip.days.map((day) => {
                const region = trip.destinations.find(
                  (d) => d.regionCode === day.regionCode,
                );
                return (
                  <li key={day.dayNumber} className="day">
                    <div className="day-head">
                      <span className="day-number">Day {day.dayNumber}</span>
                      {formatDayDate(trip, day.dayNumber) && (
                        <span className="muted small">
                          {formatDayDate(trip, day.dayNumber)}
                        </span>
                      )}
                      {region?.regionName && (
                        <span className="chip small">{region.regionName}</span>
                      )}
                    </div>
                    {day.title && <h3>{day.title}</h3>}
                    <ul className="items">
                      {day.items.map((item) => (
                        <li key={item.id} className="item">
                          <span className="item-icon" aria-hidden>
                            {CATEGORY_ICON[item.category]}
                          </span>
                          <span className="item-time">{item.time ?? ""}</span>
                          <div>
                            <div>{item.title}</div>
                            {item.description && (
                              <div className="muted small">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>
    </div>
  );
}
