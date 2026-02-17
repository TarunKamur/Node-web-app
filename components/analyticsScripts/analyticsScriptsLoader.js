import dynamic from "next/dynamic";
import React from "react";
import { FirebaseSDK } from "./firebaseSDK";
import FacebookPixel from "./facebookPixel";
import { GAdsScript } from "../Gads/GAdsScript";

// const FacebookPixel = dynamic(() => import("./facebookPixel"));
const FlyerSDK = dynamic(() => import("./flyerSDK"));
const GoogleTagManager = dynamic(() => import("./GoogleTagManager"));
const CleverTapScript = dynamic(() => import("./ClevertapScript"));
const BranchioScript = dynamic(() => import("./BranchScript"));

const AnalyticsScriptsLoader = () => {
  return (
    <>
      <GoogleTagManager />
      <GAdsScript/>
      <FlyerSDK />
      <CleverTapScript />
      <FirebaseSDK />
      <FacebookPixel />
      <BranchioScript />
    </>
  );
};

export default AnalyticsScriptsLoader;
