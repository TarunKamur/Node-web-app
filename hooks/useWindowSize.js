import { useEffect, useState } from "react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ height: 0, width: 0 });

  useEffect(() => {
    // inside useEffect, the window is always present
    const updateWindowSize = () => {
      setWindowSize({ height: window.innerWidth, width: window.innerWidth });
    };

    updateWindowSize(); // as soon as we are on the client, run this handler

    window.addEventListener("resize", updateWindowSize); // works only on resize events

    return () => {
      window.removeEventListener("resize", updateWindowSize); // clean up
    };
  }, []); // attach this once

  return windowSize;
};
