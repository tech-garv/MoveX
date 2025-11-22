"use client";

import React from "react";
import { MapPin, Navigation, Repeat } from "lucide-react";

const Address = () => {
  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 mt-4 sm:mt-6 bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl border border-gray-200 animate-fadeUp">
      
      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
        Book Your Ride
      </h2>
      <p className="text-gray-500 text-xs sm:text-sm mt-1">
        Enter your pickup and drop location to get the fastest rides.
      </p>

      <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">

        {/* Pickup */}
        <div className="relative">
          <label className="absolute -top-3 left-3 text-xs sm:text-sm bg-white px-2 text-gray-700 font-semibold">
            Pickup Location
          </label>

          <div className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-300 shadow-sm transition focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-300">
            <MapPin className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" />
            
            <input
              type="text"
              placeholder="Enter pickup point"
              className="w-full bg-transparent outline-none text-gray-800 text-base sm:text-lg"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black p-2 sm:p-3 rounded-full shadow-md transition hover:scale-110 active:scale-95">
            <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Destination */}
        <div className="relative">
          <label className="absolute -top-3 left-3 text-xs sm:text-sm bg-white px-2 text-gray-700 font-semibold">
            Drop Location
          </label>

          <div className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-300 shadow-sm transition focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-300">
            <Navigation className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
            
            <input
              type="text"
              placeholder="Enter destination"
              className="w-full bg-transparent outline-none text-gray-800 text-base sm:text-lg"
            />
          </div>
        </div>

      </div>

      {/* Button */}
      <button className="mt-6 sm:mt-8 w-full py-3 sm:py-4 rounded-xl bg-linear-to-r from-yellow-400 to-orange-400 text-black font-bold text-base sm:text-lg shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
        Find Best Rides
      </button>

      {/* Animation */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp .5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Address;
