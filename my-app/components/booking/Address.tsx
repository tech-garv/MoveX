"use client";

import { useState } from "react";
import axios from "axios";
import { MapPin } from "lucide-react";

type Props = {
  setPickupCoords: (coords: any) => void;
  setDropCoords: (coords: any) => void;
};

export default function Address({ setPickupCoords, setDropCoords }: Props) {
  const [pickupText, setPickupText] = useState("");
  const [dropText, setDropText] = useState("");
  const [pickupList, setPickupList] = useState([]);
  const [dropList, setDropList] = useState([]);
  const [timer, setTimer] = useState<any>(null);

  const KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  async function search(query: string, setList: any) {
    if (query.length < 3) return setList([]);

    try {
      const url = `https://us1.locationiq.com/v1/search?key=${KEY}&q=${encodeURIComponent(
        query
      )}&format=json&countrycodes=in`;

      const res = await axios.get(url);
      setList(res.data);
    } catch {}
  }

  const handleInput = (val: string, setText: any, setList: any) => {
    setText(val);
    clearTimeout(timer);

    const newTimer = setTimeout(() => search(val, setList), 600);
    setTimer(newTimer);
  };

  return (
    <div className="w-full space-y-8">

      {/* PICKUP */}
      <div>
        <label className="block font-semibold text-lg">Pickup Location</label>
        <p className="text-sm text-neutral-500 mb-3">Enter your starting point (e.g. Phase 7 Mohali)</p>

        <input
          placeholder="House / Flat No. (optional)"
          className="w-full px-4 py-3 mb-3 rounded-lg border border-neutral-300 bg-neutral-50 outline-none"
        />

        <div className="relative">
          <div className="flex items-center px-4 py-3 rounded-lg border border-neutral-300 bg-white">
            <MapPin size={18} className="mr-3 text-green-600" />
            <input
              value={pickupText}
              onChange={(e) => handleInput(e.target.value, setPickupText, setPickupList)}
              placeholder="Search pickup area"
              className="w-full outline-none"
            />
          </div>

          {pickupList.length > 0 && (
            <ul className="absolute bg-white w-full mt-2 rounded-lg shadow-xl max-h-60 overflow-auto border border-neutral-200 z-50">
              {pickupList.map((place: any, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setPickupText(place.display_name);
                    setPickupCoords({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
                    setPickupList([]);
                  }}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-neutral-100 border-b"
                >
                  📍 {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* DROP */}
      <div>
        <label className="block font-semibold text-lg">Drop Location</label>
        <p className="text-sm text-neutral-500 mb-3">Where do you want to go?</p>

        <input
          placeholder="House / Office No. (optional)"
          className="w-full px-4 py-3 mb-3 rounded-lg border border-neutral-300 bg-neutral-50 outline-none"
        />

        <div className="relative">
          <div className="flex items-center px-4 py-3 rounded-lg border border-neutral-300 bg-white">
            <MapPin size={18} className="mr-3 text-red-600" />
            <input
              value={dropText}
              onChange={(e) => handleInput(e.target.value, setDropText, setDropList)}
              placeholder="Search drop area"
              className="w-full outline-none"
            />
          </div>

          {dropList.length > 0 && (
            <ul className="absolute bg-white w-full mt-2 rounded-lg shadow-xl max-h-60 overflow-auto border border-neutral-200 z-50">
              {dropList.map((place: any, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setDropText(place.display_name);
                    setDropCoords({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
                    setDropList([]);
                  }}
                  className="px-4 py-3 text-sm cursor-pointer hover:bg-neutral-100 border-b"
                >
                  📍 {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
