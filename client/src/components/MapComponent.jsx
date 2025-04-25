import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../../supabase';
import FestivalMap from './categorymap/FestivalMap';

const categories = [
  'Festival Hotspots',
  'Culinary Heritage Locations',
  'Art & Handicraft Centers',
  'Spiritual & Pilgrimage Sites',
  'Cultural Trails & Walking Routes',
  'Popular Places',
  'Event',
  'Heritage',
];

const categoryColors = {
  'Festival Hotspots': 'bg-red-500',
  'Culinary Heritage Locations': 'bg-yellow-500',
  'Art & Handicraft Centers': 'bg-blue-500',
  'Spiritual & Pilgrimage Sites': 'bg-purple-500',
  'Cultural Trails & Walking Routes': 'bg-green-500',
  'Popular Places': 'bg-pink-500',
  'Event': 'bg-orange-500',
  'Heritage': 'bg-indigo-500',
};

const GeneralMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [activeCategories, setActiveCategories] = useState(new Set(categories));
  const markersRef = useRef([]);

  
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error) setLocations(data);
      else console.error(error);
    };
    fetchData();
  }, []);



  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [78.9629, 20.5937],
      zoom: 4,
    });

    map.current.setMaxBounds([
      [67.0, 6.0],
      [98.0, 37.0],
    ]);

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add filtered markers
    locations.forEach(loc => {
      if (!activeCategories.has(loc.category)) return;

      const el = document.createElement('div');
      el.className = `w-4 h-4 rounded-full ${categoryColors[loc.category] || 'bg-gray-500'} border border-white shadow-md`;

      const marker = new maplibregl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <div class="text-sm">
              <h3 class="font-bold">${loc.name}</h3>
              <p class="text-gray-600">${loc.category}</p>
              <p>${loc.description}</p>
            </div>
          `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [locations, activeCategories]);

  const toggleCategory = (cat) => {
    setActiveCategories(prev => {
      const updated = new Set(prev);
      updated.has(cat) ? updated.delete(cat) : updated.add(cat);
      return updated;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium shadow ${
              activeCategories.has(cat)
                ? `text-white ${categoryColors[cat]}`
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="w-full h-[90vh] border rounded-xl overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

const MapComponent = () => {
  const [activeMap, setActiveMap] = useState('festival');

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={() => setActiveMap('festival')}
          className={`px-4 py-2 mr-2 rounded ${
            activeMap === 'festival' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Festival Map
        </button>
        <button
          onClick={() => setActiveMap('general')}
          className={`px-4 py-2 rounded ${
            activeMap === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          General Map
        </button>
      </div>

      {activeMap === 'festival' ? <FestivalMap /> : <GeneralMap />}
    </div>
  );
};

export default MapComponent;


