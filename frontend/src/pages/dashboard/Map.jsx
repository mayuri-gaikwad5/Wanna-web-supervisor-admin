import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef
} from "react";

const Map = forwardRef(({ alerts = [] }, ref) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  /* 🔁 EXPOSE LOCATE FUNCTION */
  useImperativeHandle(ref, () => ({
    focusLocation(lat, lng) {
      if (!mapRef.current || typeof lat !== "number" || typeof lng !== "number") return;
      mapRef.current.setCenter([lat, lng]);
      mapRef.current.setZoom(16);
    }
  }));

  /* 🗺️ INITIALIZE MAP */
  useEffect(() => {
    const initializeMap = () => {
      if (!window.mappls || mapRef.current) return;

      try {
        mapRef.current = new window.mappls.Map("map", {
          center: [20.5937, 78.9629], // India
          zoom: 5,
          zoomControl: true,
          mapStyle: "standard_day",
            maxBounds: [
                [6.0, 68.0],   // Southwest (India)
                [36.0, 97.0],   // Northeast (India)
            ],

            minZoom: 4,
            maxZoom: 18,
        });

        mapRef.current.on("load", () => {
          setIsMapLoaded(true);
        });
      } catch (err) {
        console.error("❌ Mappls initialization error:", err);
      }
    };

    window.initMap1 = initializeMap;

    if (window.mappls) {
      initializeMap();
    }

    return () => {
      window.initMap1 = null;

      // Cleanup markers
      Object.values(markersRef.current).forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = {};
    };
  }, []);

  /* 📍 SYNC MARKERS */
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // Remove old markers
    Object.keys(markersRef.current).forEach(id => {
      if (!alerts.find(a => a.id === id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    // Add new markers
    alerts.forEach(alert => {
      if (
        markersRef.current[alert.id] ||
        typeof alert.lat !== "number" ||
        typeof alert.lng !== "number"
      ) {
        return;
      }

      const marker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat: alert.lat, lng: alert.lng },
        icon_url: "https://apis.mapmyindia.com/map_v3/1.png",
      });

      // ✅ SHOW NAME ON CLICK
      marker.addListener("click", () => {
        new window.mappls.Popup({
          map: mapRef.current,
          position: { lat: alert.lat, lng: alert.lng },
          content: `
            <div style="font-size:14px; line-height:1.4">
              <strong>${alert.userName || "Unknown Victim"}</strong><br/>
              🚨 SOS ACTIVE
            </div>
          `,
        });
      });

      markersRef.current[alert.id] = marker;
    });
  }, [alerts, isMapLoaded]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#eee",
        position: "relative",
      }}
    >
      {!isMapLoaded && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <strong>Connecting to Mappls Map Engine...</strong>
        </div>
      )}
    </div>
  );
});

export default Map;
