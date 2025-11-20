"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <div className="p-6">Loading...</div>;

  if (!isSignedIn) return <div className="p-6">Please sign in to view this page</div>;

  return (
    <div className="p-6">
      Hello {user?.firstName ?? "User"}!
    </div>
  );
}
