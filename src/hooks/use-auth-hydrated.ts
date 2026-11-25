"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/auth-store";

function subscribe(onStoreChange: () => void): () => void {
  return useAuthStore.persist.onFinishHydration(onStoreChange);
}

function getHydrated(): boolean {
  return useAuthStore.persist.hasHydrated();
}

function getServerHydrated(): boolean {
  return false;
}

export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribe, getHydrated, getServerHydrated);
}
