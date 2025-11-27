// convex/drivers.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1️⃣ Add a driver (seeding)
export const addDriver = mutation({
  args: {
    name: v.string(),
    lat: v.number(),
    lon: v.number(),
    vehicleType: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("drivers", {
      ...args,
      available: true,
    });
  },
});

// 2️⃣ Get ALL drivers (available + assigned)
export const getAllDrivers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("drivers").collect();
  },
});

// 3️⃣ Update driver location (used for real-time movement)
export const updateDriverLocation = mutation({
  args: {
    driverId: v.id("drivers"),
    lat: v.number(),
    lon: v.number(),
    available: v.optional(v.boolean()),
  },
  handler: async (ctx, { driverId, lat, lon, available }) => {
    await ctx.db.patch(driverId, {
      lat,
      lon,
      ...(available !== undefined ? { available } : {}),
    });
    return true;
  },
});
