"use client";

import { useState } from "react";
import axios from "axios";

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

  // Search Logic (Only searches for the AREA, ignoring house numbers)
  async function search(query: string, setList: any) {
    if (query.length < 3) return setList([]);

    try {
      const url = `https://us1.locationiq.com/v1/search?key=${KEY}&q=${encodeURIComponent(query)}&format=json&countrycodes=in`;
      const res = await axios.get(url);
      setList(res.data);
    } catch (error) {
       // Ignore errors, let user keep typing
    }
  }

  const handleInput = (val: string, setText: any, setList: any) => {
    setText(val);
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
        search(val, setList);
    }, 1000);
    setTimer(newTimer);
  };

  return (
    <div className="space-y-6">

      {/* --- PICKUP SECTION --- */}
      <div>
        <label className="text-gray-900 font-bold text-sm ml-1">Pickup Location</label>
        
        {/* Box 1: House Number (Does NOT search map) */}
        <input 
            className="w-full mb-2 p-2 border-b border-gray-300 text-sm focus:outline-none focus:border-black"
            placeholder="House / Flat No. (e.g. #372)"
        />

        {/* Box 2: Area Search (Searches Map) */}
        <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition">
            <div className="w-3 h-3 bg-green-600 rounded-full ml-4 shadow-sm"></div>
            <input
                className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                placeholder="Search Area (e.g. Mohali  )"
                value={pickupText}
                onChange={(e) => handleInput(e.target.value, setPickupText, setPickupList)}
            />
            </div>

            {/* Dropdown List */}
            {pickupList.length > 0 && (
            <ul className="absolute bg-white w-full shadow-2xl rounded-xl mt-2 max-h-60 overflow-auto z-50 border border-gray-100">
                {pickupList.map((place: any, i) => (
                <li
                    key={i}
                    onClick={() => {
                    setPickupText(place.display_name);
                    setPickupCoords({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
                    setPickupList([]);
                    }}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b text-sm text-gray-600"
                >
                    📍 {place.display_name}
                </li>
                ))}
            </ul>
            )}
        </div>
      </div>


      {/* --- DROP SECTION --- */}
      <div>
        <label className="text-gray-900 font-bold text-sm ml-1">Drop Location</label>

        {/* Box 1: House Number */}
        <input 
            className="w-full mb-2 p-2 border-b border-gray-300 text-sm focus:outline-none focus:border-black"
            placeholder="House / Flat No. (e.g. Office 404)"
        />

        {/* Box 2: Area Search */}
        <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition">
            <div className="w-3 h-3 bg-red-600 ml-4 shadow-sm"></div>
            <input
                className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                placeholder="Search Area (e.g. Sector 17, Chandigarh)"
                value={dropText}
                onChange={(e) => handleInput(e.target.value, setDropText, setDropList)}
            />
            </div>

            {dropList.length > 0 && (
            <ul className="absolute bg-white w-full shadow-2xl rounded-xl mt-2 max-h-60 overflow-auto z-50 border border-gray-100">
                {dropList.map((place: any, i) => (
                <li
                    key={i}
                    onClick={() => {
                    setDropText(place.display_name);
                    setDropCoords({ lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
                    setDropList([]);
                    }}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b text-sm text-gray-600"
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