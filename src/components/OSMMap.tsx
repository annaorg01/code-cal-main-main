tsx
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const OSMMap: React.FC = () => {
  useEffect(() => {
    const map = L.map('map').setView([32.0853, 34.7818], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([32.0853, 34.7818]).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default OSMMap;