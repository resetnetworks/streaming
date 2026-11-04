import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LuMaximize2, LuMinimize2 } from 'react-icons/lu';

// Dynamic icon creator based on region importance
const createIcon = (zoomLevel, importance = 'medium') => {
  const baseSizes = {
    high: 28,
    medium: 20,
    low: 14,
  };

  const sizeMultiplier = Math.max(0.7, 1 + (zoomLevel - 3) * 0.15);
  const baseSize = baseSizes[importance] || 20;
  const finalSize = Math.max(12, Math.min(48, Math.round(baseSize * sizeMultiplier)));

  return new L.Icon({
    iconUrl: '/pointer.svg',
    iconSize: [finalSize, finalSize],
    iconAnchor: [finalSize / 2, finalSize / 2],
    className: 'dynamic-marker',
  });
};

// Component to handle map sizing, resize events, and zoom changes cleanly
const MapController = ({ onZoomChange }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Invalidate size immediately and after mount ticks to ensure tiles render edge-to-edge
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    map.on('zoomend', handleZoom);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
};

const Map = ({ listeners = [] }) => {
  const [zoomLevel, setZoomLevel] = useState(1.5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Keyboard accessibility: ESC key exits fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Fullscreen map view (Clean world view)
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#080d1a] flex flex-col">
        {/* Fullscreen Exit Button */}
        <button 
          onClick={handleCloseFullscreen}
          className="absolute top-4 right-4 z-[10000] flex items-center gap-2 bg-[#070b14]/90 hover:bg-[#11192e] text-white rounded-lg px-4 py-2 shadow-2xl border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-xs font-bold uppercase tracking-wider"
          title="Exit Fullscreen (Esc)"
        >
          <LuMinimize2 className="w-4 h-4 text-[#38bdf8]" />
          <span>Exit Fullscreen</span>
        </button>

        <div className="relative w-full h-full flex-1">
          <MapContainer 
            center={[20, 0]}
            zoom={2} 
            minZoom={1}
            maxZoom={18}
            worldCopyJump={true}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={true}
            dragging={true}
            doubleClickZoom={true}
          >
            <ZoomControl position="bottomright" />
            <MapController onZoomChange={setZoomLevel} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            {listeners.map((l) => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={createIcon(zoomLevel, l.importance)}
              />
            ))}
          </MapContainer>
        </div>

        <style>{`
          .dynamic-marker {
            transition: all 0.3s ease;
          }
          .dynamic-marker:hover {
            transform: scale(1.2);
          }
          .leaflet-container {
            background: #080d1a !important;
            cursor: grab !important;
            height: 100% !important;
            width: 100% !important;
          }
          .leaflet-container:active {
            cursor: grabbing !important;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
          .leaflet-control-zoom {
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6) !important;
            margin-right: 18px !important;
            margin-bottom: 18px !important;
          }
          .leaflet-control-zoom a {
            background: #080d1a !important;
            color: #e2e8f0 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            width: 34px !important;
            height: 34px !important;
            line-height: 34px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            transition: all 0.2s ease !important;
          }
          .leaflet-control-zoom a:hover {
            background: #1e293b !important;
            color: #38bdf8 !important;
          }
        `}</style>
      </div>
    );
  }

  // Normal Map Component (Embedded in Dashboard)
  const innerPanel3dStyle = {
    background: "radial-gradient(ellipse at 50% 0%, #0d1527 0%, #050811 100%)",
    boxShadow:
      "inset 0 2px 4px rgba(255, 255, 255, 0.05), inset 0 -4px 8px rgba(0, 0, 0, 0.8), 0 8px 24px rgba(0, 0, 0, 0.6)",
  };

  return (
    <div className="rounded-[12px] p-[1px] bg-gradient-to-br from-white to-[#0c0d0d] h-full flex flex-col w-full shadow-2xl">
      <div
        className="p-5 rounded-[10px] relative h-full flex flex-col justify-between"
        style={innerPanel3dStyle}
      >
        {/* Header with Title and Expand Button - AT THE TOP ABOVE THE MAP */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <h2 className="text-white text-xl font-bold tracking-tight">Top Countries/Regions</h2>

          {/* Expand Button in Header */}
          <button
            type="button"
            onClick={handleOpenFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0b1120 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
            }}
            title="Expand Map to Fullscreen"
          >
            <LuMaximize2 className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Expand</span>
          </button>
        </div>

        {/* 3D Sunken Well Map Canvas (Completely clean - ZERO elements on top) */}
        <div
          className="w-full flex-1 min-h-[310px] h-[310px] rounded-[8px] overflow-hidden relative"
          style={{
            background: "#060911",
            border: "1px solid rgba(0, 0, 0, 0.95)",
            boxShadow:
              "inset 0 3px 6px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(0, 0, 0, 0.95), 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <MapContainer 
            center={[20, 0]}
            zoom={1.5} 
            minZoom={1}
            maxZoom={18}
            worldCopyJump={true}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={true}
            dragging={true}
            doubleClickZoom={true}
          >
            <ZoomControl position="bottomright" />
            <MapController onZoomChange={setZoomLevel} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            {listeners.map((l) => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={createIcon(zoomLevel, l.importance)}
              />
            ))}
          </MapContainer>
        </div>

        <style>{`
          .dynamic-marker {
            transition: all 0.3s ease;
          }
          
          .dynamic-marker:hover {
            transform: scale(1.2);
          }
          
          .leaflet-container {
            background: #060911 !important;
            cursor: grab !important;
            height: 100% !important;
            width: 100% !important;
          }
          
          .leaflet-container:active {
            cursor: grabbing !important;
          }
          
          .leaflet-grab {
            cursor: grab !important;
          }
          
          .leaflet-grabbing {
            cursor: grabbing !important;
          }
          
          .leaflet-control-zoom {
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6) !important;
            margin-right: 14px !important;
            margin-bottom: 14px !important;
          }
          
          .leaflet-control-zoom a {
            background: #080d1a !important;
            color: #e2e8f0 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            width: 30px !important;
            height: 30px !important;
            line-height: 30px !important;
            font-size: 15px !important;
            font-weight: bold !important;
            transition: all 0.2s ease !important;
          }
          
          .leaflet-control-zoom a:hover {
            background: #1e293b !important;
            color: #38bdf8 !important;
          }
          
          .leaflet-control-attribution {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Map;