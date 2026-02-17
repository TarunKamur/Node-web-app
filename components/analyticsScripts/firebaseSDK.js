import { initializeApp } from "firebase/app";
import { appConfig } from "@/config/app.config";


let firebaseAppGlobal = null;

const FirebaseSDK = () => {
  if (!appConfig?.analyticsConfig?.firebase) {
    return;
  }
  const firebaseConfig={...process?.env?.firebaseConfig}
  firebaseAppGlobal = initializeApp(firebaseConfig);
};

export { FirebaseSDK, firebaseAppGlobal };
