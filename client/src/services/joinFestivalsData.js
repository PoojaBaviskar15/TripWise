// utils/joinFestivalData.js
export const joinFestivalPopularity = (geojson, popularityData, selectedFestival) => {
    return {
      ...geojson,
      features: geojson.features.map((feature) => {
        const stateName = feature.properties.ST_NM;
        const popularityEntry = popularityData.find(
          (entry) => entry.state_name === stateName && entry.festival_name === selectedFestival
        );
  
        return {
          ...feature,
          properties: {
            ...feature.properties,
            festival_popularity: popularityEntry ? popularityEntry.popularity : 0
          }
        };
      })
    };
  };
  