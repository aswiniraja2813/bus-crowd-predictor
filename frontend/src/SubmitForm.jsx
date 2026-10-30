import { useState } from "react";
import { Link } from "react-router-dom";
import useRouteStops from "./useRouteStops";
import { API } from "./config";

const options = [
  { value: "1", label: "Low", hint: "Seats free", cls: "low" },
  { value: "2", label: "Medium", hint: "Some standing", cls: "medium" },
  { value: "3", label: "High", hint: "Packed", cls: "high" },
];

function SubmitForm({ routes, auth, onLogout }) {
  const [routeId, setRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [crowdLevel, setCrowdLevel] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const routeStops = useRouteStops(routeId);

  if (!auth) {
    return (
      <section className="report">
        <h2>Report what you see</h2>
        <p>
          Please <Link to="/login">log in or sign up</Link> to send a report.
          This keeps the crowd data trustworthy.
        </p>
      </section>
    );
  }

  const handleSubmit = () => {
    setStatus("");
    setMessage("");

     fetch(`${API}/createReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${auth.token}`, // the key card
      },
      body: JSON.stringify({
        route: routeId,
        stop: stopId,
        crowd_level: crowdLevel,
      }),
    })
     .then(async (res) => {
        if (res.ok) {
          setStatus("sent");
          setCrowdLevel("");
          return;
        }
        if (res.status === 401) {
          onLogout(); // the token isn't valid any more, so log out
          return;
        }
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(
          data.error ||
            "Could not send. Choose a route, stop and crowd level, then try again."
        );
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the server. Please try again.");
      });
  };


  return (
    <section className="report">
      <h2>Report what you see</h2>

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

      <div className="group" role="group" aria-label="How crowded is it?">
        <span className="field-label">How crowded is it?</span>
        <div className="choices">
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              className={`choice ${o.cls} ${crowdLevel === o.value ? "active" : ""}`}
              onClick={() => setCrowdLevel(o.value)}
            >
              <strong>{o.label}</strong>
              <span>{o.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="primary" onClick={handleSubmit}>
        Send report
      </button>

      {status === "sent" && (
        <p className="note ok" role="status">
          Report sent. Thanks for helping other passengers.
        </p>
      )}
      {status === "error" && (
        <p className="note bad" role="status">
          Could not send. Choose a route, stop and crowd level, then try again.
        </p>
      )}
    </section>
  );
}

export default SubmitForm;