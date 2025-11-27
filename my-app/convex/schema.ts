// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rides: defineTable({
    userId: v.string(),
    pickup: v.any(),
    drop: v.any(),
    distanceKm: v.number(),
    durationMin: v.number(),
    fare: v.number(),
    vehicleType: v.string(),
    status: v.string(),
    createdAt: v.number(),

    // ⭐ Driver fields (flat format — NO object)
    driverId: v.optional(v.id("drivers")),
    driverName: v.optional(v.string()),
    driverRating: v.optional(v.number()),
    driverVehicle: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  drivers: defineTable({
    name: v.string(),
    lat: v.number(),
    lon: v.number(),
    vehicleType: v.string(),
    rating: v.number(),
    available: v.boolean(),
  }).index("by_available", ["available"]),

  rideUpdates: defineTable({
    rideId: v.id("rides"),
    driverLat: v.optional(v.number()),
    driverLon: v.optional(v.number()),
    status: v.string(),
    updatedAt: v.number(),
  }).index("by_ride", ["rideId"]),
});
