"use client";

import React from "react";
import Address from "./Address";

type Props = {
  setPickupCoords: (coords: any) => void;
  setDropCoords: (coords: any) => void;
  routeInfo: any;
  onRouteTypeChange: (t: "eco" | "fast" | "scenic") => void;
};

export default function Booking({
  setPickupCoords,
  setDropCoords,
  routeInfo,
  onRouteTypeChange,
}: Props) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Booking Details</h2>
        <p className="text-sm text-gray-500">
          Enter pickup & drop details to start planning your ride.
        </p>
      </div>

      <div className="p-4 border rounded-2xl bg-neutral-50">
        <Address setPickupCoords={setPickupCoords} setDropCoords={setDropCoords} />

        <div className="mt-4">
          <label className="text-sm font-medium">Route Type</label>

          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-2 border rounded-lg"
              onClick={() => onRouteTypeChange("eco")}
            >
              🌱 Eco
            </button>

            <button
              className="px-3 py-2 border rounded-lg"
              onClick={() => onRouteTypeChange("fast")}
            >
              ⚡ Fast
            </button>

            <button
              className="px-3 py-2 border rounded-lg"
              onClick={() => onRouteTypeChange("scenic")}
            >
              🌄 Scenic
            </button>
          </div>
        </div>

        {routeInfo && (
          <div className="mt-4 p-3 bg-white rounded-xl shadow-sm text-sm">
            <div className="flex justify-between">
              <span>Distance:</span>
              <strong>{routeInfo.distanceKm.toFixed(2)} km</strong>
            </div>

            <div className="flex justify-between">
              <span>ETA:</span>
              <strong>{Math.ceil(routeInfo.durationMin)} min</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
