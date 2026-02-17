import { useState,useEffect } from "react";
function useWindowScroll() {
  const [totalHeightpx, setTotalHeightpx] = useState(null);
  const [scrolledToppx, setScrolledToppx] = useState(null);
  const [scrolledBottompx, setscrolledBottompx] = useState(null);

  useEffect(() => {
    setTotalHeightpx(document.documentElement.scrollHeight);
    setScrolledToppx(window.scrollY);
    setscrolledBottompx(
      document.documentElement.scrollHeight - window.innerHeight
    );

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function onScroll(e) {
    setScrolledToppx(window.scrollY);
    setscrolledBottompx(
      document.documentElement.scrollHeight -
      window.innerHeight -
      window.scrollY
    );
  }

  return { totalHeightpx: totalHeightpx, scrolledToppx: scrolledToppx, scrolledBottompx: scrolledBottompx };
}

export default useWindowScroll