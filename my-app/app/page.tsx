"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

import Booking from "@/components/booking/Booking";
import TripSummary from "@/components/TripSummary";
import VehicleSelector from "@/components/VehicleSelector";
import PaymentMock from "@/components/PaymentMock";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-neutral-200 animate-pulse flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export type Coords = { lat: number; lon: number };
export type RouteInfo = { distanceKm: number; durationMin: number; geometry?: any };

export default function Page() {
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedRouteType, setSelectedRouteType] =
    useState<"eco" | "fast" | "scenic">("fast");

  const [fare, setFare] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-neutral-100">

      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 h-screen flex flex-col p-5 md:p-8">

        {/* Sticky Header */}
        <div className="sticky top-0 bg-neutral-100 z-20 pb-4 border-b border-neutral-300">
          <h1 className="text-3xl font-extrabold">Plan Your Ride</h1>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto no-scrollbar mt-5">
          <div className="w-full bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">

            <Booking
              setPickupCoords={setPickupCoords}
              setDropCoords={setDropCoords}
              routeInfo={routeInfo}
              onRouteTypeChange={setSelectedRouteType}
            />

            {routeInfo && (
              <div className="mt-6">
                <TripSummary
                  routeInfo={routeInfo}
                  routeType={selectedRouteType}
                  fare={fare}
                  onEstimate={setFare}
                  onSelectVehicle={() => setShowVehicleSelector(true)}
                />
              </div>
            )}

            {showVehicleSelector && routeInfo && (
              <div className="mt-6">
                <VehicleSelector
                  routeInfo={routeInfo}
                  onSelect={(vehicle) => {
                    setSelectedVehicle(vehicle);
                    setShowPayment(true);
                    setShowVehicleSelector(false);
                  }}
                  onClose={() => setShowVehicleSelector(false)}
                />
              </div>
            )}

            {showPayment && selectedVehicle && fare !== null && (
              <div className="mt-6">
                <PaymentMock
                  fare={fare}
                  vehicle={selectedVehicle}
                  onPaid={() => setShowPayment(false)}
                  onCancel={() => setShowPayment(false)}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT SIDE - MAP */}
      <div className="w-full md:w-1/2 h-screen p-5 md:p-8">
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl border border-neutral-200 bg-white">
          <MapView
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            onRouteComputed={setRouteInfo}
            selectedRouteType={selectedRouteType}
            animateCar={!!selectedVehicle}
          />
        </div>
      </div>

    </div>
  );
}
