import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  startLocation: string;
  endLocation: string;
  startCoords?: { lat: number; lng: number };
  endCoords?: { lat: number; lng: number };
}

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function LocationMap({ startLocation, endLocation, startCoords, endCoords }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeControlRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Initialize map centered on Athens, Greece
      const map = L.map(mapRef.current, {
        center: [37.9838, 23.7275],
        zoom: 10,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Failed to load map');
      setIsLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Clear existing route
    if (routeControlRef.current) {
      map.removeControl(routeControlRef.current);
      routeControlRef.current = null;
    }

    const markers: L.Marker[] = [];
    const bounds = L.latLngBounds([]);

    // Add start marker
    if (startCoords) {
      const startIcon = L.divIcon({
        html: '<div style="background: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: 'custom-marker'
      });

      const startMarker = L.marker([startCoords.lat, startCoords.lng], { 
        icon: startIcon 
      }).addTo(map);
      
      startMarker.bindPopup(`<strong>Pick-up:</strong><br>${startLocation}`);
      markers.push(startMarker);
      bounds.extend([startCoords.lat, startCoords.lng]);
    }

    // Add end marker
    if (endCoords) {
      const endIcon = L.divIcon({
        html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: 'custom-marker'
      });

      const endMarker = L.marker([endCoords.lat, endCoords.lng], { 
        icon: endIcon 
      }).addTo(map);
      
      endMarker.bindPopup(`<strong>Drop-off:</strong><br>${endLocation}`);
      markers.push(endMarker);
      bounds.extend([endCoords.lat, endCoords.lng]);
    }

    markersRef.current = markers;

    // If we have both coordinates, try to show a route
    if (startCoords && endCoords) {
      fetchRoute(startCoords, endCoords, map);
    }

    // Fit map to show all markers
    if (markers.length > 0) {
      if (markers.length === 1) {
        map.setView([markers[0].getLatLng().lat, markers[0].getLatLng().lng], 15);
      } else {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [startLocation, endLocation, startCoords, endCoords]);

  const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }, map: L.Map) => {
    // Calculate straight-line distance for display
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    try {
      // Try OpenRouteService API with better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d3c1d36c6c574aa1bbf04d63bb0fb0cf&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        }
      ).catch(() => null); // Return null on fetch error

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const data = await response.json();
        if (data.features && data.features[0]) {
          const coordinates = data.features[0].geometry.coordinates;
          const latLngs = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          
          const polyline = L.polyline(latLngs, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8
          }).addTo(map);

          // Add distance and duration info
          const summary = data.features[0].properties.summary;
          const distance = (summary.distance / 1000).toFixed(1);
          const duration = Math.round(summary.duration / 60);

          const routeInfo = L.control({ position: 'topright' });
          routeInfo.onAdd = () => {
            const div = L.DomUtil.create('div', 'route-info');
            div.style.background = 'white';
            div.style.padding = '8px';
            div.style.borderRadius = '4px';
            div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            div.innerHTML = `
              <div style="font-size: 12px; font-weight: bold;">Route Info</div>
              <div style="font-size: 11px;">Distance: ${distance} km</div>
              <div style="font-size: 11px;">Duration: ~${duration} min</div>
            `;
            return div;
          };
          routeInfo.addTo(map);
          return; // Successfully added route
        }
      }
    } catch (error) {
      // API failed, use fallback
      console.warn('Route API unavailable, using straight line');
    }

    // Fallback: draw straight line with estimated distance
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const estimatedDuration = Math.round(distance / 50 * 60); // Rough estimate: 50 km/h average

    const straightLine = L.polyline([
      [start.lat, start.lng],
      [end.lat, end.lng]
    ], {
      color: '#94a3b8',
      weight: 3,
      opacity: 0.7,
      dashArray: '8, 12'
    }).addTo(map);

    // Add estimated distance info
    const routeInfo = L.control({ position: 'topright' });
    routeInfo.onAdd = () => {
      const div = L.DomUtil.create('div', 'route-info');
      div.style.background = 'white';
      div.style.padding = '8px';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      div.innerHTML = `
        <div style="font-size: 12px; font-weight: bold;">Estimated Route</div>
        <div style="font-size: 11px;">Distance: ~${distance.toFixed(1)} km</div>
        <div style="font-size: 11px;">Duration: ~${estimatedDuration} min</div>
        <div style="font-size: 10px; color: #666;">Straight line estimate</div>
      `;
      return div;
    };
    routeInfo.addTo(map);
  };

  if (error) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="mb-2">🗺️ Route Preview</div>
          <div className="text-sm">
            <div className="font-semibold text-green-600">📍 From: {startLocation || 'Pick-up location'}</div>
            <div className="my-1">↓</div>
            <div className="font-semibold text-red-600">📍 To: {endLocation || 'Drop-off location'}</div>
          </div>
          <div className="text-xs text-red-600 mt-2">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 relative rounded-lg overflow-hidden border z-10">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Loading map...</div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      {!startLocation && !endLocation && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="mb-2">🗺️</div>
            <div className="text-sm">Enter pickup and dropoff locations to see route</div>
          </div>
        </div>
      )}
    </div>
  );
}