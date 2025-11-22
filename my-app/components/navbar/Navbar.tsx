"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import {
  House,
  Car,
  MessagesSquare,
  LifeBuoy,
  Menu,
  X,
} from "lucide-react";

// TYPES
interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname(); // for ACTIVE PAGE HIGHLIGHT

  // NAVBAR SCROLL HIDE/SHOW
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > 50 && window.scrollY > lastY) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      lastY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // NAVIGATION LINKS
  const navLinks: NavLinkItem[] = useMemo(
    () => [
      { name: "Home", href: "/", icon: House },
      { name: "Services", href: "/services", icon: Car },
      { name: "Contact", href: "/contact", icon: MessagesSquare },
      { name: "Help", href: "/help", icon: LifeBuoy },
    ],
    []
  );

  // REUSABLE NAV ITEM
  const NavItem = ({
    item,
    mobile = false,
  }: {
    item: NavLinkItem;
    mobile?: boolean;
  }) => {
    const isActive = pathname === item.href;

    return (
      <Link
        href={item.href}
        onClick={() => mobile && setOpen(false)}
        className={`relative flex items-center gap-3 transition duration-300 py-2
          ${isActive ? "text-yellow-400" : "text-slate-300 hover:text-yellow-400"}`}
      >
        <item.icon className="w-5 h-5" />
        {item.name}

        {/* ACTIVE UNDERLINE */}
        <span
          className={`hidden md:block absolute left-0 -bottom-[3px] h-0.5 rounded-full bg-yellow-400 transition-all duration-300
            ${isActive ? "w-full" : "w-0 group-hover:w-full"}
          `}
        ></span>
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full backdrop-blur-xl bg-black text-white border-b border-yellow-500/20 shadow-xl transition-all duration-500 z-50
        ${scrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="MoveX"
            className="w-11 h-11 rounded-full border-2 border-yellow-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all"
          />

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Move<span className="text-yellow-400 drop-shadow-lg">X</span>
          </h1>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        {/* DESKTOP AUTH */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="px-5 py-2 rounded-full border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition">
                Login
              </button>
            </SignInButton>

            <SignUpButton>
              <button className="px-5 py-2 rounded-full bg-yellow-500 text-black font-bold shadow hover:brightness-110 transition">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "h-10 w-10 border-2 border-yellow-400 rounded-full",
                },
              }}
            />
          </SignedIn>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-3 rounded-lg bg-slate-800 text-yellow-400"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-slate-900/95 border-t border-slate-700/50 px-6 py-5 flex flex-col gap-4 animate-slideDown">
          <style>
            {`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-slideDown {
              animation: slideDown 0.3s ease-out forwards;
            }
            `}
          </style>

          {navLinks.map((item) => (
            <NavItem key={item.name} item={item} mobile />
          ))}

          <div className="mt-4 pt-4 border-t border-slate-700">
            <SignedOut>
              <SignInButton>
                <button className="w-full px-5 py-3 rounded-xl border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition">
                  Login
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="w-full px-5 py-3 rounded-xl bg-yellow-500 text-black font-bold shadow hover:brightness-110 transition">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox:
                        "h-10 w-10 border-2 border-yellow-500 rounded-full",
                    },
                  }}
                />
                <span className="text-slate-200">My Account</span>
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
