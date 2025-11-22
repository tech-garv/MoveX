"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import {
  Car,
  Bike,
  Bus,
  MapPin,
  Rocket,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();
  const username = isSignedIn ? user?.firstName : "User";

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white overflow-hidden relative">

      {/* 🔥 GLOW BACKGROUND EFFECTS */}
      <div className="absolute -top-32 -left-20 w-[450px] h-[450px] bg-yellow-500 blur-[200px] opacity-25 rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-300 blur-[180px] opacity-[0.15] rounded-full" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-24">

        {/* 👋 User Greeting */}
        <p className="text-lg text-slate-300 mb-3">
          Welcome back, <span className="font-semibold text-yellow-400">{username}</span>
        </p>

        {/* ⭐ Animated Gradient Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-yellow-400 via-yellow-200 to-white bg-clip-text text-transparent animate-pulse">
          MoveX — The Future of Travel
        </h1>

        {/* Subheading */}
        <p className="text-slate-300 max-w-2xl text-lg sm:text-xl">
          Book instantly. Track live. Experience next-gen rides with precision, comfort & unmatched speed.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 flex-wrap mt-8">
          <a
            href="/book-ride"
            className="px-10 py-3 rounded-full bg-yellow-500 text-black font-bold shadow-xl hover:bg-yellow-400 transition flex items-center gap-2"
          >
            Book Now <Rocket className="w-5 h-5" />
          </a>

          <a
            href="/services"
            className="px-10 py-3 rounded-full border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-500 hover:text-black transition"
          >
            Explore Services
          </a>
        </div>

        {/* 🚖 Floating Taxi Illustration */}
        <div className="flex justify-center mt-16 pointer-events-none">
          <img
            src="/taxi-illustration.png"
            alt="MoveX Taxi"
            className="w-[380px] sm:w-[500px] animate-float"
          />
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-16px); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
        `}</style>

        {/* ✨ Ride Types Section */}
        <h2 className="mt-24 mb-10 text-4xl font-bold text-center">
          Your Ride, Your Style
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <ServiceCard icon={<Car size={38} />} title="Taxi" />
          <ServiceCard icon={<Bike size={38} />} title="Bike" />
          <ServiceCard icon={<MapPin size={38} />} title="Auto" />
          <ServiceCard icon={<Bus size={38} />} title="Bus" />
        </div>

        {/* ⚡ AI Recommendation Section */}
        <div className="mt-24 bg-slate-800/40 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-xl">

          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-yellow-400" />
            <h3 className="text-2xl font-bold">MoveX AI Picks</h3>
          </div>

          <p className="text-slate-300 text-lg">
            Based on your travel history, MoveX AI recommends:
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-6">
            <AICard
              icon={<Car className="text-yellow-400" />}
              title="Express Taxi"
              desc="Fastest route with premium drivers — perfect for quick city travel."
            />

            <AICard
              icon={<Bike className="text-yellow-400" />}
              title="Rapid Bike Ride"
              desc="Beat peak traffic with high-speed, safe bike partners."
            />
          </div>
        </div>

        {/* ⭐ Testimonials or Rating */}
        <div className="mt-20 text-center">
          <div className="flex justify-center gap-1 mb-2">
            <Star className="text-yellow-400" />
            <Star className="text-yellow-400" />
            <Star className="text-yellow-400" />
            <Star className="text-yellow-400" />
            <Star className="text-yellow-400" />
          </div>
          <p className="text-slate-300">Trusted by 10,000+ riders daily.</p>
        </div>
      </div>
    </div>
  );
}

/* COMPONENT: Service Card */
function ServiceCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl text-center shadow-lg hover:scale-105 hover:border-yellow-400 transition cursor-pointer">
      <div className="text-yellow-400 mb-2 flex justify-center">{icon}</div>
      <p className="font-semibold text-lg">{title}</p>
    </div>
  );
}

/* COMPONENT: AI Recommendation Card */
function AICard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-yellow-400 hover:scale-[1.02] transition cursor-pointer">
      <div className="flex items-center gap-3 mb-2">
        <div>{icon}</div>
        <h4 className="text-xl font-semibold">{title}</h4>
      </div>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}
