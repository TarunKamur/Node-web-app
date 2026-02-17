/* eslint-disable no-empty */
/* eslint-disable no-restricted-syntax */
import nookies from "nookies"; // using nookies package for managing cookies on both environments..

export const getItem = (key) => {
  try {
    const ele = window.localStorage.getItem(`${key}-v3`);
    if (ele) {
      return JSON.parse(ele);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getItemSession = (key) => {
  try {
    const ele = window.sessionStorage.getItem(`${key}-v3`);
    if (ele) {
      return JSON.parse(ele);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getItemDirect = (key) => {
  try {
    const ele = window.localStorage.getItem(`${key}`);
    if (ele) {
      return JSON.parse(ele);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const getItemEnc = (key) => {
  try {
    const ele = window.localStorage.getItem(`${key}-v3`);
    if (ele) {
      return JSON.parse(atob(ele));
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const setItem = (key, value) => {
  try {
    window.localStorage.setItem(`${key}-v3`, JSON.stringify(value));
  } catch (e) {
    // on err
  }
};

export const setItemSession = (key, value) => {
  try {
    window.sessionStorage.setItem(`${key}-v3`, JSON.stringify(value));
  } catch (e) {
    // on err
  }
};

export const setItemDirect = (key, value) => {
  try {
    window.localStorage.setItem(`${key}`, JSON.stringify(value));
  } catch (e) {
    // on err
  }
};

export const setItemEnc = (key, value) => {
  try {
    window.localStorage.setItem(`${key}-v3`, btoa(JSON.stringify(value)));
  } catch (e) {
    // on err
  }
};

export const deleteItem = (key) => {
  try {
    window.localStorage.removeItem(`${key}-v3`);
  } catch (e) {
    // on err
  }
};

// delete item from local storage
export const deleteItemFromLocalStore = (dltItem, deleteItemsList) => {
  if (dltItem == true) {
    for (const localItem of deleteItemsList) {
      try {
        window.localStorage.removeItem(localItem);
      } catch (e) {
        // on err
      }
    }
  } else {
    // delete other then mentioned objects

    for (let i = 0; i < window.localStorage.length; i += 1) {
      if (deleteItemsList.indexOf(window.localStorage.key(i)) == -1) {
        try {
          window.localStorage.removeItem(window.localStorage.key(i));
        } catch (exception) {
          // on err
        }
      }
    }
  }
};

export const clearStorage = () => {
  try {
    // window.localStorage.clear();
    const allNookies = getNookieNames();
    const CTNookies = allNookies.filter((ele) => !ele.includes("WZRK"));
    deleteItemFromNookie(true, CTNookies);
    const keysLocal = Object.keys(localStorage);
    const CTkeys = keysLocal.filter(
      (ele) =>
        !ele.includes("WZRK") &&
        ele != "userNum" &&
        ele != "AcceptCookies-v3" &&
        ele != "app-dwnld-hdr-v3" &&
        ele != "boxId-v3" &&
        ele != "previousLoginJson-v3"
    );
    deleteItemFromLocalStore(true, CTkeys);
    const allCookies = getCookieNames();
    const CTcookies = allCookies.filter((ele) => !ele.includes("WZRK"));
    deleteItemFromCookie(true, CTcookies);
  } catch (e) {
    // on err
  }
};

export const getCookie = (key) => {
  const name = `_${key}_v3=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
};

export const setCookie = (key, value) => {
  const d = new Date();
  // const [, subdomain, rest] = window.location.host.match(/^(.+?)\.(.+)$/);
  const domain = window.location.host.match(/^(.+?)\.(.+)$/);
  d.setTime(d.getTime() + 10 * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${key}=${value}; domain=${domain}; ${expires}; path=/`;
};

export const deleteCookie = (name) => {
  const key = `_${name}_v3`;
  try {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  } catch (e) {}
};

export const clearCookies = () => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

// delete from Cookie.
export const deleteItemFromCookie = (dltItem, deleteItemsList) => {
  const cookies = document.cookie.split(";");
  if (dltItem == true) {
    // clear only mentioned objects
    deleteItemsList.forEach(function (cookieName) {
      try {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } catch (e) {}
    });
  } else {
    // clear other than mentioned objects
    try {
      for (let i = 0; i < cookies.length; i += 1) {
        const myCookie = cookies[i];
        // var pos = myCookie.split("=");
        // var key1=pos[0].trim();
        const eqPos = myCookie.indexOf("=");
        const name = eqPos > -1 ? myCookie.substr(0, eqPos) : myCookie;
        const key1 = name.trim();
        for (const localItem of deleteItemsList) {
          if (key1 != `_${localItem}_v3`) {
            document.cookie = `${key1}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
          }
        }
      }
    } catch (exception) {}
  }
};

// Function to get an array of cookie names
export const getCookieNames = () => {
  const cookies = document.cookie; // Get the cookie string
  const cookieArray = cookies.split(";"); // Split the string into an array of individual cookies

  const cookieNames = [];

  // Extract the names from each cookie
  cookieArray.forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim(); // Get the cookie name
    cookieNames.push(name);
  });

  return cookieNames;
};

export const getNookie = (key, ctx = {}) => {
  const cookies = nookies.get(ctx);
  const cookie = cookies[`_${key}_v3`];
  return cookie ? JSON.parse(cookie) : "";
};

export const setNookie = (
  key,
  value,
  ctx = {},
  expires = 10 * 24,
  path = "/"
) => {
  nookies.set(ctx, `_${key}_v3`, JSON.stringify(value), {
    maxAge: expires * 60 * 60,
    path,
  });
  return true;
};

export const deleteNookie = (key, ctx = {}, path = "/") => {
  nookies.destroy(ctx, `_${key}_v3`, { path });
  return true;
};

export const clearNookies = (ctx = {}) => {
  const cookies = nookies.get(ctx);
  for (const key in cookies) {
    // eslint-disable-next-line no-prototype-builtins
    if (cookies?.hasOwnProperty(key)) {
      nookies?.destroy(ctx, key, {
        path: "/", // THE KEY IS TO SET THE SAME PATH
      });
    }
  }
};

// delete from Cookie.
export const deleteItemFromNookie = (dltItem, deleteItemsList, ctx = {}) => {
  if (dltItem == true) {
    // clear only mentioned objects
    deleteItemsList.forEach(function (nookieName) {
      try {
        nookies.destroy(ctx, nookieName, { path: "/" });
      } catch (e) {}
    });
  } else {
    // clear other than mentioned objects
    try {
      const cookies = nookies.get(ctx);
      for (const key in cookies) {
        // eslint-disable-next-line no-prototype-builtins
        if (cookies.hasOwnProperty(key) && !deleteItemsList.includes(key)) {
          nookies?.destroy(ctx, key, {
            path: "/", // THE KEY IS TO SET THE SAME PATH
          });
        }
      }
    } catch (exception) {}
  }
};

// Function to get an array of cookie names
export const getNookieNames = (ctx = {}) => {
  const cookies = nookies.get(ctx);
  return Object.keys(cookies);
};
