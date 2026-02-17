
import { useState, useEffect } from 'react';

function useDebounce(fn, ms) {
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    return () => {
      clearTimeout(timer);
    };
  }, [timer]);

  return function (...args) {
    clearTimeout(timer);
    setTimer(setTimeout(() => fn(...args), ms));
  };
}

export default useDebounce;
