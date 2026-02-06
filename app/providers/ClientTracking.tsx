"use client";

import Tracking from "./Tracking";
import { TRACKING_IDS } from "@/app/config/tracking";

export default function ClientTracking() {
  if (!TRACKING_IDS.GA && !TRACKING_IDS.META && !TRACKING_IDS.TIKTOK) {
    return null;
  }

  return (
    <Tracking
      gaId={TRACKING_IDS.GA}
      metaPixelId={TRACKING_IDS.META}
      tiktokPixelId={TRACKING_IDS.TIKTOK}
    />
  );
}
