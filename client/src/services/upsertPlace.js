// src/utils/upsertPlace.js
import { supabase } from "../../supabase";

export const upsertPlace = async (place) => {
  const { data, error } = await supabase
    .from('popular_places')
    .upsert([
      {
        id: place.id,
        place_name: place.place_name,
        latitude: place.latitude,
        longitude: place.longitude,
        popularity_score: place.popularity_score,
        category_guess: place.category_guess,
      },
    ]);

  if (error) {
    console.error(error);
  } else {
    console.log('Place updated or inserted successfully:', data);
  }
};
