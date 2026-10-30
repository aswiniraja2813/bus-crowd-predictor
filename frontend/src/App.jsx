// import React, { useEffect, useState } from 'react'

// const App = () => {
//     let [message,setmessage]=useState("Loading....")
//     useEffect(()=>{
//         fetch("http://127.0.0.1:8000/hello")
//         .then((x)=>x.json())
//         .then((y)=>setmessage(y.message))
//         .catch(()=>setmessage("There is error in django "))
//     },[]);
//     return (
//         <div>
//             <h1>{message}</h1>
//         </div>
//   )
// }

// export default App

// !TO GET ALL THE ROUTES

// import { useEffect, useState } from "react";

// function App() {
//   const [routes, setRoutes] = useState([]);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/route")
//       .then((res) => res.json())
//       .then((data) => setRoutes(data))
//       .catch(() => console.log("Could not reach Django"));
//   }, []);

//   return (
//     <div>
//       <h1>Bus Routes</h1>
//       <ul>
//         {routes.map((route) => (
//           <li key={route.id}>
//             {route.route_number} - {route.name}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;

// !TO GET ALL THE STOPS 

// import { useEffect, useState } from "react";

// function App() {
//   const [stop, setstop] = useState([]);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/stop")
//       .then((res) => res.json())
//       .then((data) => setstop(data))
//       .catch(() => console.log("Could not reach Django"));
//   }, []);

//   return (
//     <div>
//       <h1>Bus Stops</h1>
//       <ul>
//         {stop.map((stob) => (
//           <li key={stob.id}>
//             {stob.name}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;

// !TO SAVE THE CROWD LEVEL REPORT
// import React, { useState,useEffect } from 'react'


// const App = () => {
//   let [route,setroute]=useState([])
//   let [stop,setstop]=useState([])
//   let [routeid,setrouteid]=useState("")
//   let [stopid,setstopid]=useState("")
//   let [crowdlevel,setcrowdlevel]=useState("")

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/route")
//       .then((res) => res.json())
//       .then((data) => setroute(data))
//       .catch(() => console.log("Could not reach Django"));
//   }, []);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/stop")
//       .then((res) => res.json())
//       .then((data) => setstop(data))
//       .catch(() => console.log("Could not reach Django"));
//   }, []);

//   const handleSubmit = () => {
//     fetch("http://127.0.0.1:8000/createReport", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         route: routeid,
//         stop: stopid,
//         crowd_level: crowdlevel,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => console.log(data));
//   };


//   return (
//     <div>
//       <h1>Report Bus crowd</h1>

//       <select value={routeid} onChange={(e)=>setrouteid(e.target.value)}>
//         <option value="">select bus </option>
//         {route.map((routes)=>(
//           <option key={routes.id} value={routes.id}>
//             {routes.route_number}
//           </option>
          
//         ))}

        
//       </select>
//       <select value={stopid} onChange={(e)=>setstopid(e.target.value)}>
//         <option value="">select bus </option>
//         {stop.map((stops)=>(
//           <option key={stops.id} value={stops.id}>
//             {stops.name}
//           </option>
          
//         ))}

        
//       </select>

//       <select name="" id="" value={crowdlevel} onChange={(e)=>setcrowdlevel(e.target.value)}>
//         <option value="1">Low</option>
//         <option value="2">Medium</option>
//         <option value="3">High</option>
//       </select>
//       <p>
//         Selected: route {routeid}, stop {stopid}, level {crowdlevel}
//       </p>
//       <button onClick={handleSubmit}>Submit</button>
//     </div>
//   )
// }

// export default App

import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import SubmitForm from "./SubmitForm";
import Predictform from "./Predictform";
import Insights from "./Insights";
import Login from "./Login"
import { API } from "./config";

function App() {
  const [routes, setRoutes] = useState([]);
const [stops, setStops] = useState([]);
const [loadError, setLoadError] = useState(false);

const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth"));
    } catch {
      return null;
    }
  });

  // Login calls this when Django says yes (CONNECTION 3 uses it)
  const saveAuth = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };
  useEffect(() => {
  const load = (path) =>
   fetch(`${API}/${path}`).then((res) => {
      return res.json();
    });

  Promise.all([load("route"), load("stop")])
    .then(([routeData, stopData]) => {
      setRoutes(routeData);
      setStops(stopData);
    })
    .catch(() => setLoadError(true));
}, []);
  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <nav className="nav">
            <NavLink to="/" end>Check a bus</NavLink>
            <NavLink to="/report">Report crowd</NavLink>
             <NavLink to="/insights">Best time</NavLink>
             <span className="who">
              {auth ? (
                <>
                  <span>Hi, {auth.username}</span>
                  <button type="button" className="logout" onClick={logout}>
                    Log out
                  </button>
                </>
              ) : (
                // CONNECTION 4: the link that takes the user to the login page
                <NavLink to="/login">Log in</NavLink>
              )}
            </span>
          </nav>

          <h1>Will my bus be crowded?</h1>
          <p>
            Pick a route and a stop to see how full it usually is at any time
            of day.
          </p>
          <div className="route-line">
            <i className="dot"></i>
            <i className="dot"></i>
            <i className="dot"></i>
            <i className="dot"></i>
            <i className="dot"></i>
            <span className="bus">🚌</span>
          </div>
        </div>
      </header>

      <main className="main">
        {loadError && (
          <p className="banner">
            Could not reach the server, so routes and stops can't be shown.
            Please try again later.
          </p>
        )}
       <Routes>
  <Route path="/" element={<Predictform routes={routes} stops={stops} />} />
  <Route
    path="/report"
    element={<SubmitForm routes={routes} auth={auth} onLogout={logout} />}
  />
  <Route path="/insights" element={<Insights routes={routes} stops={stops} />} />
  <Route path="/login" element={<Login onAuth={saveAuth} />} />
  <Route path="*" element={<p className="empty">Page not found.</p>} />
</Routes>
      </main>
    </>
  );
}

export default App;

