"use client";

import React, { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./index";
import { setOnUnauthorized } from "@/lib/api-client";
import { setUnauthenticated } from "./slices/authSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // When any API request hits 401 Unauthorized, dispatch unauthenticated state
    setOnUnauthorized(() => {
      if (storeRef.current) {
        storeRef.current.dispatch(setUnauthenticated());
      }
    });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export default StoreProvider;
