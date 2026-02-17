import { useEffect } from "react";

const useMobileHideHeaderFooter = (
  headerId = "headerHomePage",
  footerId = "app_footer_id",
  breakpoint = 991
) => {
  useEffect(() => {
    const windowWidth = window.innerWidth;
    let headerElement = null;
    let footerElement = null;

    if (windowWidth <= breakpoint) {
      setTimeout(() => {
        headerElement = document.getElementById(headerId);
        footerElement = document.getElementById(footerId);

        if (headerElement) headerElement.style.display = "none";
        if (footerElement) footerElement.style.display = "none";
      }, 1);
    }

    return () => {
      if (headerElement) headerElement.style.display = "inline";
      if (footerElement) footerElement.style.display = "block";
    };
  }, [headerId, footerId, breakpoint]);
};

export default useMobileHideHeaderFooter;
