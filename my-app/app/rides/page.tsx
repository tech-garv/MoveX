"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function RidesPage() {
  const { user, isSignedIn } = useUser();

  // ✅ FIXED: Pass "skip" as the 2nd argument.
  // If logged in: pass { userId: ... }
  // If logged out: pass "skip"
  const rides = useQuery(
    api.rides.getRides,
    isSignedIn && user ? { userId: user.id } : "skip"
  );

  // 1. Loading State (Waiting for Clerk)
  if (!isSignedIn && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-500 font-sans">
        Loading user data...
      </div>
    );
  }

  // 2. Not Logged In State
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans">
        <h2 className="text-xl font-semibold text-neutral-700">Login Required</h2>
        <p className="text-neutral-500">Please sign in to view your trip history.</p>
      </div>
    );
  }

  // 3. Loading State (Waiting for Convex)
  // undefined means loading, [] means empty list
  if (rides === undefined) {
    return (
      <div className="p-6 text-center text-neutral-500 animate-pulse font-sans">
        Loading your trips...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 font-sans bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Your Trips</h1>
        <div className="text-sm text-neutral-500 bg-white px-3 py-1 rounded-full border shadow-sm">
          {rides.length} {rides.length === 1 ? "Ride" : "Rides"}
        </div>
      </header>

      {/* Empty State */}
      {rides.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-200">
          <p className="text-neutral-500 mb-2">You haven't taken any trips yet.</p>
          <Link 
            href="/" 
            className="text-blue-600 hover:underline font-medium"
          >
            Book your first ride
          </Link>
        </div>
      )}

      {/* Rides List */}
      <div className="grid gap-4">
        {rides.map((r: any) => (
          <div
            key={r._id}
            className="p-5 rounded-xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            {/* Header: Price & Status */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold text-xl text-neutral-900 flex items-center gap-2">
                  ₹{r.fare?.toFixed(0)}
                  <span className="text-xs font-normal text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded capitalize">
                    {r.vehicleType || "Ride"}
                  </span>
                </div>
                <div className="text-sm text-neutral-500 flex gap-2 items-center mt-1">
                  <span>{r.distanceKm?.toFixed(1)} km</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                  <span>{Math.ceil(r.durationMin ?? 0)} min</span>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                ${r.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' : 
                  r.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' : 
                  'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                {r.status}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-4 relative pl-5">
               {/* Vertical Line */}
              <div className="absolute left-[7px] top-2 bottom-4 w-0.5 bg-neutral-100 group-hover:bg-neutral-200 transition-colors"></div>

              {/* Pickup */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full bg-neutral-100 border-4 border-white shadow-sm ring-1 ring-neutral-200 z-10"></div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">From</p>
                <p className="text-sm text-neutral-800 font-medium truncate">
                  {r.pickup?.display_name ?? `${r.pickup?.lat}, ${r.pickup?.lon}`}
                </p>
              </div>

              {/* Drop */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full bg-neutral-900 border-4 border-white shadow-sm z-10"></div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">To</p>
                <p className="text-sm text-neutral-800 font-medium truncate">
                  {r.drop?.display_name ?? `${r.drop?.lat}, ${r.drop?.lon}`}
                </p>
              </div>
            </div>

            {/* Footer: Date */}
            <div className="mt-5 pt-3 border-t border-neutral-50 text-xs text-neutral-400 flex justify-between items-center">
              <span>
                {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button className="text-neutral-400 hover:text-neutral-700 font-medium transition-colors">
                View Receipt
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}