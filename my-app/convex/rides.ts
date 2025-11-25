import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------
// 1. LIST ALL RIDES FOR A USER
// ---------------------------------------
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

// ---------------------------------------
// 2. CREATE NEW RIDE (after payment)
// ---------------------------------------
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

      // driver fields empty initially
      driverId: undefined,
      driverName: undefined,
      driverRating: undefined,
      driverVehicle: undefined,
    });
  },
});

// ---------------------------------------
// 3. GET A SINGLE RIDE
// ---------------------------------------
export const getRide = query({
  args: { rideId: v.id("rides") },
  handler: async (ctx, { rideId }) => {
    return await ctx.db.get(rideId);
  },
});

// ---------------------------------------
// 4. UPDATE RIDE STATUS (driver_assigned, on_trip, completed)
// ---------------------------------------
export const updateRideStatus = mutation({
  args: { rideId: v.id("rides"), status: v.string() },
  handler: async (ctx, { rideId, status }) => {
    await ctx.db.patch(rideId, { status });

    await ctx.db.insert("rideUpdates", {
      rideId,
      status,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// ---------------------------------------
// 5. ASSIGN NEAREST DRIVER
// ---------------------------------------
export const assignDriver = mutation({
  args: {
    rideId: v.id("rides"),
    pickup: v.any(),
  },
  handler: async (ctx, { rideId, pickup }) => {
    // Load all free drivers
    const drivers = await ctx.db
      .query("drivers")
      .withIndex("by_available", (q) => q.eq("available", true))
      .collect();

    if (drivers.length === 0) {
      return null;
    }

    // Haversine Formula (distance calculation)
    function dist(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
          Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // find closest driver
    let nearest = null;
    let minDist = Infinity;

    for (const d of drivers) {
      const dDist = dist(pickup.lat, pickup.lon, d.lat, d.lon);
      if (dDist < minDist) {
        minDist = dDist;
        nearest = d;
      }
    }

    if (!nearest) return null;

    // Mark driver unavailable
    await ctx.db.patch(nearest._id, { available: false });

    // Update ride with driver details (MATCHES SCHEMA)
    await ctx.db.patch(rideId, {
      status: "driver_assigned",
      driverId: nearest._id,
      driverName: nearest.name,
      driverRating: nearest.rating,
      driverVehicle: nearest.vehicleType,
    });

    return nearest;
  },
});
