"use client";

import { useEffect } from "react";
import Tracking from "./Tracking";
import { TRACKING_IDS } from "@/app/config/tracking";

const IS_DEV = process.env.NODE_ENV !== "production";

export default function ClientTracking() {
  useEffect(() => {
    if (IS_DEV && typeof window !== "undefined") {
      console.log("[KM_TRACK] ClientTracking mounted", window.location?.pathname);
    }
  }, []);

  return (
    <Tracking
      gaId={TRACKING_IDS.GA}
      metaPixelId={TRACKING_IDS.META}
      tiktokPixelId={TRACKING_IDS.TIKTOK}
    />
  );
}
