"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Booking from "@/components/booking/Booking";

// Skeleton for map
const MapSkeleton = () => (
  <div className="h-full w-full bg-neutral-200 animate-pulse flex items-center justify-center text-neutral-400">
    <span className="text-sm font-semibold tracking-wide">LOADING MAP...</span>
  </div>
);

const MapView = dynamic(() => import("@/components/map/MapView"), { 
  ssr: false,
  loading: () => <MapSkeleton /> 
});

type Coords = { lat: number; lon: number; };

export default function Page() {
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);

  return (
    <div className="h-screen w-full bg-neutral-100 relative overflow-hidden flex flex-col md:flex-row md:p-6 md:gap-6">
      
      {/* --- SECTION 1: MAP (Mobile: Top 45% | Desktop: Right Side) --- */}
      <div className="h-[45%] w-full md:h-full md:flex-1 md:order-2 relative z-0">
        <div className="absolute inset-0 md:rounded-[2.5rem] overflow-hidden shadow-none md:shadow-2xl md:shadow-blue-900/10 md:border md:border-white/50">
           <MapView pickupCoords={pickupCoords} dropCoords={dropCoords} />
           
           {/* Gradient Overlay for Mobile */}
           <div className="md:hidden absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-neutral-100 to-transparent pointer-events-none `z-[400]`" />
        </div>
      </div>

      {/* --- SECTION 2: BOOKING FORM (Mobile: Bottom Sheet | Desktop: Left Card) --- */}
      <div className="h-[55%] md:h-full md:w-[450px] md:order-1 flex flex-col z-10">
        
        {/* The Card Container - FIXED CLASSNAME STRING */}
        <div className="flex-1 bg-white `rounded-t-[2rem]` md:rounded-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-xl border-t md:border border-white/50 md:border-neutral-200/60 overflow-hidden flex flex-col -mt-6 md:mt-0">
          
          {/* Mobile Handle Bar */}
          <div className="md:hidden w-full flex justify-center pt-3 pb-1">
             <div className="w-12 h-1.5 bg-neutral-200 rounded-full"></div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
            <Booking
              setPickupCoords={setPickupCoords}
              setDropCoords={setDropCoords}
            />
          </div>
        </div>

      </div>

    </div>
  );
}