"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ProfileContext,
  PROFILE_MAP,
  DEFAULT_PROFILE_ID,
  LS_KEY,
  type TravelerProfileId,
} from "@/lib/profile";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileId, setProfileIdState] = useState<TravelerProfileId>(DEFAULT_PROFILE_ID);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as TravelerProfileId | null;
    if (stored && PROFILE_MAP.has(stored)) {
      setProfileIdState(stored);
    }
  }, []);

  const setProfileId = useCallback((id: TravelerProfileId) => {
    setProfileIdState(id);
    localStorage.setItem(LS_KEY, id);
  }, []);

  const profile = PROFILE_MAP.get(profileId)!;

  return (
    <ProfileContext.Provider value={{ profile, setProfileId }}>
      {children}
    </ProfileContext.Provider>
  );
}
