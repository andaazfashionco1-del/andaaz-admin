import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and hydration, true once running in the browser. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
