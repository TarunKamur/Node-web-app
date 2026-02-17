import { appConfig } from "@/config/app.config";
import Script from "next/script";
import React from "react";

export const GAdsScript = () => {
  if (!appConfig?.ads?.GoogleAds) return null;
  return (
    <Script
      async="async"
      src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
    />
  );
};
