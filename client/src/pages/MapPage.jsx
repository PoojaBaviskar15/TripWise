import React from "react";
import MapComponent from "../components/MApComponent";
import FestivalSubmissionWrapper from "../components/FestivalSubmission";

const MapPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Explore Cultural Sites</h2>
      <MapComponent />
      <FestivalSubmissionWrapper />

    </div>
  );
};

export default MapPage;
