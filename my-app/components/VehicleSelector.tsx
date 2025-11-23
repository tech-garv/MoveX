"use client";

import React from "react";
import { X } from "lucide-react";

type Props = {
  routeInfo: { distanceKm: number };
  onSelect: (vehicle: any) => void;
  onClose: () => void;
};

const VEHICLES = [
  {
    id: "mini",
    title: "Mini",
    seats: 3,
    base: 40,
    perKm: 8,
    emoji: "🚗",
  },
  {
    id: "sedan",
    title: "Sedan",
    seats: 4,
    base: 60,
    perKm: 10,
    emoji: "🚘",
  },
  {
    id: "suv",
    title: "SUV",
    seats: 6,
    base: 90,
    perKm: 14,
    emoji: "🚙",
  },
];

export default function VehicleSelector({
  routeInfo,
  onSelect,
  onClose,
}: Props) {
  return (
    <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl border border-neutral-200">
      
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Choose Your Ride</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-100 transition"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {VEHICLES.map((v) => {
          const estFare = Math.round(v.base + v.perKm * routeInfo.distanceKm);

          return (
            <div
              key={v.id}
              className="flex items-center justify-between p-4 rounded-xl border border-neutral-300 bg-white hover:shadow-md hover:bg-neutral-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{v.emoji}</div>

                <div>
                  <div className="font-semibold text-neutral-900">{v.title}</div>
                  <div className="text-xs text-neutral-500">{v.seats} Seats</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-neutral-900">₹ {estFare}</div>

                <button
                  onClick={() => onSelect({ ...v, price: estFare })}
                  className="mt-1 px-4 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-neutral-800 transition"
                >
                  Select
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
