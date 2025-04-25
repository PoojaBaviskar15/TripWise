import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../../../supabase';

const FestivalMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const popupRef = useRef(new maplibregl.Popup({ closeButton: false, closeOnClick: false }));
  const [festivalData, setFestivalData] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('state');

  const regionKeyMap = {
    state: 'state',
    district: 'district',
    taluka: 'subdistrict',
  };

  const geoJsonRegionKeyMap = {
    state: 'NAME_1',
    district: 'NAME_2',
    taluka: 'NAME_3',
  };

  const normalize = (str) => str?.toLowerCase().replace(/[\s\-]+/g, '_').replace(/_district|_subdistrict|_taluka/g, '') || '';


  const buildPopularityMap = (data, regionKey) => {
    const map = {};
    data.forEach(entry => {
      const region = normalize(entry[regionKey]);
      const festival = normalize(entry.festival_name);
      const popularity = parseInt(entry.popularity, 10);
      if (!map[festival]) map[festival] = {};
      map[festival][region] = popularity;
    });
    return map;
  };

  const applyChoroplethStyle = (geoJson, mapInstance, popularityMap, geoKey, selectedFestival) => {
    const normalizedFestival = normalize(selectedFestival);

    geoJson.features = geoJson.features.map(feature => {
      const regionName = normalize(feature.properties[geoKey]);
      const popularity = popularityMap[normalizedFestival]?.[regionName] || 0;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          popularity,
        },
      };
    });

    // Remove old layers and sources
    ['region-fills', 'region-borders'].forEach(id => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    });
    if (mapInstance.getSource('india-regions')) mapInstance.removeSource('india-regions');

    // Add new source
    mapInstance.addSource('india-regions', {
      type: 'geojson',
      data: geoJson,
    });

    // Add fill layer
    mapInstance.addLayer({
      id: 'region-fills',
      type: 'fill',
      source: 'india-regions',
      paint: {
        'fill-color': [
          'interpolate', ['linear'], ['get', 'popularity'],
          0, '#f7fcf5',
          20, '#c7e9c0',
          40, '#74c476',
          60, '#31a354',
          80, '#006d2c',
          100, '#00441b',
        ],
        'fill-opacity': 0.8,
      },
    });

    // Add border layer
    mapInstance.addLayer({
      id: 'region-borders',
      type: 'line',
      source: 'india-regions',
      paint: {
        'line-color': '#888',
        'line-width': 1,
      },
    });

    // Add interactivity
    mapInstance.on('mousemove', 'region-fills', (e) => {
      const feature = e.features[0];
      const name = feature.properties[geoKey];
      const popularity = feature.properties.popularity;

      popupRef.current
        .setLngLat(e.lngLat)
        .setHTML(`<div><strong>${name}</strong><br />Popularity: ${popularity}</div>`)
        .addTo(mapInstance);
    });

    mapInstance.on('mouseleave', 'region-fills', () => popupRef.current.remove());
  };

  const fetchFestivalData = async () => {
    const { data, error } = await supabase
      .from('festival_popularity')
      .select('festival_name');

    if (!error && data) {
      const uniqueFestivals = [...new Set(data.map(f => f.festival_name))];
      setFestivalData(uniqueFestivals);
      setSelectedFestival(uniqueFestivals[0] || '');
    }
  };

  const fetchGeoJson = async () => {
    try {
      const res = await fetch(`/data/india-master/${selectedRegion}/india_${selectedRegion}.geojson`);
      const geoJson = await res.json();
      setGeoJsonData(geoJson);
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
    }
  };

  const updateMap = async () => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData || !selectedFestival || !map.isStyleLoaded()) return;

    const regionColumn = regionKeyMap[selectedRegion];
    const geoKey = geoJsonRegionKeyMap[selectedRegion];

    const { data, error } = await supabase
      .from('festival_popularity')
      .select(`${regionColumn}, popularity, festival_name`);

    if (error || !data) return;

    const popularityMap = buildPopularityMap(data, regionColumn);
    const clonedGeoJson = JSON.parse(JSON.stringify(geoJsonData));
    applyChoroplethStyle(clonedGeoJson, map, popularityMap, geoKey, selectedFestival);
  };

  // Initial festival list
  useEffect(() => {
    fetchFestivalData();
  }, []);

  // GeoJSON fetch on region change
  useEffect(() => {
    fetchGeoJson();
  }, [selectedRegion]);

  // Init map
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [78.9629, 22.5937],
      zoom: 4,
    });
    mapInstanceRef.current = map;
    map.on('load', updateMap);
    return () => map.remove();
  }, []);

  // Update on festival/region change
  useEffect(() => {
    updateMap();
  }, [geoJsonData, selectedFestival, selectedRegion]);

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        {['state', 'district', 'taluka'].map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-4 py-2 rounded ${selectedRegion === region ? 'bg-blue-700' : 'bg-blue-500'} text-white`}
          >
            {region.charAt(0).toUpperCase() + region.slice(1)} Map
          </button>
        ))}
      </div>

      <div className="mb-4">
        <select
          value={selectedFestival}
          onChange={(e) => setSelectedFestival(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          {festivalData.map(festival => (
            <option key={festival} value={festival}>{festival}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-[600px] rounded shadow" />
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-4 py-2 rounded shadow text-sm">
          <strong>Legend:</strong>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <LegendItem color="#f7fcf5" label="0" />
            <LegendItem color="#c7e9c0" label="20" />
            <LegendItem color="#74c476" label="40" />
            <LegendItem color="#31a354" label="60" />
            <LegendItem color="#006d2c" label="80" />
            <LegendItem color="#00441b" label="100" />
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center space-x-1">
    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
    <span>{label}</span>
  </div>
);

export default FestivalMap;
