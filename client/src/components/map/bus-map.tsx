import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Bus, Home, School } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 3px solid white;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const busIcon = createCustomIcon("#6366f1"); // Primary blue
const homeIcon = L.divIcon({
  className: "custom-home-icon",
  html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 2px solid white;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const schoolIcon = L.divIcon({
  className: "custom-school-icon",
  html: `<div style="background-color: #f59e0b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 2px solid white;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface BusMapProps {
  buses: Array<{ id: number; busNumber: string; currentLat: number | null; currentLng: number | null; status: string }>;
  center?: [number, number];
  zoom?: number;
  showGeofence?: boolean;
  homeLocation?: [number, number];
  schoolLocation?: [number, number];
  onMapClick?: (lat: number, lng: number) => void;
}

export function BusMap({ buses, center = [24.7136, 46.6753], zoom = 13, showGeofence = false, homeLocation, schoolLocation, onMapClick }: BusMapProps) {
  // Fix for React Leaflet SSR issues
  const [mounted, setMounted] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (homeLocation && schoolLocation) {
      // Fetch route from OSRM
      fetch(`https://router.project-osrm.org/route/v1/driving/${schoolLocation[1]},${schoolLocation[0]};${homeLocation[1]},${homeLocation[0]}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
            setRoute(coords);
          } else {
            setRoute([schoolLocation, homeLocation]);
          }
        })
        .catch(() => setRoute([schoolLocation, homeLocation]));
    } else {
      setRoute([]);
    }
  }, [homeLocation, schoolLocation]);

  if (!mounted) return <div className="w-full h-full bg-muted rounded-xl animate-pulse"></div>;

  const MapEvents = () => {

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border/50 shadow-md">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Clean, modern tile theme
        />
        
        <MapEvents />
        {buses.map(bus => {
          if (!bus.currentLat || !bus.currentLng) return null;
          return (
            <Marker key={bus.id} position={[bus.currentLat, bus.currentLng]} icon={busIcon}>
              <Popup className="rounded-lg font-sans">
                <div className="p-1">
                  <p className="font-bold text-base mb-1 font-display">Bus {bus.busNumber}</p>
                  <p className="text-sm flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${bus.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {bus.status === 'active' ? 'In Transit' : 'Inactive'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {homeLocation && (
          <Marker position={homeLocation} icon={homeIcon}>
             <Popup>Home</Popup>
          </Marker>
        )}

        {schoolLocation && (
          <Marker position={schoolLocation} icon={schoolIcon}>
             <Popup>School</Popup>
          </Marker>
        )}

        {route.length > 0 && (
          <Polyline positions={route} color="#6366f1" weight={4} opacity={0.7} />
        )}

        {showGeofence && homeLocation && (
          <Circle 
            center={homeLocation} 
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} 
            radius={1000} // 1km geofence
          />
        )}
      </MapContainer>
    </div>
  );
}
