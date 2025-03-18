
import React, { useEffect, useRef, useState } from 'react';
import { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationMapProps {
  locations: Location[];
  className?: string;
  onLocationSelect?: (location: Location) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  locations, 
  className,
  onLocationSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initializeMap = async () => {
    if (!mapContainer.current || !mapApiKey || mapRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = (await import('mapbox-gl')).default;
      
      // Import CSS
      import('mapbox-gl/dist/mapbox-gl.css');
      
      // Initialize map
      mapboxgl.accessToken = mapApiKey;
      
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [10.0010, 53.5500], // Hamburg coordinates
        zoom: 11,
        pitch: 20,
        attributionControl: false
      });
      
      mapRef.current = map;
      
      // Add navigation controls
      map.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );
      
      // Add markers for each location
      locations.forEach(location => {
        const [lng, lat] = location.coordinates;
        
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'flex flex-col items-center';
        
        const pinContainer = document.createElement('div');
        pinContainer.className = `relative w-10 h-10 flex items-center justify-center 
          bg-white rounded-full shadow-lg cursor-pointer transition-transform
          duration-300 hover:scale-110 border-2 border-primary`;
        
        const visitCount = document.createElement('span');
        visitCount.className = 'text-sm font-bold text-primary';
        visitCount.innerText = String(location.visitCount);
        
        pinContainer.appendChild(visitCount);
        markerEl.appendChild(pinContainer);
        
        // Create popup
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,
          className: 'location-popup'
        }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${location.name}</h3>
            <p class="text-xs text-muted-foreground">${location.address}</p>
            <p class="text-xs font-medium mt-1">${location.visitCount} Besuche</p>
          </div>
        `);
        
        // Add marker to map
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
        
        // Add event listeners
        markerEl.addEventListener('click', () => {
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        });
      });
      
      // Add custom styles for the popup
      const style = document.createElement('style');
      style.innerHTML = `
        .location-popup .mapboxgl-popup-content {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `;
      document.head.appendChild(style);
      
      // Fly to bounds that include all markers
      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(location => {
          bounds.extend(location.coordinates);
        });
        
        map.fitBounds(bounds, {
          padding: 100,
          duration: 1000
        });
      }
      
      map.on('load', () => {
        setIsMapLoaded(true);
        setIsLoading(false);
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mapApiKey) {
      initializeMap();
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapApiKey, locations]);

  const handleKeySubmit = () => {
    if (mapApiKey) {
      initializeMap();
    }
  };

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {!isMapLoaded && (
        <div className="p-4 bg-white border border-border rounded-lg">
          <h3 className="text-sm font-medium mb-2">Mapbox API-Schlüssel eingeben</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Um die Karte anzuzeigen, benötigen Sie einen Mapbox API-Schlüssel. 
            Besuchen Sie <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a> und erstellen Sie einen kostenlosen Account.
          </p>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="pk.eyJ1Ijoi..."
              value={mapApiKey}
              onChange={(e) => setMapApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleKeySubmit} disabled={!mapApiKey || isLoading}>
              {isLoading ? "Wird geladen..." : "Anzeigen"}
            </Button>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className={cn(
          "w-full h-[400px] rounded-lg overflow-hidden border border-border/50 shadow-sm bg-secondary/50",
          !isMapLoaded && "flex items-center justify-center"
        )}
      >
        {!isMapLoaded && !isLoading && !mapApiKey && (
          <div className="text-muted-foreground text-sm">
            Bitte geben Sie einen API-Schlüssel ein, um die Karte zu laden
          </div>
        )}
        {!isMapLoaded && isLoading && (
          <div className="text-muted-foreground text-sm animate-pulse">
            Karte wird geladen...
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMap;
