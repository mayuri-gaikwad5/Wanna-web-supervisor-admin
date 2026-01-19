import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { REGION_CENTERS } from "../../constants/regionCenters";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const Map = forwardRef(({ alerts = [], region }, ref) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 🔁 Allow dashboard to focus on SOS
  useImperativeHandle(ref, () => ({
    focusLocation(lat, lng) {
      if (!mapRef.current || !isMapLoaded) return;
      mapRef.current.setCenter([lng, lat]);
      mapRef.current.setZoom(16);
    },
  }));

  // 🗺️ INITIALIZE MAP ONLY ONCE
  useEffect(() => {
    if (!window.mappls || mapRef.current) return;

    mapRef.current = new window.mappls.Map("map", {
      center: [INDIA_CENTER.lng, INDIA_CENTER.lat],
      zoom: 5,
      zoomControl: true,
      mapStyle: "standard_day",
    });

    mapRef.current.on("load", () => {
      setIsMapLoaded(true);
    });
  }, []);

  // 🎯 CENTER MAP BASED ON SUPERVISOR REGION
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !region) return;

    const key = region.toLowerCase();
    const center = REGION_CENTERS[key];

    if (center) {
      mapRef.current.setCenter([center.lng, center.lat]);
      mapRef.current.setZoom(12); // 👈 city-level zoom
    }
  }, [region, isMapLoaded]);

  // 🚨 SOS MARKERS
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    Object.keys(markersRef.current).forEach((id) => {
      if (!alerts.find((a) => a.id === id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    alerts.forEach((alert) => {
      if (
        markersRef.current[alert.id] ||
        typeof alert.lat !== "number" ||
        typeof alert.lng !== "number"
      )
        return;

      const marker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lng: alert.lng, lat: alert.lat },
        icon_url: "https://apis.mapmyindia.com/map_v3/1.png",
      });

      marker.addListener("click", () => {
        new window.mappls.Popup({
          map: mapRef.current,
          position: { lng: alert.lng, lat: alert.lat },
          content: `<strong>${alert.userName || "User"}</strong><br/>🚨 SOS ACTIVE`,
        });
      });

      markersRef.current[alert.id] = marker;
    });
  }, [alerts, isMapLoaded]);

  return <div id="map" style={{ width: "100%", height: "100%" }} />;
});

export default Map;
