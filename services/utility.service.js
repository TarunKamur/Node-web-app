import { appConfig } from "@/config/app.config";
import { getItem, getItemEnc } from "@/services/local-storage.service";
import { SHA256, enc, AES, mode, pad } from "crypto-js";
import { checkUserLogin } from "./user.service";
import { OtpVerification, EditProfileconstant } from "@/.i18n/locale";

export const getPagePath = (url) => {
  let pagePath;
  pagePath = url.split("?")[0];
  !!pagePath && (pagePath = decodeURIComponent(pagePath.replace("/", "")));
  return pagePath;
};

export const getQueryParams = (url) => {
  if (!!url && !!url.split("?")[1]) {
    let q_params = "";
    if (!!url.includes("?ut=")) {
      var localU = url.split("?ut=");
      if (!!localU[1]) {
        var a = decodeURIComponent(localU[1]);
        try {
          localU[1] = atob(a);
          q_params = JSON.parse(
            '{"' +
              localU[1]
                .replace(/"/g, '\\"')
                .replace(/&&&/g, '","')
                .replace(/===/g, '":"') +
              '"}'
          );
        } catch (error) {
          console.error("Error decoding base64 or parsing JSON:", error);
        }
      }
    } else {
      let localU = url.split("?")[1];
      const queryParams = new URLSearchParams(localU);
      q_params = {};
      for (const [key, value] of queryParams.entries()) {
        q_params[key] = value;
      }
    }
    return q_params;
  }
};

export const jsonToQueryParams = (jsonObj) => {
  return Object.keys(jsonObj)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObj[key])}`
    )
    .join("&");
};

export const getTimeMenuList = () => {
  let timeList = [];
  for (let i = 0; i < 24; i++) {
    if (i <= 12) {
      if (i == 12) {
        timeList.push(i + ":00 PM");
        timeList.push(i + ":30 PM");
      } else if (i < 10) {
        timeList.push("0" + i + ":00 AM");
        timeList.push("0" + i + ":30 AM");
      } else {
        timeList.push(i + ":00 AM");
        timeList.push(i + ":30 AM");
      }
    } else {
      let diff = i - 12;
      if (diff < 10) {
        timeList.push("0" + diff + ":00 PM");
        timeList.push("0" + diff + ":30 PM");
      } else {
        timeList.push(diff + ":00 PM");
        timeList.push(diff + ":30 PM");
      }
    }
  }

  return timeList;
};

export const newTimeList = () => {
  let timeList = [];
  let das = new Date();
  let d =
    das.getMonth() +
    1 +
    "/" +
    das.getDate() +
    "/" +
    das.getFullYear() +
    " " +
    das.getHours() +
    ":" +
    (das.getMinutes() > 30 ? "30" : "00") +
    ":00";
  let startTime = new Date(d).getTime();
  let endTime = startTime + 24 * 60 * 60 * 1000;
  for (let i = startTime; i < endTime; i = i + 30 * 60 * 1000) {
    let iDate =
      (new Date(i).getHours() == 0
        ? "12"
        : new Date(i).getHours() > 12
          ? new Date(i).getHours() - 12 < 10
            ? "0" + (new Date(i).getHours() - 12)
            : new Date(i).getHours() - 12
          : new Date(i).getHours() < 10
            ? "0" + new Date(i).getHours()
            : new Date(i).getHours()) +
      ":" +
      (new Date(i).getMinutes() == 0 ? "00" : "30") +
      " " +
      (new Date(i).getHours() >= 12 ? "PM" : "AM");
    timeList.push(iDate);
  }
  return timeList; //24 hours need
};

export const getDeeplinkData = (data) => {
  if (data == undefined || data == "") {
    return undefined;
  }
  try {
    data = JSON.parse(data);
  } catch (e) {
    // return undefined;
  }
  if (!!data?.url && data.url.length != 0) {
    return data.url;
  } else if (!!data?.contentCode) {
    let deepLink = data.contentCode.includes("//")
      ? data.contentCode.split("//")[1]
      : data.contentCode;
    return `https://${deepLink}`;
  } else {
    return undefined;
  }
};

export const fromStyle = {
  "& .MuiInputLabel-root": {
    color: "#666 !important",
    width: "100%",
  },
  " .MuiTextField-root": {
    width: "100%",
    color: "#666 !important",
  },
  ".MuiSvgIcon-root": { color: "#666 !important" },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": { borderColor: "#52525c !important" },
  },
  "&:focus-within fieldset, &:focus-visible fieldset": {
    border: "1px solid #777!important",
  },
  "&:hover fieldset": {
    borderColor: "yellow",
  },
  ".MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--white-text-color)",
  },
  "& .MuiInputBase-input": {
    color: "#ccc !important",
  },
  "& input:-webkit-autofill": {
    "-webkit-box-shadow": "0 0 0 100px #262626 inset;",
  },
};
export const fromStyle2 = {
  "& .MuiInputLabel-root": {
    color: "var(--white-text-color)",
    width: "100%",
  },
  " .MuiTextField-root": {
    width: "100%",
    color: "#666 !important",
  },
  ".MuiSvgIcon-root": { color: "#666 !important" },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": { borderColor: "#ccc !important" },
  },
  "&:focus-within fieldset, &:focus-visible fieldset": {
    border: "1px solid #ccc !important",
  },
  "&:hover fieldset": {
    borderColor: "yellow",
  },
  ".MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#ccc",
  },
  "& .MuiInputBase-input": {
    color: "#ccc !important",
  },
  "& input:-webkit-autofill": {
    "-webkit-box-shadow": "0 0 0 100px #262626 inset;",
  },
};
//validate Email
export const validateE = (value, regex, oldEmail) => {
  if (value == undefined || value == "") {
    return { valid: false, error: "Email Required" };
  } else if (!new RegExp(regex).test(value)) {
    return { valid: false, error: "Enter a valid email address" };
  } else if (!!oldEmail && value == oldEmail) {
    return { valid: false, error: "New Email is same as Old Email" };
  } else {
    return { valid: true, error: "" };
  }
};

//validate Password
export const validateP = (value, min, max) => {
  if (value == undefined || value == "") {
    return { valid: false, error: "Password Required" };
  } else if (value.length < min || value.length > max) {
    return {
      valid: false,
      error: `Password length should be ${min}-${max} characters`,
    };
  } else {
    return { valid: true, error: "" };
  }
};

//validate confirm password
export const validateCP = (value, old) => {
  if (value == undefined || value == "") {
    return { valid: false, error: "Password Required" };
  } else if (value != old) {
    return {
      valid: false,
      error: "Passwords are mismatched",
    };
  } else {
    return { valid: true, error: "" };
  }
};

//validate Mobile
export const validateM = (value, regex) => {
  if (value == undefined || value == "") {
    return { valid: false, error: "Mobile Number Required" };
  } else if (!new RegExp(regex).test(value)) {
    return { valid: false, error: "Invalid Mobile Number" };
  } else {
    return { valid: true, error: "" };
  }
};

//validate OTP
export const validateO = (value, min, max, localLang) => {
  if (value == undefined || value == "") {
    return {
      valid: false,
      error: OtpVerification?.[localLang]?.OTP_Required || "OTP Required",
    };
  } else if (value.length < min || value.length > max) {
    return {
      valid: false,
      error:
        OtpVerification?.[localLang]?.Plese_Enter_Valid_OTP ||
        "Please enter a valid OTP ",
    };
  } else {
    return { valid: true, error: "" };
  }
};

//validate Name
export const validateN = (value, regex, key, localLang) => {
  if (value == undefined || value.trim() == "") {
    return {
      valid: false,
      error: `${key} ${EditProfileconstant[localLang]?.Required}`,
    };
  } else if (!new RegExp(regex).test(value)) {
    return {
      valid: false,
      error: `${EditProfileconstant[localLang]?.Invalid} ${key}`,
    };
  } else {
    return { valid: true, error: "" };
  }
};

// validate Name (Only Alphabets)
export const validateFirstAndLastName = (value, key) => {
  if (!new RegExp(/^[A-Za-z]*$/).test(value)) {
    return { valid: false, error: `Invalid ${key}` };
  } else {
    return { valid: true, error: "" };
  }
};

//get random number
export const getRandonNumber = () => {
  const min = 10000;
  const max = 99999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
};

/* Get AES_Key , AES_IV based on device id */
function getEncryptionData() {
  let deviceId = !!getItem("clientId") ? JSON.parse(getItem("clientId")) : "5";
  let encryptionKeys = process?.env?.encryptionKeys?.filter((res) => {
    return Object.keys(res)[0] == deviceId;
  });
  return encryptionKeys[0][deviceId];
}

/* encryption and decription methods*/
export function encryptData(x) {
  let eKeys = getEncryptionData();
  try {
    let hash = SHA256(eKeys?.key).toString().substring(0, 32);
    let words = enc.Utf8.parse(hash);
    let base64Key = enc.Base64.stringify(words);
    base64Key = enc.Base64.parse(base64Key);
    words = enc.Utf8.parse(eKeys?.iv);
    let base64IV = enc.Base64.stringify(words);
    base64IV = enc.Base64.parse(base64IV);
    let encrypted = AES.encrypt(x, base64Key, {
      iv: base64IV,
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });
    return encrypted.toString();
  } catch (e) {}
}

export function decryptData(x) {
  let eKeys = getEncryptionData();
  try {
    let hash = SHA256(eKeys?.key).toString().substring(0, 32);
    let words = enc.Utf8.parse(hash);
    let base64Key = enc.Base64.stringify(words);
    base64Key = enc.Base64.parse(base64Key);
    words = enc.Utf8.parse(eKeys?.iv);
    let base64IV = enc.Base64.stringify(words);
    base64IV = enc.Base64.parse(base64IV);
    let decrypted = AES.decrypt(x, base64Key, { iv: base64IV });
    return decrypted.toString(enc.Utf8);
  } catch (e) {}
}

export const generateRandomString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

export function debounceFunction(fn, ms) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(function () {
      fn(...args);
    }, ms);
  };
}

export function extractScrptTag(htmlContent) {
  const scriptRegex = /<script>([\s\S]*?)<\/script>/i;

  const scriptMatch = htmlContent.match(scriptRegex);

  if (scriptMatch && scriptMatch[1]) {
    const scriptContent = scriptMatch[1];
    try {
      return eval(scriptContent);
    } catch (error) {
      console.warn("Error executing script:", error);
    }
  } else {
  }
}

export const getDateByEpoc = (epoc) => {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  let date = new Date(epoc);
  let dayNum = date.getUTCDate();
  let formattedDay = dayNum.toString().padStart(2, "0"); // Pad with 0 if day is single digit
  let month = months[date.getUTCMonth()];
  let year = date.getUTCFullYear();

  return `${formattedDay}-${month}-${year}`;
};

// get current screen resolution
export const getResolution = () => {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  return { width, height };
};
/* ends here*/

// analytics utils
export const recoverDeID = (dId) => {
  if (dId) {
    dId = dId.toString();
    switch (dId) {
      case "5":
        return "web";
      case "61":
        return "pwa";
      case "7":
        return "iphone";
      case "6":
        return "ipad";
      case "11":
        return "andriod";
      default:
        return "web";
    }
  }
};

const getMonthAbbreviation = (month) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[month];
};

const convertEpochToDDMMMYYYY = (epoch) => {
  const date = new Date(epoch);
  const day = date.getDate().toString().padStart(2, "0");
  const month = getMonthAbbreviation(date.getMonth());
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const getPlansDetails = (sendStartAndEndDate = false) => {
  const login = getItem("isloggedin") === true;

  const uDetails = checkUserLogin();
  const packagesInfo = getItem("activePackagesList")?.data;
  if (login) {
    // const userDetails = JSON.parse(getItemEnc("uDetails") || "{}");
    if (packagesInfo?.length > 0) {
      const planDetails = {
        plan_duration: packagesInfo[0]?.packageType,
        plan_amount: packagesInfo[0]?.saleAmount,
        plan_name: packagesInfo[0]?.name,
        plan_id: packagesInfo[0]?.id,
      };

      if (sendStartAndEndDate) {
        planDetails["start_date"] = packagesInfo[0].effectiveFrom
          ? convertEpochToDDMMMYYYY(packagesInfo[0].effectiveFrom)
          : convertEpochToDDMMMYYYY(packagesInfo[0].purchaseDate);
        planDetails["end_date"] = convertEpochToDDMMMYYYY(
          packagesInfo[0].expiryDate
        );
      }

      return planDetails;
    } else {
      return {
        plan_duration: "-1",
        plan_amount: "-1",
        plan_name: "-1",
        plan_id: "-1",
      };
    }
  } else if (sendStartAndEndDate) {
    return {
      plan_duration: "-1",
      plan_amount: "-1",
      plan_name: "-1",
      plan_id: "-1",
      start_date: "-1",
      end_date: "-1",
    };
  } else {
    return {
      plan_duration: "-1",
      plan_amount: "-1",
      plan_name: "-1",
      plan_id: "-1",
    };
  }
};

export const getSelectedMenu = (pagePath) => {
  if (!pagePath.startsWith("http") && !pagePath == "plans/list") {
    pagePath = pagePath.replace(/\//g, "");
  }
  const systemConfig = getItem("systemConfigs") || {};
  const menuData = systemConfig?.data?.menus || [];
  if (pagePath === "" || pagePath === "/") {
    return "Home";
  }

  for (const menuItem of menuData) {
    if (menuItem?.targetPath === pagePath) {
      return menuItem.displayText;
    }

    for (const subMenu of menuItem?.subMenus || []) {
      if (subMenu?.targetPath === pagePath) {
        return subMenu?.displayText;
      }
    }
  }

  return "NA";
};

export const getEventName = (pagePath, sectionInfo, isGridView) => {
  if (pagePath === "search") {
    return isGridView ? "Search_Results" : "Search_Page";
  }

  if (pagePath.includes("favourite") || pagePath.includes("favorite")) {
    const systemConfig = getItem("systemConfigs") || {};
    if (systemConfig?.data?.configs?.favouritesTargetPath === pagePath) {
      return "My_Favourites_Page";
    }
  }
  const menuSelected = getSelectedMenu(pagePath);
  switch (sectionInfo?.pageType) {
    case "content":
      return menuSelected !== "NA" ? menuSelected : "Content_Page";
    case "list":
      return menuSelected !== "NA" ? menuSelected : "View_All";
    case "details":
      return "Details_page";
    case "player":
      return "Player_Page";
    case "overlay":
      return "Overlay";
    default:
      return "NA";
  }
};

export const getUserType = (type) => {
  if (type == 3) {
    return "Watcho User";
  } else if (type == 4) {
    return "Siti User";
  } else if (type == 2) {
    return "D2H User";
  } else if (type == 1) {
    return "Dish User";
  } else {
    return "Watcho User";
  }
};

// TODO: Need to make it dynamic from api
export const getCountryCodes = () => {
  return [
    { name: "Afghanistan", dial_code: "+93", code: "AF" },
    { name: "Albania", dial_code: "+355", code: "AL" },
    { name: "Algeria", dial_code: "+213", code: "DZ" },
    { name: "AmericanSamoa", dial_code: "+1 684", code: "AS" },
    { name: "Andorra", dial_code: "+376", code: "AD" },
    { name: "Angola", dial_code: "+244", code: "AO" },
    { name: "Anguilla", dial_code: "+1 264", code: "AI" },
    { name: "Antarctica", dial_code: "+672", code: "AQ" },
    { name: "Antigua and Barbuda", dial_code: "+1268", code: "AG" },
    { name: "Argentina", dial_code: "+54", code: "AR" },
    { name: "Armenia", dial_code: "+374", code: "AM" },
    { name: "Aruba", dial_code: "+297", code: "AW" },
    { name: "Australia", dial_code: "+61", code: "AU" },
    { name: "Austria", dial_code: "+43", code: "AT" },
    { name: "Azerbaijan", dial_code: "+994", code: "AZ" },
    { name: "Bahamas", dial_code: "+1 242", code: "BS" },
    { name: "Bahrain", dial_code: "+973", code: "BH" },
    { name: "Bangladesh", dial_code: "+880", code: "BD" },
    { name: "Barbados", dial_code: "+1 246", code: "BB" },
    { name: "Belarus", dial_code: "+375", code: "BY" },
    { name: "Belgium", dial_code: "+32", code: "BE" },
    { name: "Belize", dial_code: "+501", code: "BZ" },
    { name: "Benin", dial_code: "+229", code: "BJ" },
    { name: "Bermuda", dial_code: "+1 441", code: "BM" },
    { name: "Bhutan", dial_code: "+975", code: "BT" },
    { name: "Bolivia, Plurinational State of", dial_code: "+591", code: "BO" },
    { name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA" },
    { name: "Botswana", dial_code: "+267", code: "BW" },
    { name: "Brazil", dial_code: "+55", code: "BR" },
    { name: "British Indian Ocean Territory", dial_code: "+246", code: "IO" },
    { name: "Brunei Darussalam", dial_code: "+673", code: "BN" },
    { name: "Bulgaria", dial_code: "+359", code: "BG" },
    { name: "Burkina Faso", dial_code: "+226", code: "BF" },
    { name: "Burundi", dial_code: "+257", code: "BI" },
    { name: "Cambodia", dial_code: "+855", code: "KH" },
    { name: "Cameroon", dial_code: "+237", code: "CM" },
    { name: "Canada", dial_code: "+1", code: "CA" },
    { name: "Cape Verde", dial_code: "+238", code: "CV" },
    { name: "Cayman Islands", dial_code: "+ 345", code: "KY" },
    { name: "Central African Republic", dial_code: "+236", code: "CF" },
    { name: "Chad", dial_code: "+235", code: "TD" },
    { name: "Chile", dial_code: "+56", code: "CL" },
    { name: "China", dial_code: "+86", code: "CN" },
    { name: "Christmas Island", dial_code: "+61", code: "CX" },
    { name: "Cocos (Keeling) Islands", dial_code: "+61", code: "CC" },
    { name: "Colombia", dial_code: "+57", code: "CO" },
    { name: "Comoros", dial_code: "+269", code: "KM" },
    { name: "Congo", dial_code: "+242", code: "CG" },
    {
      name: "Congo, The Democratic Republic of the",
      dial_code: "+243",
      code: "CD",
    },
    { name: "Cook Islands", dial_code: "+682", code: "CK" },
    { name: "Costa Rica", dial_code: "+506", code: "CR" },
    { name: "Cote d'Ivoire", dial_code: "+225", code: "CI" },
    { name: "Croatia", dial_code: "+385", code: "HR" },
    { name: "Cuba", dial_code: "+53", code: "CU" },
    { name: "Cyprus", dial_code: "+537", code: "CY" },
    { name: "Czech Republic", dial_code: "+420", code: "CZ" },
    { name: "Denmark", dial_code: "+45", code: "DK" },
    { name: "Djibouti", dial_code: "+253", code: "DJ" },
    { name: "Dominica", dial_code: "+1 767", code: "DM" },
    { name: "Dominican Republic", dial_code: "+1 849", code: "DO" },
    { name: "Ecuador", dial_code: "+593", code: "EC" },
    { name: "Egypt", dial_code: "+20", code: "EG" },
    { name: "El Salvador", dial_code: "+503", code: "SV" },
    { name: "Equatorial Guinea", dial_code: "+240", code: "GQ" },
    { name: "Eritrea", dial_code: "+291", code: "ER" },
    { name: "Estonia", dial_code: "+372", code: "EE" },
    { name: "Ethiopia", dial_code: "+251", code: "ET" },
    { name: "Falkland Islands (Malvinas)", dial_code: "+500", code: "FK" },
    { name: "Faroe Islands", dial_code: "+298", code: "FO" },
    { name: "Fiji", dial_code: "+679", code: "FJ" },
    { name: "Finland", dial_code: "+358", code: "FI" },
    { name: "France", dial_code: "+33", code: "FR" },
    { name: "French Guiana", dial_code: "+594", code: "GF" },
    { name: "French Polynesia", dial_code: "+689", code: "PF" },
    { name: "Gabon", dial_code: "+241", code: "GA" },
    { name: "Gambia", dial_code: "+220", code: "GM" },
    { name: "Georgia", dial_code: "+995", code: "GE" },
    { name: "Germany", dial_code: "+49", code: "DE" },
    { name: "Ghana", dial_code: "+233", code: "GH" },
    { name: "Gibraltar", dial_code: "+350", code: "GI" },
    { name: "Greece", dial_code: "+30", code: "GR" },
    { name: "Greenland", dial_code: "+299", code: "GL" },
    { name: "Grenada", dial_code: "+1 473", code: "GD" },
    { name: "Guadeloupe", dial_code: "+590", code: "GP" },
    { name: "Guam", dial_code: "+1 671", code: "GU" },
    { name: "Guatemala", dial_code: "+502", code: "GT" },
    { name: "Guernsey", dial_code: "+44", code: "GG" },
    { name: "Guinea", dial_code: "+224", code: "GN" },
    { name: "Guinea-Bissau", dial_code: "+245", code: "GW" },
    { name: "Guyana", dial_code: "+595", code: "GY" },
    { name: "Haiti", dial_code: "+509", code: "HT" },
    { name: "Holy See (Vatican City State)", dial_code: "+379", code: "VA" },
    { name: "Honduras", dial_code: "+504", code: "HN" },
    { name: "Hong Kong", dial_code: "+852", code: "HK" },
    { name: "Hungary", dial_code: "+36", code: "HU" },
    { name: "Iceland", dial_code: "+354", code: "IS" },
    { name: "India", dial_code: "+91", code: "IN" },
    { name: "Indonesia", dial_code: "+62", code: "ID" },
    { name: "Iran, Islamic Republic of", dial_code: "+98", code: "IR" },
    { name: "Iraq", dial_code: "+964", code: "IQ" },
    { name: "Ireland", dial_code: "+353", code: "IE" },
    { name: "Isle of Man", dial_code: "+44", code: "IM" },
    { name: "Israel", dial_code: "+972", code: "IL" },
    { name: "Italy", dial_code: "+39", code: "IT" },
    { name: "Jamaica", dial_code: "+1 876", code: "JM" },
    { name: "Japan", dial_code: "+81", code: "JP" },
    { name: "Jersey", dial_code: "+44", code: "JE" },
    { name: "Jordan", dial_code: "+962", code: "JO" },
    { name: "Kazakhstan", dial_code: "+7 7", code: "KZ" },
    { name: "Kenya", dial_code: "+254", code: "KE" },
    { name: "Kiribati", dial_code: "+686", code: "KI" },
    {
      name: "Korea, Democratic People's Republic of",
      dial_code: "+850",
      code: "KP",
    },
    { name: "Korea, Republic of", dial_code: "+82", code: "KR" },
    { name: "Kuwait", dial_code: "+965", code: "KW" },
    { name: "Kyrgyzstan", dial_code: "+996", code: "KG" },
    { name: "Lao People's Democratic Republic", dial_code: "+856", code: "LA" },
    { name: "Latvia", dial_code: "+371", code: "LV" },
    { name: "Lebanon", dial_code: "+961", code: "LB" },
    { name: "Lesotho", dial_code: "+266", code: "LS" },
    { name: "Liberia", dial_code: "+231", code: "LR" },
    { name: "Libyan Arab Jamahiriya", dial_code: "+218", code: "LY" },
    { name: "Liechtenstein", dial_code: "+423", code: "LI" },
    { name: "Lithuania", dial_code: "+370", code: "LT" },
    { name: "Luxembourg", dial_code: "+352", code: "LU" },
    { name: "Macao", dial_code: "+853", code: "MO" },
    {
      name: "Macedonia, The Former Yugoslav Republic of",
      dial_code: "+389",
      code: "MK",
    },
    { name: "Madagascar", dial_code: "+261", code: "MG" },
    { name: "Malawi", dial_code: "+265", code: "MW" },
    { name: "Malaysia", dial_code: "+60", code: "MY" },
    { name: "Maldives", dial_code: "+960", code: "MV" },
    { name: "Mali", dial_code: "+223", code: "ML" },
    { name: "Malta", dial_code: "+356", code: "MT" },
    { name: "Marshall Islands", dial_code: "+692", code: "MH" },
    { name: "Martinique", dial_code: "+596", code: "MQ" },
    { name: "Mauritania", dial_code: "+222", code: "MR" },
    { name: "Mauritius", dial_code: "+230", code: "MU" },
    { name: "Mayotte", dial_code: "+262", code: "YT" },
    { name: "Mexico", dial_code: "+52", code: "MX" },
    { name: "Micronesia, Federated States of", dial_code: "+691", code: "FM" },
    { name: "Moldova, Republic of", dial_code: "+373", code: "MD" },
    { name: "Monaco", dial_code: "+377", code: "MC" },
    { name: "Mongolia", dial_code: "+976", code: "MN" },
    { name: "Montenegro", dial_code: "+382", code: "ME" },
    { name: "Montserrat", dial_code: "+1664", code: "MS" },
    { name: "Morocco", dial_code: "+212", code: "MA" },
    { name: "Mozambique", dial_code: "+258", code: "MZ" },
    { name: "Myanmar", dial_code: "+95", code: "MM" },
    { name: "Namibia", dial_code: "+264", code: "NA" },
    { name: "Nauru", dial_code: "+674", code: "NR" },
    { name: "Nepal", dial_code: "+977", code: "NP" },
    { name: "Netherlands", dial_code: "+31", code: "NL" },
    { name: "Netherlands Antilles", dial_code: "+599", code: "AN" },
    { name: "New Caledonia", dial_code: "+687", code: "NC" },
    { name: "New Zealand", dial_code: "+64", code: "NZ" },
    { name: "Nicaragua", dial_code: "+505", code: "NI" },
    { name: "Niger", dial_code: "+227", code: "NE" },
    { name: "Nigeria", dial_code: "+234", code: "NG" },
    { name: "Niue", dial_code: "+683", code: "NU" },
    { name: "Norfolk Island", dial_code: "+672", code: "NF" },
    { name: "Northern Mariana Islands", dial_code: "+1 670", code: "MP" },
    { name: "Norway", dial_code: "+47", code: "NO" },
    { name: "Oman", dial_code: "+968", code: "OM" },
    { name: "Pakistan", dial_code: "+92", code: "PK" },
    { name: "Palau", dial_code: "+680", code: "PW" },
    { name: "Palestinian Territory, Occupied", dial_code: "+970", code: "PS" },
    { name: "Panama", dial_code: "+507", code: "PA" },
    { name: "Papua New Guinea", dial_code: "+675", code: "PG" },
    { name: "Paraguay", dial_code: "+595", code: "PY" },
    { name: "Peru", dial_code: "+51", code: "PE" },
    { name: "Philippines", dial_code: "+63", code: "PH" },
    { name: "Pitcairn", dial_code: "+872", code: "PN" },
    { name: "Poland", dial_code: "+48", code: "PL" },
    { name: "Portugal", dial_code: "+351", code: "PT" },
    { name: "Puerto Rico", dial_code: "+1 939", code: "PR" },
    { name: "Qatar", dial_code: "+974", code: "QA" },
    { name: "Romania", dial_code: "+40", code: "RO" },
    { name: "Russia", dial_code: "+7", code: "RU" },
    { name: "Rwanda", dial_code: "+250", code: "RW" },
    { name: "Réunion", dial_code: "+262", code: "RE" },
    { name: "Saint Barthélemy", dial_code: "+590", code: "BL" },
    {
      name: "Saint Helena, Ascension and Tristan Da Cunha",
      dial_code: "+290",
      code: "SH",
    },
    { name: "Saint Kitts and Nevis", dial_code: "+1 869", code: "KN" },
    { name: "Saint Lucia", dial_code: "+1 758", code: "LC" },
    { name: "Saint Martin", dial_code: "+590", code: "MF" },
    { name: "Saint Pierre and Miquelon", dial_code: "+508", code: "PM" },
    {
      name: "Saint Vincent and the Grenadines",
      dial_code: "+1 784",
      code: "VC",
    },
    { name: "Samoa", dial_code: "+685", code: "WS" },
    { name: "San Marino", dial_code: "+378", code: "SM" },
    { name: "Sao Tome and Principe", dial_code: "+239", code: "ST" },
    { name: "Saudi Arabia", dial_code: "+966", code: "SA" },
    { name: "Senegal", dial_code: "+221", code: "SN" },
    { name: "Serbia", dial_code: "+381", code: "RS" },
    { name: "Seychelles", dial_code: "+248", code: "SC" },
    { name: "Sierra Leone", dial_code: "+232", code: "SL" },
    { name: "Singapore", dial_code: "+65", code: "SG" },
    { name: "Slovakia", dial_code: "+421", code: "SK" },
    { name: "Slovenia", dial_code: "+386", code: "SI" },
    { name: "Solomon Islands", dial_code: "+677", code: "SB" },
    { name: "Somalia", dial_code: "+252", code: "SO" },
    { name: "South Africa", dial_code: "+27", code: "ZA" },
    {
      name: "South Georgia and the South Sandwich Islands",
      dial_code: "+500",
      code: "GS",
    },
    { name: "Spain", dial_code: "+34", code: "ES" },
    { name: "Sri Lanka", dial_code: "+94", code: "LK" },
    { name: "Sudan", dial_code: "+249", code: "SD" },
    { name: "Suriname", dial_code: "+597", code: "SR" },
    { name: "Svalbard and Jan Mayen", dial_code: "+47", code: "SJ" },
    { name: "Swaziland", dial_code: "+268", code: "SZ" },
    { name: "Sweden", dial_code: "+46", code: "SE" },
    { name: "Switzerland", dial_code: "+41", code: "CH" },
    { name: "Syrian Arab Republic", dial_code: "+963", code: "SY" },
    { name: "Taiwan, Province of China", dial_code: "+886", code: "TW" },
    { name: "Tajikistan", dial_code: "+992", code: "TJ" },
    { name: "Tanzania, United Republic of", dial_code: "+255", code: "TZ" },
    { name: "Thailand", dial_code: "+66", code: "TH" },
    { name: "Timor-Leste", dial_code: "+670", code: "TL" },
    { name: "Togo", dial_code: "+228", code: "TG" },
    { name: "Tokelau", dial_code: "+690", code: "TK" },
    { name: "Tonga", dial_code: "+676", code: "TO" },
    { name: "Trinidad and Tobago", dial_code: "+1 868", code: "TT" },
    { name: "Tunisia", dial_code: "+216", code: "TN" },
    { name: "Turkey", dial_code: "+90", code: "TR" },
    { name: "Turkmenistan", dial_code: "+993", code: "TM" },
    { name: "Turks and Caicos Islands", dial_code: "+1 649", code: "TC" },
    { name: "Tuvalu", dial_code: "+688", code: "TV" },
    { name: "Uganda", dial_code: "+256", code: "UG" },
    { name: "Ukraine", dial_code: "+380", code: "UA" },
    { name: "United Arab Emirates", dial_code: "+971", code: "AE" },
    { name: "United Kingdom", dial_code: "+44", code: "GB" },
    { name: "United States", dial_code: "+1", code: "US" },
    { name: "Uruguay", dial_code: "+598", code: "UY" },
    { name: "Uzbekistan", dial_code: "+998", code: "UZ" },
    { name: "Vanuatu", dial_code: "+678", code: "VU" },
    { name: "Venezuela, Bolivarian Republic of", dial_code: "+58", code: "VE" },
    { name: "Viet Nam", dial_code: "+84", code: "VN" },
    { name: "Virgin Islands, British", dial_code: "+1 284", code: "VG" },
    { name: "Virgin Islands, U.S.", dial_code: "+1 340", code: "VI" },
    { name: "Wallis and Futuna", dial_code: "+681", code: "WF" },
    { name: "Yemen", dial_code: "+967", code: "YE" },
    { name: "Zambia", dial_code: "+260", code: "ZM" },
    { name: "Zimbabwe", dial_code: "+263", code: "ZW" },
    { name: "Åland Islands", dial_code: "+358", code: "AX" },
  ];
};
export const base64EncodeUint8Array = (a) => {
  for (
    var d,
      e,
      f,
      g,
      h,
      i,
      j,
      b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      c = "",
      k = 0;
    k < a.length;

  )
    (d = a[k++]),
      (e = k < a.length ? a[k++] : Number.NaN),
      (f = k < a.length ? a[k++] : Number.NaN),
      (g = d >> 2),
      (h = ((3 & d) << 4) | (e >> 4)),
      (i = ((15 & e) << 2) | (f >> 6)),
      (j = 63 & f),
      isNaN(e) ? (i = j = 64) : isNaN(f) && (j = 64),
      (c += b.charAt(g) + b.charAt(h) + b.charAt(i) + b.charAt(j));
  return c;
};
export const base64DecodeUint8Array = (a) => {
  var b = window.atob(a),
    c = b.length,
    d = new Uint8Array(new ArrayBuffer(c));
  for (var i = 0; i < c; i++) d[i] = b.charCodeAt(i);
  return d;
};
export const isHTML = (string) => {
  return Array.from(
    new DOMParser().parseFromString(string, "text/html").body.childNodes
  ).some(({ nodeType }) => nodeType == 1);
};

export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const currentTime = `${hours}:${minutes}:${seconds}`;
  return currentTime;
}

export function getDynamicSchema(seodata) {
  let videoSchemaTag = seodata?.response?.pageSeo?.metaTags?.find(
    (tag) =>
      tag.tagType === "scema" ||
      tag.tagType === "schema" ||
      tag.tagType === "videoscema"
  );

  let schemaObj = {};

  if (videoSchemaTag && videoSchemaTag.content) {
    let raw = videoSchemaTag.content.trim();

    if (raw.includes('"@graph"')) {
      try {
        const parsedGraph = JSON.parse(raw);
        return JSON.stringify(parsedGraph, null, 2);
      } catch (e) {
        console.error("Invalid JSON in schema content:", e);
        return raw;
      }
    }

    const extractValue = (regex) => {
      const match = raw.match(regex);
      return match ? match[1].trim() : null;
    };

    schemaObj["@context"] =
      extractValue(/"@context"\s*:\s*"([^"]+)"/) || "https://schema.org";
    schemaObj["@type"] = extractValue(/"@type"\s*:\s*"([^"]+)"/) || "";

    const nameVal = extractValue(/"name"\s*:\s*([^,}]+)/);
    if (nameVal) schemaObj.name = nameVal.replace(/^"|"$/g, "").trim();

    const urlVal = extractValue(/"url"\s*:\s*"([^"]+)"/);
    if (urlVal) schemaObj.url = urlVal;

    const imageVal = extractValue(/"image"\s*:\s*([^,\]}]+)/i);
    if (imageVal) {
      let img = imageVal.replace(/"|}/g, "").trim();
      if (!img.startsWith("http")) {
        img = "https://www.watcho.com/" + img;
      }
      schemaObj.image = img;
    } else {
      schemaObj.image = "https://www.watcho.com/default-image.jpg";
    }

    const descVal = extractValue(
      /"description"\s*:\s*(.*?)(?=\s*,"[a-zA-Z]+":|$)/
    );
    if (descVal) schemaObj.description = descVal.replace(/^"|"$/g, "").trim();

    const genreVal = extractValue(/"genre"\s*:\s*\[([^\]]+)\]/);
    if (genreVal) {
      let genres = genreVal
        .split(",")
        .map((g) => g.replace(/"|}/g, "").trim())
        .filter(Boolean);
      schemaObj.genre = genres.length === 1 ? genres[0] : genres;
    }

    const langVal = extractValue(/"inLanguage"\s*:\s*\[?([^,\]]+)/);
    if (langVal) schemaObj.inLanguage = langVal.replace(/"|}/g, "").trim();

    const seasonVal = extractValue(/"numberOfSeasons"\s*:\s*([^,}]+)/);
    if (seasonVal) {
      schemaObj.numberOfSeasons = parseInt(
        seasonVal.replace(/"|}/g, "").trim()
      );
    }

    const actorVal = extractValue(/"actor"\s*:\s*\[([^\]]+)\]/);
    if (actorVal) {
      let actors = actorVal
        .split(",")
        .map((a) => a.replace(/"|}/g, "").trim())
        .filter(Boolean);
      schemaObj.actor = actors.map((name) => ({
        "@type": "Person",
        name,
      }));
    }

    const directorVal = extractValue(/"director"\s*:\s*\[([^\]]+)\]/);
    if (directorVal) {
      let directors = directorVal
        .split(",")
        .map((d) => d.replace(/"|}/g, "").trim())
        .filter(Boolean);
      if (directors.length > 0) {
        schemaObj.director = {
          "@type": "Person",
          name: directors[0],
        };
      }
    }
  }

  Object.keys(schemaObj).forEach((key) => {
    if (
      schemaObj[key] === undefined ||
      schemaObj[key] === null ||
      (Array.isArray(schemaObj[key]) && schemaObj[key].length === 0)
    ) {
      delete schemaObj[key];
    }
  });

  return JSON.stringify(schemaObj, null, 2);
}

