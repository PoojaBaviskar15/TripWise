import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase'; // Your Supabase client setup
import MapComponent from './MApComponent';
import { upsertPlace } from '../services/upsertPlace';

const MapContainer = () => {
  const [places, setPlaces] = useState([]);

  // Function to fetch places with filtering by popularity_score and category_guess
  const fetchFilteredPlaces = async (popularityThreshold, category) => {
    let query = supabase.from('popular_places').select('*');

    if (popularityThreshold) {
      query = query.gte('popularity_score', popularityThreshold); // Filter by popularity score
    }

    if (category) {
      query = query.eq('category_guess', category); // Filter by category_guess
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setPlaces(data);
    }
  };

  // Fetch places when the component mounts
  useEffect(() => {
    fetchFilteredPlaces(80, 'Heritage Sites & Monuments'); // Example: Fetch places with popularity score > 80 in a specific category
    upsertPlace(fetchFilteredPlaces)
  }, []);

  return (
    <div>
      <MapComponent places={places} />
    </div>
  );
};

export default MapContainer;
