import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------
// 1. LIST RIDES
// ---------------------------------------------------
export const getRides = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("rides")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ---------------------------------------------------
// 2. CREATE RIDE
// ---------------------------------------------------
export const createRide = mutation({
  args: {
    userId: v.string(),
    pickup: v.any(),
    drop: v.any(),
    distanceKm: v.number(),
    durationMin: v.number(),
    fare: v.number(),
    vehicleType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rides", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// ---------------------------------------------------
// 3. UPDATE RIDE STATUS
// ---------------------------------------------------
export const updateRideStatus = mutation({
  args: {
    rideId: v.id("rides"),
    status: v.string(),
  },
  handler: async (ctx, { rideId, status }) => {
    await ctx.db.patch(rideId, { status });

    // save ride update history
    await ctx.db.insert("rideUpdates", {
      rideId,
      status,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// ---------------------------------------------------
// 4. ASSIGN DRIVER
// ---------------------------------------------------
export const assignDriver = mutation({
  args: {
    rideId: v.id("rides"),
    pickup: v.any(),
  },
  handler: async (ctx, { rideId, pickup }) => {
    const drivers = await ctx.db
      .query("drivers")
      .withIndex("by_available", (q) => q.eq("available", true))
      .collect();

    if (drivers.length === 0) return null;

    // choose nearest
    function dist(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    let nearest = null;
    let min = Infinity;

    for (const d of drivers) {
      const distToPickup = dist(pickup.lat, pickup.lon, d.lat, d.lon);
      if (distToPickup < min) {
        min = distToPickup;
        nearest = d;
      }
    }

    // mark driver unavailable
    await ctx.db.patch(nearest!._id, { available: false });

    // update ride fields
    await ctx.db.patch(rideId, {
      driverId: nearest!._id,
      driverName: nearest!.name,
      driverRating: nearest!.rating,
      driverVehicle: nearest!.vehicleType,
      status: "driver_assigned",
    });

    return nearest;
  },
});
