"use client";

import React, { useEffect } from "react";
import { Clock, MapPin, IndianRupee } from "lucide-react";

type Props = {
  routeInfo: {
    distanceKm: number;
    durationMin: number;
  };
  routeType: "eco" | "fast" | "scenic";
  onEstimate: (fare: number) => void;
  fare: number | null;
  onSelectVehicle: () => void;
};

export default function TripSummary({
  routeInfo,
  routeType,
  onEstimate,
  fare,
  onSelectVehicle,
}: Props) {
  if (!routeInfo) return null;

  useEffect(() => {
    const baseFare = 35;
    const perKm = 9;
    const perMin = 1.2;
    const comfortFee = 12;

    let price =
      baseFare +
      routeInfo.distanceKm * perKm +
      routeInfo.durationMin * perMin +
      comfortFee;

    if (routeType === "eco") price *= 0.9;
    if (routeType === "scenic") price *= 1.12;

    onEstimate(Math.max(Math.round(price), 25));
  }, [routeInfo, routeType]);

  return (
    <div className="mt-6 p-5 rounded-2xl bg-linear-to-br from-white to-neutral-100 shadow-xl border border-neutral-200">
      <h3 className="text-xl font-bold mb-4 text-neutral-900">Trip Summary</h3>

      <div className="grid grid-cols-3 gap-4 text-center">

        <div className="flex flex-col items-center">
          <MapPin className="text-neutral-500 mb-1" size={20} />
          <p className="text-xs text-neutral-500">Distance</p>
          <p className="font-semibold text-neutral-900">
            {routeInfo.distanceKm.toFixed(1)} km
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Clock className="text-neutral-500 mb-1" size={20} />
          <p className="text-xs text-neutral-500">Time</p>
          <p className="font-semibold text-neutral-900">
            {Math.ceil(routeInfo.durationMin)} min
          </p>
        </div>

        <div className="flex flex-col items-center">
          <IndianRupee className="text-neutral-500 mb-1" size={20} />
          <p className="text-xs text-neutral-500">Est. Fare</p>
          <p className="font-semibold text-neutral-900">₹ {fare ?? "..."}</p>
        </div>

      </div>

      <button
        onClick={onSelectVehicle}
        className="w-full py-3 mt-5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-neutral-800 transition"
      >
        Choose Vehicle
      </button>
    </div>
  );
}
