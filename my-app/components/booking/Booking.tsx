import React from "react";
import Address from "../booking/Address";

// 1. Define what props this component needs to receive
type Props = {
  setPickupCoords: (coords: any) => void;
  setDropCoords: (coords: any) => void;
};

// 2. Accept the props in the function
const Booking = ({ setPickupCoords, setDropCoords }: Props) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-8">
      
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          <span className="bg-linear-to-r from-black via-gray-700 to-gray-900 bg-clip-text text-transparent">
            Booking Details
          </span>
        </h2>

        <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
          Provide accurate pickup and drop locations to help us find the most suitable ride options for you.
        </p>
      </div>

      {/* Premium Card Wrapper */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 sm:p-7 md:p-9">
        
        {/* Section Title */}
        <div className="mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            <span className="border-l-4 border-yellow-400 pl-3">
              Enter Trip Information
            </span>
          </h3>
        </div>

        {/* 3. Pass the props down to the Address component */}
        <Address 
            setPickupCoords={setPickupCoords} 
            setDropCoords={setDropCoords} 
        />

      </div>
    </div>
  );
};

export default Booking;