"use client";

import React from "react";
import Booking from "@/components/booking/Booking";

export default function Page() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-auto md:h-screen">
      
      {/* LEFT: BOOKING PANEL */}
      <div className="bg-white rounded-2xl shadow-xl
 flex items-start md:items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-lg">
          <Booking />
        </div>
      </div>

      {/* RIGHT: MAP PANEL */}
      <div className="bg-gray-100 flex items-center justify-center p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Map</h1>
      </div>

    </div>
  );
}
