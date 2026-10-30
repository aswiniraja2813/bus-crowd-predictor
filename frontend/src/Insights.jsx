import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { API } from "../config";
import useRouteStops from "../useRouteStops";

const names = { 1: "Low", 2: "Medium", 3: "High" };
const colors = { 1: "#2e9e5b", 2: "#e9a23b", 3: "#d64545" };

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
  const suffix = h >= 12 ? "PM" : "AM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve} ${suffix}`;
}

function levelOf(average) {
  if (average < 1.67) return 1;
  if (average < 2.34) return 2;
  return 3;
}

function Insights({ routes }) {
  const [routeId, setRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [day, setDay] = useState("0");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const routeStops = useRouteStops(routeId);
  const ready = routeId !== "" && stopId !== "";

  useEffect(() => {
    if (!ready) {
      setData(null);
      setError(false);
      return;
    }

    let ignore = false;
    setError(false);
    setData(null);

    fetch(`${API}/hourly?route=${routeId}&stop=${stopId}&day=${day}`)
      .then((res) => {
        if (!res.ok) throw new Error("Bad response");
        return res.json();
      })
      .then((list) => {
        if (!ignore) setData(list);
      })
      .catch(() => {
        if (!ignore) setError(true);
      });

    return () => {
      ignore = true;
    };
  }, [routeId, stopId, day, ready]);

  const chartData = (data || []).map((d) => ({
    ...d,
    label: formatHour(d.hour),
  }));

  let quietest = null;
  let busiest = null;
  if (chartData.length > 0) {
    quietest = chartData.reduce((a, b) => (b.average < a.average ? b : a));
    busiest = chartData.reduce((a, b) => (b.average > a.average ? b : a));
  }

  return (
    <section className="insights">
      <h2>Best time to travel</h2>

      <div className="fields">
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
      </div>

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

      {!ready ? (
        <p className="empty">Choose a route and a stop to see the crowd through the day.</p>
      ) : error ? (
        <p className="empty">Could not load the chart. Check that the server is running.</p>
      ) : data === null ? (
        <p className="empty">Loading…</p>
      ) : chartData.length === 0 ? (
        <p className="empty">No reports yet for this bus and stop on this day.</p>
      ) : (
        <>
          <p className="summary">
            Quietest around <strong>{quietest.label}</strong>. Busiest around{" "}
            <strong>{busiest.label}</strong>.
          </p>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="label" interval={1} tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 3]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(v) => names[v]}
                  width={64}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${value} (${names[levelOf(value)]})`,
                    "Average crowd",
                  ]}
                />
                <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.hour} fill={colors[levelOf(d.average)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}

export default Insights;