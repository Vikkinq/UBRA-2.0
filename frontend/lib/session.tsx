"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth";

const UserContext = createContext<AuthUser | null>(null);

export function UserProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
