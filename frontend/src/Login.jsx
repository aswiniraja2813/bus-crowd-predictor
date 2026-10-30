import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "./config";

function Login({ onAuth }) {
  // JOB 1: the slip of paper (what the user types)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Extras: which form is showing, an error message, and a "waiting" flag
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate(); // lets us move to another page from code
  const isLogin = mode === "login";

  // JOB 2: hand the slip to Django (runs when the form is submitted)
  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setMessage("");
    setBusy(true);

    fetch(`${API}/${isLogin ? "login" : "signup"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    })
      // JOB 3: Django answers
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        // Django said no
        if (!res.ok) {
          setMessage(
            isLogin
              ? "Wrong username or password."
              : data.error || "Could not create the account."
          );
          return;
        }

        // Django said yes: pass the token to App and open the Report page
        onAuth({ token: data.token, username: data.username || username.trim() });
        navigate("/report");
      })
      .catch(() => setMessage("Could not reach the server. Please try again."))
      .finally(() => setBusy(false)); // always switch the button back on
  };

  // What appears on the page
  return (
    <section className="predict">
      <h2>{isLogin ? "Log in" : "Create an account"}</h2>
      <p className="basis">
        You need an account to send crowd reports. Checking buses is open to everyone.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="fields single">
          <label>
            Username
            <input
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              autoComplete={isLogin ? "current-password" : "new-password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>

      {message && (
        <p className="note bad" role="alert">
          {message}
        </p>
      )}

      <p className="auth-switch">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="linklike"
          onClick={() => {
            setMode(isLogin ? "signup" : "login");
            setMessage("");
          }}
        >
          {isLogin ? "Create an account" : "Log in"}
        </button>
      </p>
    </section>
  );
}

export default Login;