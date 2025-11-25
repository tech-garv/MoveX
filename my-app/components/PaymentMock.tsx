"use client";

import React, { useState } from "react";

type Props = {
  fare: number;
  vehicle: any;
  onPaid: (data: { fare: number; vehicle: any }) => void;
  onCancel: () => void;
};

export default function PaymentMock({ fare, vehicle, onPaid, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPaid({ fare, vehicle }); 
    }, 1200);
  };

  return (
    <div className="mt-6 bg-white p-5 rounded-2xl shadow-lg border">
      <h3 className="text-lg font-semibold mb-4">Payment</h3>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-neutral-500">Vehicle</div>
          <div className="font-semibold">{vehicle.title}</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-neutral-500">Total Fare</div>
          <div className="font-semibold text-xl">₹ {fare}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePay}
          disabled={loading}
          className={`flex-1 py-3 rounded-xl text-white font-semibold ${
            loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <button
          onClick={onCancel}
          className="px-4 py-3 rounded-xl border text-sm hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
