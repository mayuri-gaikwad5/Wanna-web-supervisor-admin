import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

/**
 * Default India view (used on initial load)
 * IMPORTANT: Mappls expects [lng, lat]
 */
const INDIA_CENTER = {
  lat: 17.6701,
  lng: 75.9010,
};

const SOS_RADIUS_METERS = 7777; // ~7.7 km radius

const Map = forwardRef(({ alerts = [] }, ref) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const circlesRef = useRef({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // =================================================
  // Expose method to parent (Locate button)
  // =================================================
  useImperativeHandle(ref, () => ({
    focusLocation(lat, lng) {
      if (!mapRef.current || !isMapLoaded) return;

      mapRef.current.setCenter([lng, lat]); // lng, lat
      mapRef.current.setZoom(16);
    },
  }));

  // =================================================
  // Initialize Mappls Map
  // =================================================
  useEffect(() => {
    const initializeMap = () => {
      if (!window.mappls) {
        console.error("❌ Mappls SDK not loaded");
        return;
      }

      if (mapRef.current) return;

      try {
        mapRef.current = new window.mappls.Map("map", {
          center: [INDIA_CENTER.lng, INDIA_CENTER.lat],
          zoom: 5,
          zoomControl: true,
          mapStyle: "standard_day",
        });

        mapRef.current.on("load", () => {
          // 🔐 Always start with India view
          mapRef.current.setCenter([
            INDIA_CENTER.lng,
            INDIA_CENTER.lat,
          ]);
          mapRef.current.setZoom(5);

          setIsMapLoaded(true);
        });
      } catch (error) {
        console.error("❌ Mappls initialization error:", error);
      }
    };

    // Required for SDK callback
    window.initMap1 = initializeMap;

    if (window.mappls) {
      initializeMap();
    }

    return () => {
      window.initMap1 = null;
    };
  }, []);

  // =================================================
  // Sync SOS Markers + Radius Circles
  // =================================================
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // 🔹 Remove old markers & circles
    Object.keys(markersRef.current).forEach((id) => {
      if (!alerts.find((a) => a.id === id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];

        if (circlesRef.current[id]) {
          circlesRef.current[id].setMap(null);
          delete circlesRef.current[id];
        }
      }
    });

    // 🔹 Add new markers & circles
    alerts.forEach((alert) => {
      if (
        markersRef.current[alert.id] ||
        typeof alert.lat !== "number" ||
        typeof alert.lng !== "number"
      ) {
        return;
      }

      // 📍 Marker
      markersRef.current[alert.id] = new window.mappls.Marker({
        map: mapRef.current,
        position: {
          lng: alert.lng,
          lat: alert.lat,
        },
        icon_url: "https://apis.mapmyindia.com/map_v3/1.png",
        popupHtml: `
          <div style="font-size:14px">
            <strong>${alert.userName || "User"}</strong><br/>
            🚨 SOS ACTIVE
          </div>
        `,
      });

      // 🔵 Radius Circle
      circlesRef.current[alert.id] = new window.mappls.Circle({
        map: mapRef.current,
        center: {
          lng: alert.lng,
          lat: alert.lat,
        },
        radius: SOS_RADIUS_METERS, // meters
        fillColor: "transparent",
        strokeColor: "blue",
        strokeWeight: 2,
      });
    });
  }, [alerts, isMapLoaded]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#eaeaea",
        position: "relative",
      }}
    >
      {!isMapLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          Connecting to Mappls Map Engine…
        </div>
      )}
    </div>
  );
});

export default Map;
