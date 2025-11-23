"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Fix Leaflet marker icons (Next.js)
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

  // car animation refs
  const carMarkerRef = useRef<L.Marker | null>(null);
  const rafRef = useRef<number | null>(null);
  const animationIndexRef = useRef<number>(0);
  const pathRef = useRef<[number, number][] | null>(null);

  const LOCATIONIQ_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([28.7041, 77.1025], 11);

    mapInstance.current = map;

    // initial tile
    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(url, { attribution: "&copy; OSM & CARTO" });
    tileLayerRef.current.addTo(map);

    // markers layer
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      // cleanup on unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Switch tiles when darkMode toggles
  useEffect(() => {
    if (!mapInstance.current) return;

    const url = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    // remove old tile layer if present
    if (tileLayerRef.current && mapInstance.current.hasLayer(tileLayerRef.current)) {
      mapInstance.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(url, { attribution: "&copy; OSM & CARTO" });
    tileLayerRef.current.addTo(mapInstance.current);
  }, [darkMode]);

  // Helper: clear route and car animation
  const clearRouteAndCar = () => {
    try {
      if (routeLayerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      if (carMarkerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(carMarkerRef.current);
        carMarkerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pathRef.current = null;
      animationIndexRef.current = 0;
    } catch (e) {
      // ignore
    }
  };

  // Update markers and route whenever pickup/drop change
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;

    // clear old
    markersRef.current.clearLayers();
    clearRouteAndCar();

    // pickup marker
    if (pickupCoords) {
      const pickupIcon = L.divIcon({
        className: "",
        html:
          '<div style="width:16px;height:16px;background:#16a34a;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([pickupCoords.lat, pickupCoords.lon], { icon: pickupIcon }).addTo(
        markersRef.current
      );

      if (!dropCoords) {
        mapInstance.current.flyTo([pickupCoords.lat, pickupCoords.lon], 13, { duration: 1.0 });
      }
    }

    // drop marker
    if (dropCoords) {
      const dropIcon = L.divIcon({
        className: "",
        html:
          '<div style="width:16px;height:16px;background:#dc2626;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([dropCoords.lat, dropCoords.lon], { icon: dropIcon }).addTo(markersRef.current);

      if (!pickupCoords) {
        mapInstance.current.flyTo([dropCoords.lat, dropCoords.lon], 13, { duration: 1.0 });
      }
    }

    // fetch route if both exist
    if (pickupCoords && dropCoords) {
      (async () => {
        await fetchRoute(pickupCoords, dropCoords);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, dropCoords, selectedRouteType]);

  // Fetch route and draw
  const fetchRoute = async (pickup: any, drop: any) => {
    if (!mapInstance.current) return;
    try {
      const url = `https://us1.locationiq.com/v1/directions/driving/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`;
      const res = await axios.get(url);

      const route = res.data.routes && res.data.routes[0];
      if (!route) throw new Error("No route found");

      const geometry = route.geometry;
      let distanceKm = route.distance / 1000;
      let durationMin = route.duration / 60;

      // tweak by route type
      if (selectedRouteType === "eco") {
        distanceKm *= 1.02;
        durationMin *= 1.05;
      } else if (selectedRouteType === "scenic") {
        distanceKm *= 1.15;
        durationMin *= 1.25;
      }

      // clear previous route & car
      clearRouteAndCar();

      // draw route with glow (two layers, one soft glow)
      routeLayerRef.current = L.geoJSON(geometry, {
        style: () => ({
          color: "#111111",
          weight: 6,
          opacity: 0.98,
          lineCap: "round",
        }),
      }).addTo(mapInstance.current);

      // optional glow: lower-weight, semi-transparent layer (add beneath)
      L.geoJSON(geometry, {
        style: () => ({
          color: "#111111",
          weight: 12,
          opacity: 0.06,
          className: "route-glow",
        }),
      }).addTo(mapInstance.current);

      // fit bounds
      const bounds = L.geoJSON(geometry).getBounds();
      mapInstance.current.flyToBounds(bounds, { padding: [70, 70], duration: 1.0 });

      // provide route info to parent
      onRouteComputed({ distanceKm, durationMin, geometry });

      // prepare path coords for car if needed (convert [lon,lat] -> [lat,lon])
      const coords: any[] = geometry.coordinates || [];
      pathRef.current = coords.map((c: [number, number]) => [c[1], c[0]]);

      // animate car if requested
      if (animateCar && pathRef.current && pathRef.current.length > 0) {
        startCarAnimation();
      }
    } catch (err) {
      console.error("Routing error:", err);
    }
  };

  // Car animation: smoothly step through points
  const startCarAnimation = () => {
    if (!mapInstance.current || !pathRef.current || pathRef.current.length === 0) return;

    // create car icon
    const carIcon = L.divIcon({
      className: "",
      html:
        '<div style="width:28px;height:14px;background:#000;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);"></div>',
      iconSize: [28, 14],
      iconAnchor: [14, 7],
    });

    // remove old marker
    if (carMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(carMarkerRef.current);
      carMarkerRef.current = null;
    }

    const path = pathRef.current as [number, number][];
    let i = 0;
    animationIndexRef.current = 0;

    carMarkerRef.current = L.marker(path[0], { icon: carIcon }).addTo(mapInstance.current);

    const step = () => {
      // move a few steps per frame for visible motion (tune speed)
      animationIndexRef.current += 1;
      i = animationIndexRef.current;

      if (!path || i >= path.length) {
        // stop
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      const next = path[i];
      carMarkerRef.current!.setLatLng(next);

      // optionally pan map to keep car in view:
      // mapInstance.current.panTo(next, { animate: false });

      rafRef.current = requestAnimationFrame(step);
    };

    // small delay before starting to create natural movement
    rafRef.current = requestAnimationFrame(step);
  };

  // controls handlers
  const zoomIn = () => {
    if (!mapInstance.current) return;
    mapInstance.current.zoomIn();
  };
  const zoomOut = () => {
    if (!mapInstance.current) return;
    mapInstance.current.zoomOut();
  };
  const fitRoute = () => {
    if (!mapInstance.current || !routeLayerRef.current) return;
    const bounds = routeLayerRef.current.getBounds();
    mapInstance.current.fitBounds(bounds, { padding: [70, 70], duration: 0.9 });
  };

  return (
    <div className="w-full h-full relative">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-40">
        <button
          onClick={zoomIn}
          className="w-10 h-10 rounded-lg bg-white/90 shadow-md flex items-center justify-center border border-neutral-200 hover:scale-105 transition"
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          onClick={zoomOut}
          className="w-10 h-10 rounded-lg bg-white/90 shadow-md flex items-center justify-center border border-neutral-200 hover:scale-105 transition"
          aria-label="Zoom out"
        >
          −
        </button>

        <button
          onClick={fitRoute}
          className="w-10 h-10 rounded-lg bg-white/90 shadow-md flex items-center justify-center border border-neutral-200 hover:scale-105 transition"
          title="Fit route"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
