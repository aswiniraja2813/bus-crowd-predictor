import { useEffect, useState } from "react";
import useRouteStops from "./useRouteStops";
import { API } from "./config";

const levelNames = { 1: "Low", 2: "Medium", 3: "High" };
const levelClasses = { 1: "low", 2: "medium", 3: "high" };
const advice = {
  1: "Seats should be easy to find.",
  2: "You may have to stand.",
  3: "Likely packed. An earlier or later bus may be easier.",
};

const days = [
  { value: "0", label: "Mon" },
  { value: "1", label: "Tue" },
  { value: "2", label: "Wed" },
  { value: "3", label: "Thu" },
  { value: "4", label: "Fri" },
  { value: "5", label: "Sat" },
  { value: "6", label: "Sun" },
];

function formatHour(h) {
  const n = Number(h);
  const suffix = n >= 12 ? "PM" : "AM";
  const twelve = n % 12 === 0 ? 12 : n % 12;
  return `${twelve}:00 ${suffix}`;
}

function Predictform({ routes, stops }) {
  const [routeId, setRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [day, setDay] = useState("0");
  const [hour, setHour] = useState("8");
  const [prediction, setPrediction] = useState(null);

  const ready = routeId !== "" && stopId !== "";
  const [error, setError] = useState(false);

  const routeStops = useRouteStops(routeId);

  useEffect(() => {
    if (!ready) {
      setPrediction(null);
      setError(false);
      return;
    }

    let ignore = false;
    setError(false);

    fetch(
      `${API}/predict?route=${routeId}&stop=${stopId}&day=${day}&hour=${hour}`
    )
      .then((res) => {
      if (!res.ok) throw new Error("Bad response");
      return res.json();
    })
      .then((data) => {
        if (!ignore) setPrediction(data);
      })
      .catch(() => {
      if (!ignore) setError(true);
    });

    return () => {
      ignore = true;
    };
  }, [routeId, stopId, day, hour, ready]);

  return (
    <section className="predict">
      <h2>Check a bus</h2>

      <label>
  Route
  <select
    value={routeId}
    onChange={(e) => {
      setRouteId(e.target.value);
      setStopId("");
    }}
  >
    <option value="">Select route</option>
    {routes.map((route) => (
      <option key={route.id} value={route.id}>
        {route.route_number}
      </option>
    ))}
  </select>
</label>

<label>
  Stop
  <select
    value={stopId}
    disabled={routeId === ""}
    onChange={(e) => setStopId(e.target.value)}
  >
    <option value="">
      {routeId === "" ? "Choose a route first" : "Select stop"}
    </option>
    {routeStops.map((stop) => (
      <option key={stop.id} value={stop.id}>
        {stop.name}
      </option>
    ))}
  </select>
</label>

      <div className="group" role="group" aria-label="Day">
        <span className="field-label">Day</span>
        <div className="days">
          {days.map((d) => (
            <button
              type="button"
              key={d.value}
              className={`day ${day === d.value ? "active" : ""}`}
              onClick={() => setDay(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="group">
        <div className="hour-row">
          <span className="field-label">Time</span>
          <span className="hour-value">{formatHour(hour)}</span>
        </div>
        <input
          type="range"
          min="6"
          max="21"
          step="1"
          value={hour}
          aria-label="Hour of the day"
          onChange={(e) => setHour(e.target.value)}
        />
      </div>

      {!ready ? (
        <p className="empty">Choose a route and a stop to see the expected crowd.</p>
      ) : error ? (
        <p className="empty">
          Could not load the prediction. Check that the server is running and try again.
        </p>
      ) : prediction === null ? (
        <p className="empty">Checking…</p>
      ) : prediction.predicted_level === null ? (
        <p className="empty">
          No reports yet for this bus, stop and time. Try another hour or day.
        </p>
      ) : (
        <div className={`result ${levelClasses[prediction.predicted_level]}`}>
          <div className="meter">
            <span className={prediction.predicted_level >= 1 ? "on" : ""}></span>
            <span className={prediction.predicted_level >= 2 ? "on" : ""}></span>
            <span className={prediction.predicted_level >= 3 ? "on" : ""}></span>
          </div>
          <div>
            <p className="verdict">{levelNames[prediction.predicted_level]} crowd</p>
            <p className="basis">Based on {prediction.based_on} past reports</p>
            <p className="advice">{advice[prediction.predicted_level]}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Predictform;