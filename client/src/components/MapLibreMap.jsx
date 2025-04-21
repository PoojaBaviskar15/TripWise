import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { supabase } from "../../supabase";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";

// Category list
const categories = [
  "Heritage Sites & Monuments",
  "Architectural Marvels",
  "Festival Hotspots",
  "Culinary Heritage Locations",
  "Art & Handicraft Centers",
  "Spiritual & Pilgrimage Sites",
  "Cultural Trails & Walking Routes",
];

// Category to color mapping
const getCategoryColor = (category) => {
  const colors = {
    "Heritage Sites & Monuments": "red",
    "Architectural Marvels": "blue",
    "Festival Hotspots": "orange",
    "Culinary Heritage Locations": "green",
    "Art & Handicraft Centers": "purple",
    "Spiritual & Pilgrimage Sites": "brown",
    "Cultural Trails & Walking Routes": "teal",
  };
  return colors[category] || "gray";
};

// ✅ Category Filter Component
const CategoryFilter = ({ selectedCategories, handleCategoryChange }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
    {categories.map((cat) => (
      <FormControlLabel
        key={cat}
        control={
          <Checkbox
            checked={selectedCategories.includes(cat)}
            onChange={() => handleCategoryChange(cat)}
          />
        }
        label={cat}
      />
    ))}
  </Box>
);

// ✅ Main Map Component
const MapLibreMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([...categories]);

  // Fetch all cultural sites once
  const fetchSites = async () => {
    const { data, error } = await supabase.from("cultural_sites").select("*");
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      setAllSites(data);
    }
  };

  const clearMarkers = () => {
    markers.forEach((marker) => marker.remove());
    setMarkers([]);
  };

  const updateMarkers = () => {
    clearMarkers();

    const filteredSites = allSites.filter((site) =>
      selectedCategories.includes(site.category)
    );

    const newMarkers = filteredSites.map((site) => {
      // Create custom colored marker
      const el = document.createElement("div");
      el.style.backgroundColor = getCategoryColor(site.category);
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([site.longitude, site.latitude])
        .setPopup(
          new maplibregl.Popup().setHTML(
            `<strong>${site.name}</strong><br/>${site.description}<br/><em>${site.category}</em>`
          )
        )
        .addTo(map.current);

      return marker;
    });

    setMarkers(newMarkers);
  };

  useEffect(() => {
    fetchSites();

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [78.9629, 20.5937], // Center of India
        zoom: 4,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }
  }, []);

  useEffect(() => {
    if (map.current && allSites.length) {
      updateMarkers();
    }
  }, [selectedCategories, allSites]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filter by Category
      </Typography>

      <CategoryFilter
        selectedCategories={selectedCategories}
        handleCategoryChange={handleCategoryChange}
      />

      <Box
        ref={mapContainer}
        sx={{
          height: "500px",
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
        }}
      />
    </Box>
  );
};

export default MapLibreMap;
