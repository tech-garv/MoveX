"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  // ✔ Correct: hooks must be at top
  const { user, isSignedIn } = useUser();

  const createRide = useMutation(api.rides.createRide);
  const assignDriver = useMutation(api.rides.assignDriver);

  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [selectedRouteType, setSelectedRouteType] =
    useState<"eco" | "fast" | "scenic">("fast");

  const [fare, setFare] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // --------------------------------------------------
  // PAYMENT SUCCESS → SAVE RIDE + ASSIGN DRIVER
  // --------------------------------------------------
  const handleConfirmPayment = async ({
    fare,
    vehicle,
  }: {
    fare: number;
    vehicle: any;
  }) => {
    if (!isSignedIn) return alert("Please log in first.");
    if (!pickupCoords || !dropCoords || !routeInfo)
      return alert("Missing ride data.");

    try {
      // 1️⃣ SAVE ride in database
      const rideId = await createRide({
        userId: user!.id,
        pickup: pickupCoords,
        drop: dropCoords,
        distanceKm: routeInfo.distanceKm,
        durationMin: routeInfo.durationMin,
        fare,
        vehicleType: vehicle.title,
      });

      // 2️⃣ Assign nearest driver
      const driver = await assignDriver({
        rideId,
        pickup: pickupCoords,
      });

      if (driver) {
        alert(`🚗 Ride booked! Driver ${driver.name} is on the way.`);
      } else {
        alert("✔ Ride booked but no drivers currently available.");
      }

      setShowPayment(false);
    } catch (err) {
      console.error(err);
      alert("❌ Error saving ride");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-neutral-100">
      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 h-screen p-5 md:p-8 flex flex-col">
        <div className="sticky top-0 bg-neutral-100 pb-4 border-b z-20">
          <h1 className="text-3xl font-extrabold">Plan Your Ride</h1>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar mt-5">
          <div className="bg-white rounded-2xl shadow-lg border p-6">
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
                  fare={fare}
                  routeType={selectedRouteType}
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

            {showPayment &&
              selectedVehicle &&
              fare !== null &&
              routeInfo &&
              pickupCoords &&
              dropCoords && (
                <div className="mt-6">
                  <PaymentMock
                    fare={fare}
                    vehicle={selectedVehicle}
                    onPaid={handleConfirmPayment}
                    onCancel={() => setShowPayment(false)}
                  />
                </div>
              )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE MAP */}
      <div className="w-full md:w-1/2 h-screen p-5 md:p-8">
        <div className="w-full h-full rounded-2xl shadow-xl border bg-white overflow-hidden">
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
