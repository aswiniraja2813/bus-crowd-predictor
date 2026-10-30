import { useEffect, useState } from "react";
import { API } from "./config";

export default function useRouteStops(routeId) {
  const [routeStops, setRouteStops] = useState([]);

  useEffect(() => {
    if (routeId === "") {
      setRouteStops([]);
      return;
    }

    let ignore = false;

   
   fetch(`${API}/routeStops?route=${routeId}`)
      .then((res) => res.json())
      .then((list) => {
        if (!ignore) setRouteStops(list);
      });

    return () => {
      ignore = true;
    };
  }, [routeId]);

  return routeStops;
}