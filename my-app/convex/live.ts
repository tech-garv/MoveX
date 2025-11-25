import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Driver updates their real-time location
export const updateDriverLocation = mutation({
  args: {
    rideId: v.id("rides"),
    driverId: v.id("drivers"),
    lat: v.number(),
    lon: v.number(),
  },

  handler: async (ctx, { rideId, driverId, lat, lon }) => {
    // Save history
    await ctx.db.insert("rideUpdates", {
      rideId,
      driverLat: lat,
      driverLon: lon,
      status: "on_trip",
      updatedAt: Date.now(),
    });

    // Also update driver table (live location)
    await ctx.db.patch(driverId, {
      lat,
      lon,
    });

    return true;
  },
});
