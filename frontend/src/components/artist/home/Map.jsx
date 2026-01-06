import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamic icon creator based on region importance
const createIcon = (zoomLevel, importance = 'medium') => {
  // Base sizes for different importance levels
  const baseSizes = {
    high: 100,    // Major cities
    medium: 50,  // State capitals
    low: 25      // Other cities
  };
  
  // Size increases with zoom level
  const sizeMultiplier = 1 + (zoomLevel - 4.5) * 0.3;
  const baseSize = baseSizes[importance];
  const finalSize = Math.max(baseSize, baseSize * sizeMultiplier);
  
  return new L.Icon({
    iconUrl: '/pointer.svg',
    iconSize: [finalSize, finalSize],
    iconAnchor: [finalSize/2, finalSize/2],
    className: 'dynamic-marker'
  });
};

// Component to update icons when zoom changes
const ZoomHandler = ({ onZoomChange }) => {
  const map = useMap();
  
  map.on('zoomend', () => {
    onZoomChange(map.getZoom());
  });
  
  return null;
};

const listeners = [
  // High Importance - Major metropolitan cities
  { id: 1, lat: 28.61, lng: 77.23, name: 'Delhi', importance: 'high' },
  { id: 5, lat: 19.07, lng: 72.87, name: 'Mumbai', importance: 'high' },
  { id: 9, lat: 12.97, lng: 77.59, name: 'Bengaluru', importance: 'high' },
  { id: 10, lat: 13.08, lng: 80.27, name: 'Chennai', importance: 'high' },
  { id: 11, lat: 17.39, lng: 78.49, name: 'Hyderabad', importance: 'high' },
  { id: 13, lat: 22.57, lng: 88.36, name: 'Kolkata', importance: 'high' },
  
  // Medium Importance - State capitals and major cities
  { id: 2, lat: 30.73, lng: 76.77, name: 'Chandigarh', importance: 'medium' },
  { id: 4, lat: 26.85, lng: 80.95, name: 'Lucknow', importance: 'medium' },
  { id: 6, lat: 18.52, lng: 73.86, name: 'Pune', importance: 'medium' },
  { id: 7, lat: 23.03, lng: 72.57, name: 'Ahmedabad', importance: 'medium' },
  { id: 14, lat: 25.60, lng: 85.15, name: 'Patna', importance: 'medium' },
  { id: 15, lat: 20.30, lng: 85.83, name: 'Bhubaneswar', importance: 'medium' },
  { id: 17, lat: 23.25, lng: 77.41, name: 'Bhopal', importance: 'medium' },
  
  // Low Importance - Other important cities
  { id: 3, lat: 31.10, lng: 77.16, name: 'Shimla', importance: 'low' },
  { id: 8, lat: 25.07, lng: 73.12, name: 'Udaipur', importance: 'low' },
  { id: 12, lat: 10.85, lng: 76.27, name: 'Kochi', importance: 'low' },
  { id: 16, lat: 23.34, lng: 85.31, name: 'Ranchi', importance: 'low' },
  { id: 18, lat: 21.15, lng: 79.08, name: 'Nagpur', importance: 'low' },
  { id: 19, lat: 26.21, lng: 78.16, name: 'Gwalior', importance: 'low' },
  { id: 20, lat: 11.94, lng: 79.87, name: 'Puducherry', importance: 'low' },
];

const Map = () => {
  const [zoomLevel, setZoomLevel] = useState(4.5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMapClick = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Fullscreen map component
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f172a]">
        <div className="relative w-full h-full">
          <button 
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors"
            style={{ zIndex: 1000 }}
          >
            ✕
          </button>
          <MapContainer 
            center={[23.61, 78.23]}
            zoom={5} 
            className='w-full h-full'
            zoomControl={true}
            attributionControl={false}
          >
            <ZoomHandler onZoomChange={setZoomLevel} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {listeners.map(l => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={createIcon(zoomLevel, l.importance)}
              />
            ))}
          </MapContainer>
        </div>

        <style jsx="true" global="true">{`
          .dynamic-marker {
            transition: all 0.3s ease;
          }
          
          .dynamic-marker:hover {
            transform: scale(1.2);
          }
          
          .leaflet-container {
            background: transparent !important;
          }
          
          .leaflet-control-attribution {
            display: none !important;
          }
        `}</style>
      </div>
    );
  }

  // Normal map component
  return (
    <>
      <h2 className='text-white text-2xl mt-4 font-semibold'>top countries/regions</h2>
      <div 
        className="mt-4 w-[90vw] h-[301px] rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d] cursor-pointer"
        onClick={handleMapClick}
      >
        <div className="w-full h-full rounded-[10px] relative overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
          <MapContainer 
            center={[23.61, 78.23]}
            zoom={4.5} 
            className='w-full h-full rounded-[10px]'
            zoomControl={false}
            attributionControl={false}
          >
            <ZoomHandler onZoomChange={setZoomLevel} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {listeners.map(l => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={createIcon(zoomLevel, l.importance)}
              />
            ))}
          </MapContainer>
          
          {/* Overlay with click hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300">
            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
              Click to view fullscreen
            </div>
          </div>
        </div>
      </div>

      <style jsx="true" global="true">{`
        .dynamic-marker {
          transition: all 0.3s ease;
        }
        
        .dynamic-marker:hover {
          transform: scale(1.2);
        }
        
        .leaflet-container {
          background: transparent !important;
        }
        
        .leaflet-control-zoom {
          display: none !important;
        }
        
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default Map;