import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const wasteData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Rosterman Dumpsite",
        type: "informal",
        category: "Informal Dumping Site",
        description:
          "Main dumping site in Rosterman. Over 95% of waste arriving is mixed. County government collaborates with local community groups to manage the site.",
        status: "Active",
        challenges: "Mixed waste, lack of segregation at source",
        image: "images/disposal worker.jpg",
      },
      geometry: {
        type: "Point",
        coordinates: [34.72066, 0.25509],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Regen Organics Fertilizer Processing Plant",
        type: "processing",
        category: "Waste Processing Facility",
        description:
          "Located in Mumias, processes organic waste into fertilizer. Accepts only organic waste for composting.",
        status: "Operational",
        challenges:
          "Small amounts of plastic often mixed in, requiring segregation",
      },
      geometry: {
        type: "Point",
        coordinates: [34.48796, 0.33474],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Khayenga Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Located near Khayenga Market. Managed by Khayenga Self Help Group. Compartments for biodegradable and non-biodegradable waste are clearly marked.",
        status: "Active",
        challenges: "Local community unaware of need to separate waste",
        image: "images/khayega refuse.jpg",
      },
      geometry: {
        type: "Point",
        coordinates: [34.77152, 0.20819],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Lurambi Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Located in Lurambi Market. Operated by well-organized youth and community groups. Compartments for biodegradable and non-biodegradable waste.",
        status: "Active",
        challenges: "Waste often mixed despite compartmentalization",
        image: "images/lurambi waste.jpg",
      },
      geometry: {
        type: "Point",
        coordinates: [34.76485, 0.2998],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Sichirayi Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Formal waste collection point in Sichirayi area. Part of the municipal waste management system.",
        status: "Active",
        challenges: "Requires better community awareness for waste segregation",
      },
      geometry: {
        type: "Point",
        coordinates: [34.745, 0.315],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Masingo Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Located close to fresh food market. Majority of waste is organic. Informal dumping site exists nearby.",
        status: "Active",
        challenges: "Informal dumping site just 10 meters away",
        image: "images/bird image.jpg",
      },
      geometry: {
        type: "Point",
        coordinates: [34.7505, 0.285],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Amelemba Scheme Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Formal waste collection point in Amelemba Scheme area.",
        status: "Active",
        challenges: "Community engagement needed for proper waste segregation",
      },
      geometry: {
        type: "Point",
        coordinates: [34.755, 0.295],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Mevic Waste Management",
        type: "plastic",
        category: "Plastic Waste Collection Yard",
        description:
          "Plastic waste collection yard managed by Mevic Waste Management. Specializes in plastic, metal, and paper/carton collection.",
        status: "Operational",
        challenges: "Vested interests in plastic/metal discourage organic waste focus",
      },
      geometry: {
        type: "Point",
        coordinates: [34.753, 0.283],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Kambi Somali Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Refuse chamber in Kambi Somali area. Built within market walls with narrow passages.",
        status: "Active",
        challenges: "Narrow passages limit proper waste collection and segregation",
      },
      geometry: {
        type: "Point",
        coordinates: [34.752, 0.286],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Shirere Waste Collection",
        type: "formal",
        category: "Formal Waste Receptacle",
        description: "Waste collection point in Shirere Ward.",
        status: "Active",
        challenges: "Community awareness needed",
      },
      geometry: {
        type: "Point",
        coordinates: [34.735, 0.265],
      },
    },
  ],
};

const icons = {
  formal: L.divIcon({
    className: "custom-marker",
    html: '<div style="background-color: #006400; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  informal: L.divIcon({
    className: "custom-marker",
    html: '<div style="background-color: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  processing: L.divIcon({
    className: "custom-marker",
    html: '<div style="background-color: #3498db; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  plastic: L.divIcon({
    className: "custom-marker",
    html: '<div style="background-color: #f39c12; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 18px;">📍</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const map = L.map(mapContainer.current);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 2,
    }).addTo(map);

    // Load and display Kakamega County GeoJSON
    fetch("/Kakamega County.geojson")
      .then((response) => response.json())
      .then((data: any) => {
        const aoiLayer = L.geoJSON(data, {
          style: {
            color: "black",
            weight: 2,
            opacity: 1,
            fillOpacity: 0,
          },
        });
        aoiLayer.addTo(map);
      })
      .catch((error) => console.error("Error loading the GeoJSON file:", error));

    // Create waste sites layer for bounds
    const wasteSitesLayer = L.geoJSON(wasteData as any);
    map.fitBounds(wasteSitesLayer.getBounds());

    // Create layer groups
    const layers: Record<string, L.LayerGroup> = {
      formal: L.layerGroup(),
      informal: L.layerGroup(),
      processing: L.layerGroup(),
      plastic: L.layerGroup(),
    };

    Object.values(layers).forEach((layer) => layer.addTo(map));

    // Add markers to layers
    wasteData.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      const type = props.type;

      let popupContent = `
        <div style="font-family: Arial, sans-serif; max-width: 300px;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px;">${props.name}</h3>
          <p style="margin: 5px 0;"><strong>Category:</strong> ${props.category}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${props.status}</p>
          <p style="margin: 5px 0;"><strong>Description:</strong> ${props.description}</p>
          <p style="margin: 5px 0;"><strong>Challenges:</strong> ${props.challenges}</p>
          <button class="get-directions-btn" data-lat="${coords[1]}" data-lon="${coords[0]}" style="margin-top: 10px; padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Get Directions</button>
      `;

      if (props.image) {
        popupContent += `<img src="${props.image}" alt="${props.name}" style="margin-top: 10px; max-width: 100%; border-radius: 4px;">`;
      }

      popupContent += `</div>`;

      const marker = L.marker([coords[1], coords[0]], { icon: icons[type as keyof typeof icons] }).bindPopup(
        popupContent
      );

      layers[type as keyof typeof layers].addLayer(marker);
    });

    // Layer toggle listeners
    const formalCheckbox = document.getElementById("layer-formal") as HTMLInputElement;
    const informalCheckbox = document.getElementById("layer-informal") as HTMLInputElement;
    const processingCheckbox = document.getElementById("layer-processing") as HTMLInputElement;
    const plasticCheckbox = document.getElementById("layer-plastic") as HTMLInputElement;

    if (formalCheckbox) {
      formalCheckbox.addEventListener("change", (e) => {
        if ((e.target as HTMLInputElement).checked) {
          map.addLayer(layers.formal);
        } else {
          map.removeLayer(layers.formal);
        }
      });
    }

    if (informalCheckbox) {
      informalCheckbox.addEventListener("change", (e) => {
        if ((e.target as HTMLInputElement).checked) {
          map.addLayer(layers.informal);
        } else {
          map.removeLayer(layers.informal);
        }
      });
    }

    if (processingCheckbox) {
      processingCheckbox.addEventListener("change", (e) => {
        if ((e.target as HTMLInputElement).checked) {
          map.addLayer(layers.processing);
        } else {
          map.removeLayer(layers.processing);
        }
      });
    }

    if (plasticCheckbox) {
      plasticCheckbox.addEventListener("change", (e) => {
        if ((e.target as HTMLInputElement).checked) {
          map.addLayer(layers.plastic);
        } else {
          map.removeLayer(layers.plastic);
        }
      });
    }

    // Add scale control
    L.control
      .scale({
        imperial: false,
        metric: true,
      })
      .addTo(map);

    // Add attribution
    map.attributionControl.addAttribution(
      "CE4HOW Project | Practical Action & Regen Organics"
    );

    console.log(
      "Map initialized successfully with",
      wasteData.features.length,
      "waste management sites."
    );

    // Get Directions button handler - opens Google Maps
    document.addEventListener("click", function (e) {
      const target = e.target as HTMLElement;
      if (target && target.matches(".get-directions-btn")) {
        const destLat = parseFloat(target.dataset.lat || "0");
        const destLon = parseFloat(target.dataset.lon || "0");
        
        // Open Google Maps with destination
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`;
        window.open(mapsUrl, "_blank");
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-input">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

