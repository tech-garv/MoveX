import { query } from "./_generated/server";
import { v } from "convex/values";

// Live stream of driver movement
export const driverTrack = query({
  args: { rideId: v.id("rides") },

  handler: async (ctx, { rideId }) => {
    return await ctx.db
      .query("rideUpdates")
      .withIndex("by_ride", (q) => q.eq("rideId", rideId))
      .order("desc")
      .first();
  },
});
