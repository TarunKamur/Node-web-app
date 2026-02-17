import { useStore } from "@/store/store";
import React, { useEffect, useState } from "react";
import { getItem } from "@/services/local-storage.service";
import { useRouter } from "next/router";

const D2HComponent = () => {
  const [url, setUrl] = useState(process?.env?.myd2hspace);
  const iframeRef = React.useRef(null);
  const router = useRouter();

  const {
    state: { userDetails },
  } = useStore();
  const getMarginTop = () => {
    if (window.innerWidth >= 1199) {
      return "95px";
    }
    return "0px";
  };
  useEffect(() => {
    if (userDetails?.authToken && userDetails?.phoneNumber) {
      let mobileNmbr = userDetails?.phoneNumber.split("-")[1];
      const sanitizedUrl = url
        .replace("TTT", userDetails?.authToken)
        .replace("NNN", mobileNmbr);
      setUrl(sanitizedUrl);
    }

    document.body.style.overflow = "hidden";

    // Cleanup body overflow style when component unmounts
    return () => {
      document.body.style.overflow = "visible";
    };
  }, [userDetails]); // Include userDetails as a dependency so that the effect runs when it changes

  return (
    <div>
      <iframe
        ref={iframeRef}
        id="myiFrame"
        src={url}
        allow="encrypted-media  https://unified.watcho.com/"
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          background: "black",
          marginTop: getMarginTop(),
        }}
        title="D2H Content"
      />
    </div>
  );
};

export default D2HComponent;
