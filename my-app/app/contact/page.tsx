"use client";

import React, { useState } from "react";
import { 
  Send, 
  User, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  Sparkles 
} from "lucide-react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Contact() {

  const saveContact = useMutation(api.contact.saveContact);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await saveContact(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      
      // Auto-reset after 5 seconds (optional, since we added a button)
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Failed to send", error);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Deco */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Text */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium">
              <Sparkles size={14} />
              <span>We'd love to hear from you</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
              Contact{" "}
              <span className="text-transparent bg-clip-text `bg-gradient-to-r` from-blue-600 to-indigo-600">
                MoveX
              </span>
            </h1>

            <p className="text-lg text-slate-500 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Have a question, proposal, or just want to say hello?
              Drop us a line and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">

          {/* ----------------- SUCCESS SCREEN ----------------- */}
          <div
            className={`absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-8 text-center transition-all duration-500 ease-out ${
              status === "success"
                ? "opacity-100 scale-100 visible"
                : "opacity-0 scale-95 invisible pointer-events-none"
            }`}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs">
              Thanks for reaching out, {form.name || "friend"}. We'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="px-8 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Send Another
            </button>
          </div>

          {/* ----------------- FORM SECTION ----------------- */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              status === "success" ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100"
            }`}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={status === "submitting"}
                />
              </div>

              {/* Email */}
              <div className="group relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={status === "submitting"}
                />
              </div>

              {/* Message */}
              <div className="group relative">
                <div className="absolute left-4 top-6 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <MessageSquare size={20} />
                </div>
                <textarea
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-medium"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  disabled={status === "submitting"}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}