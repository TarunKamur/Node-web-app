import { useEffect } from 'react';

/**
 * The useBeforeUnload function in JavaScript sets up an event listener for the beforeunload event and
 * executes a callback function when the event is triggered.
 * @param callback - The `callback` parameter in the `useBeforeUnload` function is a function that will
 * be called when the `beforeunload` event is triggered on the window. This function allows you to
 * perform certain actions or show a confirmation message before the user navigates away from the page.
 */
export default function useBeforeUnload(callback) {
  useEffect(() => {
    const eventListener = (event) => {
      if (typeof callback === 'function') {
        callback();
      }
    };

    window.addEventListener('beforeunload', eventListener);

    return () => {
      window.removeEventListener('beforeunload', eventListener);
    };
  }, [callback]);
}
