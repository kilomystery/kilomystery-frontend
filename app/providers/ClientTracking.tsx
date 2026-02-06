"use client";

import Tracking from "./Tracking";
import { TRACKING_IDS } from "@/app/config/tracking";

export default function ClientTracking() {
  return (
    <Tracking
      gaId={TRACKING_IDS.GA}
      metaPixelId={TRACKING_IDS.META}
      tiktokPixelId={TRACKING_IDS.TIKTOK}
    />
  );
}
