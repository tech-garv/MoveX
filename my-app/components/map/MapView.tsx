"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// --- FIX: Leaflet Icons in Next.js (Excellent addition!) ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  pickupCoords: { lat: number; lon: number } | null;
  dropCoords: { lat: number; lon: number } | null;
};

export default function MapView({ pickupCoords, dropCoords }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const LOCATIONIQ_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  // 1. Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false, // Cleaner UI
      attributionControl: false // Hides the copyright text for a cleaner look (optional)
    }).setView([28.7041, 77.1025], 11);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(mapInstance.current);

    markersRef.current = L.layerGroup().addTo(mapInstance.current);
  }, []);

  // 2. Handle Markers & Route
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;

    markersRef.current.clearLayers();
    if (routeLayerRef.current) {
      mapInstance.current.removeLayer(routeLayerRef.current);
    }

    // --- PICKUP MARKER ---
    if (pickupCoords) {
      // Added 'animate-pulse' class for a premium "alive" feel
      const pickupIcon = L.divIcon({
        className: "custom-icon",
        html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg shadow-black/30"></div>`,
        iconSize: [16, 16], // Match w-4 h-4
        iconAnchor: [8, 8]  // Center it
      });

      L.marker([pickupCoords.lat, pickupCoords.lon], { icon: pickupIcon }).addTo(markersRef.current);

      // PREMIUM TWEAK: Use flyTo instead of setView for smooth animation
      if (!dropCoords) {
        mapInstance.current.flyTo([pickupCoords.lat, pickupCoords.lon], 14, {
          duration: 1.5 // Speed of flight
        });
      }
    }

    // --- DROP MARKER ---
    if (dropCoords) {
      const dropIcon = L.divIcon({
        className: "custom-icon",
        html: `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg shadow-black/30"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([dropCoords.lat, dropCoords.lon], { icon: dropIcon }).addTo(markersRef.current);

      if (!pickupCoords) {
        mapInstance.current.flyTo([dropCoords.lat, dropCoords.lon], 14, {
           duration: 1.5
        });
      }
    }

    // --- DRAW ROUTE ---
    if (pickupCoords && dropCoords) {
      getRoute(pickupCoords, dropCoords);
    }
  }, [pickupCoords, dropCoords]);

  const getRoute = async (pickup: any, drop: any) => {
    try {
      const url = `https://us1.locationiq.com/v1/directions/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`;

      const res = await axios.get(url);
      const routeData = res.data.routes[0].geometry;

      if (mapInstance.current) {
        routeLayerRef.current = L.geoJSON(routeData, {
          style: { color: "#111", weight: 6, opacity: 0.9, lineCap: 'round' } // Thicker, darker line
        }).addTo(mapInstance.current);

        // Smooth zoom to fit the whole trip
        mapInstance.current.flyToBounds([
          [pickup.lat, pickup.lon],
          [drop.lat, drop.lon]
        ], { padding: [100, 100], duration: 1.5 });
      }

    } catch (e) {
      console.log("Routing Failed:", e);
    }
  };

  return <div ref={mapRef} className="w-full h-full" />;
}