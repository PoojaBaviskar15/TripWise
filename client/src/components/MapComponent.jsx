import React, { useEffect, useState } from 'react';
import maplibre from 'maplibre-gl';
import { supabase } from '../../supabase';

const MapComponent = ({ places }) => {
  useEffect(() => {
    const map = new maplibre.Map({
      container: 'map', // The container where the map will be rendered
      style: 'https://demotiles.maplibre.org/style.json', // Map style URL
      center: [77.1025, 28.7041], // Initial center of the map (Delhi, India)
      zoom: 5, // Initial zoom level
    });

    // Add markers to the map
    places.forEach(place => {
      const { latitude, longitude, place_name } = place;

      // Create a marker for each place
      new maplibre.Marker()
        .setLngLat([longitude, latitude])
        .setPopup(new maplibre.Popup().setHTML(`<h3>${place_name}</h3>`))
        .addTo(map);
    });

    // Add navigation control (zoom and rotation)
    map.addControl(new maplibre.NavigationControl());
  }, [places]);

  return <div id="map" style={{ width: '100%', height: '500px' }} />;
};

export default MapComponent;