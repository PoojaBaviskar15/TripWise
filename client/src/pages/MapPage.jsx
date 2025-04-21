import React from "react";
import MapLibreMap from "../components/MapLibreMap";
import MapComponent from "../components/MApComponent";
import MapContainer from "../components/MapContainer";

const MapPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Explore Cultural Sites</h2>
      <MapLibreMap />
      <MapComponent />
      <MapContainer />
    </div>
  );
};

export default MapPage;
