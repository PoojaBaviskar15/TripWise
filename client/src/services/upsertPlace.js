// src/utils/upsertPlace.js
import { supabase } from "../../supabase";

export const upsertPlace = async (place) => {
  const { data, error } = await supabase
    .from('popular_places')
    .upsert([
      {
        id: place.id,
        name: place.name,
        lat: place.lat,
        long: place.long,
        popularity_score: place.popularity_score || 0,
        category_guess: place.category_guess || null,
        blog_ids: place.blog_ids || [],
        review_ids: place.review_ids || [],
        added_at: new Date().toISOString()
      },
    ]);

  if (error) {
    console.error(error);
  } else {
    console.log('Place updated or inserted successfully:', data);
  }
};
