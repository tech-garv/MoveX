// components/map/MapView.tsx
"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Fix Leaflet marker icons for Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  pickupCoords: { lat: number; lon: number } | null;
  dropCoords: { lat: number; lon: number } | null;
  onRouteComputed: (info: { distanceKm: number; durationMin: number; geometry: any }) => void;
  selectedRouteType: "eco" | "fast" | "scenic";
  animateCar?: boolean;
  darkMode?: boolean;
};

export default function MapView({
  pickupCoords,
  dropCoords,
  onRouteComputed,
  selectedRouteType,
  animateCar = false,
  darkMode = false,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // drivers from Convex (live)
  const drivers = useQuery(api.drivers.getAllDrivers);

  // driver markers keyed by driverId
  const driverMarkers = useRef<Record<string, L.Marker>>({});

  const LOCATIONIQ_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([28.7041, 77.1025], 11);

    mapInstance.current = map;

    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(url, { attribution: "&copy; OSM & CARTO" });
    tileLayerRef.current.addTo(map);

    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update base tiles on darkMode change
  useEffect(() => {
    if (!mapInstance.current) return;
    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    if (tileLayerRef.current && mapInstance.current.hasLayer(tileLayerRef.current)) {
      mapInstance.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(url, { attribution: "&copy; OSM & CARTO" });
    tileLayerRef.current.addTo(mapInstance.current);
  }, [darkMode]);

  // draw pickup/drop markers & route
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;

    // clear route/markers (except drivers)
    markersRef.current.clearLayers();
    if (routeLayerRef.current && mapInstance.current.hasLayer(routeLayerRef.current)) {
      mapInstance.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // pickup
    if (pickupCoords) {
      const pickupIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#16a34a;border-radius:50%;border:2px solid white"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([pickupCoords.lat, pickupCoords.lon], { icon: pickupIcon }).addTo(markersRef.current);
      if (!dropCoords) mapInstance.current.flyTo([pickupCoords.lat, pickupCoords.lon], 13, { duration: 1.0 });
    }

    // drop
    if (dropCoords) {
      const dropIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#dc2626;border-radius:50%;border:2px solid white"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([dropCoords.lat, dropCoords.lon], { icon: dropIcon }).addTo(markersRef.current);
      if (!pickupCoords) mapInstance.current.flyTo([dropCoords.lat, dropCoords.lon], 13, { duration: 1.0 });
    }

    // route fetch & draw
    if (pickupCoords && dropCoords) {
      (async () => {
        try {
          const url = `https://us1.locationiq.com/v1/directions/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`;
          const res = await axios.get(url);
          const route = res.data.routes?.[0];
          if (!route) throw new Error("No route");

          const geometry = route.geometry;
          let distanceKm = route.distance / 1000;
          let durationMin = route.duration / 60;

          if (selectedRouteType === "eco") {
            distanceKm *= 1.02;
            durationMin *= 1.05;
          } else if (selectedRouteType === "scenic") {
            distanceKm *= 1.15;
            durationMin *= 1.25;
          }

          routeLayerRef.current = L.geoJSON(geometry, {
            style: { color: "#111", weight: 6, opacity: 0.95, lineCap: "round" },
          }).addTo(mapInstance.current!);

          const bounds = L.geoJSON(geometry).getBounds();
          mapInstance.current!.flyToBounds(bounds, { padding: [70, 70], duration: 1.0 });

          onRouteComputed({ distanceKm, durationMin, geometry });

        } catch (err) {
          console.error("Route error", err);
        }
      })();
    }
  }, [pickupCoords, dropCoords, selectedRouteType, onRouteComputed, LOCATIONIQ_KEY]);

  // Driver markers: update when `drivers` changes (Convex live updates)
  useEffect(() => {
    if (!mapInstance.current || !drivers) return;

    // Remove markers for drivers that no longer exist
    const currentIds = new Set(drivers.map((d: any) => String(d._id)));
    for (const id of Object.keys(driverMarkers.current)) {
      if (!currentIds.has(id)) {
        const m = driverMarkers.current[id];
        mapInstance.current.removeLayer(m);
        delete driverMarkers.current[id];
      }
    }

    drivers.forEach((d: any) => {
      const id = String(d._id);
      const lat = d.lat;
      const lon = d.lon;
      if (lat == null || lon == null) return;

      const iconHtml = `
        <div style="
          width:28px;height:14px;border-radius:6px;
          background:${d.available ? "#000" : "#1f6feb"};
          box-shadow:0 6px 14px rgba(0,0,0,0.18);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:10px;padding:2px 6px;
        ">
          🚗
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        iconSize: [28, 14],
        iconAnchor: [14, 7],
      });

      if (driverMarkers.current[id]) {
        // smooth update
        driverMarkers.current[id].setLatLng([lat, lon]);
      } else {
        const marker = L.marker([lat, lon], { icon }).addTo(mapInstance.current!);
        driverMarkers.current[id] = marker;
      }
    });
  }, [drivers]);

  // zoom controls (same as before)
  const zoomIn = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();
  const fitRoute = () => {
    if (routeLayerRef.current && mapInstance.current) {
      mapInstance.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [70, 70], duration: 0.9 });
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
        <button onClick={zoomIn} className="w-10 h-10 rounded-lg bg-white/90 shadow-md border">+</button>
        <button onClick={zoomOut} className="w-10 h-10 rounded-lg bg-white/90 shadow-md border">−</button>
        <button onClick={fitRoute} className="w-10 h-10 rounded-lg bg-white/90 shadow-md border">⤢</button>
      </div>
    </div>
  );
}
