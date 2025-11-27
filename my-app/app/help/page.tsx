"use client";

import { Phone, Mail, MessageSquare, ShieldCheck, AlertCircle, BookOpen, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpen(open === i ? null : i);
  };

  const faq = [
    {
      q: "How do I book a ride on MoveX?",
      a: "Open the MoveX dashboard, choose your pickup & drop location, select the vehicle, and confirm your ride instantly.",
    },
    {
      q: "Is my data secure?",
      a: "We use encrypted Convex database storage and protected routes to ensure your information stays private.",
    },
    {
      q: "How do I contact support?",
      a: "You can use the Contact page or email our team directly using the details below.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 w-full px-6 py-16 flex justify-center">
      <div className="w-full max-w-5xl">

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-slate-900">
            Need <span className="text-indigo-600">Help?</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            We're here to help you with anything related to MoveX.
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Support Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all text-center hover:-translate-y-1">
            <Phone className="text-indigo-600 mx-auto mb-4" size={38} />
            <h3 className="text-xl font-semibold text-slate-900">Call Support</h3>
            <p className="text-slate-500 mt-2">Talk to our support team.</p>
            <p className="font-semibold text-indigo-600 mt-3">+91 98765 43210</p>
          </div>

          {/* Email Support */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all text-center hover:-translate-y-1">
            <Mail className="text-indigo-600 mx-auto mb-4" size={38} />
            <h3 className="text-xl font-semibold text-slate-900">Email Us</h3>
            <p className="text-slate-500 mt-2">We usually respond in 2–6 hours.</p>
            <p className="font-semibold text-indigo-600 mt-3">support@movex.com</p>
          </div>

          {/* Chat Support */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all text-center hover:-translate-y-1">
            <MessageSquare className="text-indigo-600 mx-auto mb-4" size={38} />
            <h3 className="text-xl font-semibold text-slate-900">Live Chat</h3>
            <p className="text-slate-500 mt-2">Chat with our Assistant.</p>
            <p className="font-semibold text-indigo-600 mt-3">Available 24/7</p>
          </div>
        </div>

        {/* FAQ Section */}
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faq.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <button
                onClick={() => toggle(i)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="font-semibold text-slate-900 text-lg">{item.q}</span>
                <ChevronDown
                  size={22}
                  className={`text-slate-600 transform transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open === i && (
                <p className="mt-3 text-slate-500 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>

        {/* Extra Info */}
        <div className="mt-16 text-center">
          <BookOpen size={40} className="text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900">Still need help?</h3>
          <p className="text-slate-500 mt-2">
            Visit our Contact page or reach out directly. We're always here for you.
          </p>

          <a
            href="/contact"
            className="inline-block mt-6 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl shadow-md hover:bg-indigo-700 transition-all"
          >
            Go to Contact Page
          </a>
        </div>
      </div>
    </div>
  );
}
