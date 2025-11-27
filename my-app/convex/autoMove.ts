// convex/autoMove.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const moveDriverStep = mutation({
  args: {
    driverId: v.id("drivers"),
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, { driverId, lat, lon }) => {
    await ctx.db.patch(driverId, { lat, lon });
    return true;
  }
});
