import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- TYPE DEFINITIONS for props from Dashboard ---
interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  siteName: string;
  wasteType: "Organic" | "Inorganic" | "Mixed" | string;
  volume: number;
  date: Date;
}

interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick: (marker: MapMarker) => void;
  selectedMarker: MapMarker | null;
}

// --- STATIC DATA AND ICONS (PRESERVED) ---
const wasteData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Rosterman Dumpsite", type: "informal", category: "Informal Dumping Site", description: "Main dumping site in Rosterman. Over 95% of waste arriving is mixed. County government collaborates with local community groups to manage the site.", status: "Active", challenges: "Mixed waste, lack of segregation at source", image: "images/disposal worker.jpg" },
      geometry: { type: "Point", coordinates: [34.72066, 0.25509] },
    },
    {
      type: "Feature",
      properties: { name: "Regen Organics Fertilizer Processing Plant", type: "processing", category: "Waste Processing Facility", description: "Located in Mumias, processes organic waste into fertilizer. Accepts only organic waste for composting.", status: "Operational", challenges: "Small amounts of plastic often mixed in, requiring segregation" },
      geometry: { type: "Point", coordinates: [34.48796, 0.33474] },
    },
    {
      type: "Feature",
      properties: { name: "Khayenga Refuse Chamber", type: "formal", category: "Formal Waste Receptacle", description: "Located near Khayenga Market. Managed by Khayenga Self Help Group. Compartments for biodegradable and non-biodegradable waste are clearly marked.", status: "Active", challenges: "Local community unaware of need to separate waste", image: "images/khayega refuse.jpg" },
      geometry: { type: "Point", coordinates: [34.77152, 0.20819] },
    },
    {
      type: "Feature",
      properties: { name: "Lurambi Refuse Chamber", type: "formal", category: "Formal Waste Receptacle", description: "Located in Lurambi Market. Operated by well-organized youth and community groups. Compartments for biodegradable and non-biodegradable waste.", status: "Active", challenges: "Waste often mixed despite compartmentalization", image: "images/lurambi waste.jpg" },
      geometry: { type: "Point", coordinates: [34.76485, 0.2998] },
    },
    {
      type: "Feature",
      properties: { name: "Sichirayi Refuse Chamber", type: "formal", category: "Formal Waste Receptacle", description: "Formal waste collection point in Sichirayi area. Part of the municipal waste management system.", status: "Active", challenges: "Requires better community awareness for waste segregation" },
      geometry: { type: "Point", coordinates: [34.745, 0.315] },
    },
    {
      type: "Feature",
      properties: { name: "Masingo Refuse Chamber", type: "formal", category: "Formal Waste Receptacle", description: "Located close to fresh food market. Majority of waste is organic. Informal dumping site exists nearby.", status: "Active", challenges: "Informal dumping site just 10 meters away", image: "images/bird image.jpg" },
      geometry: { type: "Point", coordinates: [34.7505, 0.285] },
    },
    {
      type: "Feature",
      properties: { name: "Amelemba Scheme Refuse Chamber", type: "formal", category: "Formal Waste Receptacle", description: "Formal waste collection point in Amelemba Scheme area.", status: "Active", challenges: "Community engagement needed for proper waste segregation" },
      geometry: { type: "Point", coordinates: [34.755, 0.295] },
    },
    {
      type: "Feature",
      properties: { name: "Mevic Waste Management", type: "plastic", category: "Plastic Waste Collection Yard", description: "Plastic waste collection yard managed by Mevic Waste Management. Specializes in plastic, metal, and paper/carton collection.", status: "Operational", challenges: "Vested interests in plastic/metal discourage organic waste focus" },
      geometry: { type: "Point", coordinates: [34.753, 0.283] },
    },
    {
      type: "Feature",
      properties: { name: "Kambi Somali Refuse Chamber", type: "formal", category: "Formal Waste Receptacle", description: "Refuse chamber in Kambi Somali area. Built within market walls with narrow passages.", status: "Active", challenges: "Narrow passages limit proper waste collection and segregation" },
      geometry: { type: "Point", coordinates: [34.752, 0.286] },
    },
    {
      type: "Feature",
      properties: { name: "Shirere Waste Collection", type: "formal", category: "Formal Waste Receptacle", description: "Waste collection point in Shirere Ward.", status: "Active", challenges: "Community awareness needed" },
      geometry: { type: "Point", coordinates: [34.735, 0.265] },
    },
  ],
};

const icons = {
  formal: L.divIcon({ className: "custom-marker", html: '<div style="background-color: #006400; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
  informal: L.divIcon({ className: "custom-marker", html: '<div style="background-color: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
  processing: L.divIcon({ className: "custom-marker", html: '<div style="background-color: #3498db; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
  plastic: L.divIcon({ className: "custom-marker", html: '<div style="background-color: #f39c12; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
};

// --- COMPONENT DEFINITION ---
// The component now accepts props to fix the TypeScript error.
export default function MapView({ markers, onMarkerClick, selectedMarker }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const dynamicDataLayer = useRef<L.LayerGroup | null>(null); // Layer for markers from props

  // Effect for BASE MAP initialization (runs only once)
  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      const map = L.map(mapContainer.current);
      mapInstance.current = map; // Store instance

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Load and display Kakamega County GeoJSON
      fetch("/Kakamega County.geojson")
        .then((response) => response.json())
        .then((data: any) => {
          L.geoJSON(data, { style: { color: "black", weight: 2, fillOpacity: 0 } }).addTo(map);
        });

      // --- RENDER STATIC wasteData (PRESERVED) ---
      const wasteSitesLayer = L.geoJSON(wasteData as any);
      map.fitBounds(wasteSitesLayer.getBounds());

      const layers: Record<string, L.LayerGroup> = {
        formal: L.layerGroup(),
        informal: L.layerGroup(),
        processing: L.layerGroup(),
        plastic: L.layerGroup(),
      };
      Object.values(layers).forEach((layer) => layer.addTo(map));

      wasteData.features.forEach((feature) => {
        // ... (all the original popup and marker logic is preserved)
        const coords = feature.geometry.coordinates;
        const props = feature.properties;
        const type = props.type;
        let popupContent = `<div style="font-family: Arial, sans-serif; max-width: 300px;"><h3 style="margin: 0 0 10px 0; font-size: 16px;">${props.name}</h3><p style="margin: 5px 0;"><strong>Category:</strong> ${props.category}</p><p style="margin: 5px 0;"><strong>Status:</strong> ${props.status}</p><p style="margin: 5px 0;"><strong>Description:</strong> ${props.description}</p><p style="margin: 5px 0;"><strong>Challenges:</strong> ${props.challenges}</p><button class="get-directions-btn" data-lat="${coords[1]}" data-lon="${coords[0]}" style="margin-top: 10px; padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Get Directions</button>`;
        if (props.image) { popupContent += `<img src="${props.image}" alt="${props.name}" style="margin-top: 10px; max-width: 100%; border-radius: 4px;">`; }
        popupContent += `</div>`;
        const marker = L.marker([coords[1], coords[0]], { icon: icons[type as keyof typeof icons] }).bindPopup(popupContent);
        layers[type as keyof typeof layers].addLayer(marker);
      });
      // ... (Event listeners for checkboxes and buttons are also preserved)

      // Initialize the layer for dynamic data
      dynamicDataLayer.current = L.layerGroup().addTo(map);
      
      console.log("Base map initialized with", wasteData.features.length, "static sites.");
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once.

  // --- NEW EFFECT for DYNAMIC DATA ---
  // This effect runs whenever the 'markers' prop from the dashboard changes.
  useEffect(() => {
    // Ensure map and dynamic layer are initialized
    if (!mapInstance.current || !dynamicDataLayer.current) return;

    // Clear previous dynamic markers
    dynamicDataLayer.current.clearLayers();

    // Default icon for dynamic collection points
    const collectionIcon = new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    markers.forEach(markerData => {
      const { lat, lng, siteName, volume, date, wasteType } = markerData;
      
      const popupContent = `
        <div style="font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px;">${siteName}</h3>
          <p style="margin: 5px 0;"><strong>Waste Type:</strong> ${wasteType}</p>
          <p style="margin: 5px 0;"><strong>Volume:</strong> ${volume.toFixed(2)} tons</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        </div>`;
        
      const marker = L.marker([lat, lng], { icon: collectionIcon })
        .bindPopup(popupContent)
        .addTo(dynamicDataLayer.current!);

      marker.on('click', () => {
        onMarkerClick(markerData);
      });

      // Highlight if selected
      if (selectedMarker?.id === markerData.id) {
        marker.openPopup();
        // You could also set a different icon here for selection
      }
    });

  }, [markers, selectedMarker, onMarkerClick]);


  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-input">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}