import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// -----------------------------------------
// 1. ADD DRIVER (fake drivers for testing)
// -----------------------------------------
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

// -----------------------------------------
// 2. GET AVAILABLE DRIVERS
// -----------------------------------------
export const getAvailableDrivers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("drivers")
      .withIndex("by_available", q => q.eq("available", true))
      .collect();
  },
});

// -----------------------------------------
// 3. UPDATE DRIVER LOCATION (NEW)
// -----------------------------------------
export const updateDriverLocation = mutation({
  args: {
    driverId: v.id("drivers"),
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, { driverId, lat, lon }) => {
    await ctx.db.patch(driverId, { lat, lon });
    return true;
  },
});
