"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  pickupCoords: { lat: number; lon: number } | null;
  dropCoords: { lat: number; lon: number } | null;
  onRouteComputed: (info: {
    distanceKm: number;
    durationMin: number;
    geometry: any;
  }) => void;
  selectedRouteType: "eco" | "fast" | "scenic";
  animateCar?: boolean;

  // ⭐ NEW: LIVE DRIVER POSITION
  driverCoords?: { lat: number; lon: number } | null;

  darkMode?: boolean;
};

export default function MapView({
  pickupCoords,
  dropCoords,
  onRouteComputed,
  selectedRouteType,
  animateCar = false,
  driverCoords = null,
  darkMode = false,
}: Props) {
  // Refs
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const routeLayer = useRef<L.GeoJSON | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);

  const carMarker = useRef<L.Marker | null>(null);
  const driverMarker = useRef<L.Marker | null>(null);

  const rafID = useRef<number | null>(null);
  const path = useRef<[number, number][] | null>(null);
  const animIndex = useRef<number>(0);

  const LOCATIONIQ_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  /* ----------------------------- INIT MAP ------------------------------ */
  useEffect(() => {
    if (map.current || !mapRef.current) return;

    map.current = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: false,
    }).setView([28.7041, 77.1025], 12);

    // default tile
    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayer.current = L.tileLayer(url, {
      attribution: "&copy; OpenStreetMap & CARTO",
    }).addTo(map.current);

    markersLayer.current = L.layerGroup().addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [darkMode]);

  /* ----------------------------- THEME SWITCH --------------------------- */
  useEffect(() => {
    if (!map.current) return;

    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    if (tileLayer.current) {
      map.current.removeLayer(tileLayer.current);
    }

    tileLayer.current = L.tileLayer(url, {
      attribution: "&copy; OpenStreetMap & CARTO",
    });

    tileLayer.current.addTo(map.current);
  }, [darkMode]);

  /* ----------------------- CLEAR ROUTE & CAR ----------------------------- */
  const clearRouteAndCar = () => {
    if (routeLayer.current && map.current) {
      map.current.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }
    if (carMarker.current && map.current) {
      map.current.removeLayer(carMarker.current);
      carMarker.current = null;
    }
    if (rafID.current) cancelAnimationFrame(rafID.current);

    path.current = null;
    animIndex.current = 0;
  };

  /* ---------------------- DRAW MARKERS + ROUTE --------------------------- */
  useEffect(() => {
    if (!map.current || !markersLayer.current) return;

    markersLayer.current.clearLayers();
    clearRouteAndCar();

    // Pickup marker
    if (pickupCoords) {
      L.marker([pickupCoords.lat, pickupCoords.lon], {
        icon: L.divIcon({
          className: "",
          html:
            '<div style="width:16px;height:16px;background:#16a34a;border-radius:50%;border:2px solid white"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(markersLayer.current);

      if (!dropCoords) map.current.flyTo([pickupCoords.lat, pickupCoords.lon], 14);
    }

    // Drop marker
    if (dropCoords) {
      L.marker([dropCoords.lat, dropCoords.lon], {
        icon: L.divIcon({
          className: "",
          html:
            '<div style="width:16px;height:16px;background:#dc2626;border-radius:50%;border:2px solid white"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(markersLayer.current);
    }

    // Fetch & draw route if both exist
    if (pickupCoords && dropCoords) fetchRoute(pickupCoords, dropCoords);
  }, [pickupCoords, dropCoords, selectedRouteType]);

  /* ---------------------------- FETCH ROUTE ------------------------------ */
  const fetchRoute = async (pickup: any, drop: any) => {
    try {
      const url = `https://us1.locationiq.com/v1/directions/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`;

      const res = await axios.get(url);
      const route = res.data.routes?.[0];
      if (!route) return;

      let distanceKm = route.distance / 1000;
      let durationMin = route.duration / 60;

      // Adjust based on selected type
      if (selectedRouteType === "eco") {
        distanceKm *= 1.02;
        durationMin *= 1.05;
      } else if (selectedRouteType === "scenic") {
        distanceKm *= 1.15;
        durationMin *= 1.25;
      }

      // Clear old
      clearRouteAndCar();

      const geometry = route.geometry;

      // Draw route
      routeLayer.current = L.geoJSON(geometry, {
        style: { color: "#111", weight: 6, opacity: 0.95 },
      }).addTo(map.current!);

      // Fit view
      map.current!.fitBounds(L.geoJSON(geometry).getBounds(), {
        padding: [60, 60],
      });

      // Send route data
      onRouteComputed({ distanceKm, durationMin, geometry });

      // Prepare animation path
      path.current = geometry.coordinates.map((c: any) => [c[1], c[0]]);

      if (animateCar) startCarAnimation();
    } catch (e) {
      console.error("Route error:", e);
    }
  };

  /* ----------------------------- CAR ANIMATION --------------------------- */
  const startCarAnimation = () => {
    if (!map.current || !path.current) return;

    const icon = L.divIcon({
      className: "",
      html:
        '<div style="width:28px;height:14px;background:black;border-radius:6px;box-shadow:0 0 10px rgba(0,0,0,0.3)"></div>',
      iconSize: [28, 14],
      iconAnchor: [14, 7],
    });

    const coords = path.current;
    let i = 0;

    carMarker.current = L.marker(coords[0], { icon }).addTo(map.current);

    const step = () => {
      if (i >= coords.length - 1) return;

      i++;
      animIndex.current = i;

      carMarker.current!.setLatLng(coords[i]);
      rafID.current = requestAnimationFrame(step);
    };

    rafID.current = requestAnimationFrame(step);
  };

  /* -------------------------- LIVE DRIVER TRACKING ----------------------- */
  useEffect(() => {
    if (!map.current) return;
    if (!driverCoords) return;

    const driverIcon = L.divIcon({
      className: "",
      html:
        '<div style="width:24px;height:24px;background:#2563eb;border:2px solid white;border-radius:50%;box-shadow:0 0 8px rgba(0,0,0,0.3)"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // If first time
    if (!driverMarker.current) {
      driverMarker.current = L.marker(
        [driverCoords.lat, driverCoords.lon],
        { icon: driverIcon }
      ).addTo(map.current);

      return;
    }

    // Update existing marker
    driverMarker.current.setLatLng([driverCoords.lat, driverCoords.lon]);
  }, [driverCoords]);

  /* ------------------------------- CONTROLS ------------------------------- */
  const zoomIn = () => map.current?.zoomIn();
  const zoomOut = () => map.current?.zoomOut();
  const fitRoute = () => {
    if (routeLayer.current)
      map.current?.fitBounds(routeLayer.current.getBounds(), {
        padding: [60, 60],
      });
  };

  /* ------------------------------ UI OUTPUT ------------------------------ */
  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white/90 rounded-lg border shadow-sm"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white/90 rounded-lg border shadow-sm"
        >
          −
        </button>
        <button
          onClick={fitRoute}
          className="w-10 h-10 bg-white/90 rounded-lg border shadow-sm"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
