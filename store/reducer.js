import { appConfig } from "@/config/app.config";
import * as actions from "./actions";
import { getNookie } from "@/services/local-storage.service";

export const initialState = {
  SystemConfig: null,
  SystemFeature: null,
  Location: null,
  Session: null,
  NotificationBar: null,
  PageData: {},
  PageRefresh: false,
  userDetails: null,
  navigateFrom: null,
  profileUtil: null,
  packageUtil: null,
  cardPreviewData: null,
  paymentResponse: null,
  playerUtils: null,
  shakaCardHoverState: false,
  localLang: getNookie("userLanguage") || appConfig?.appDefaultLanguage,
  SystemLanguages: null,
  ThemeColor: null,
  ActivePackages: {},
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SystemConfig:
      return { ...state, SystemConfig: action.payload };
    case actions.SystemFeature:
      return { ...state, SystemFeature: action.payload };
    case actions.Location:
      return { ...state, Location: action.payload };
    case actions.Session:
      return { ...state, Session: action.payload };
    case actions.NotificationBar:
      return { ...state, NotificationBar: action.payload };
    case actions.PageData:
      return { ...state, PageData: action.payload };
    case actions.PageRefresh:
      return { ...state, PageRefresh: action.payload };
    case actions.userDetails:
      return { ...state, userDetails: action.payload };
    case actions.navigateFrom:
      return { ...state, navigateFrom: action.payload };
    case actions.profileUtil:
      return { ...state, profileUtil: action.payload };
    case actions.packageUtil:
      if (action.payload === null) {
        return { ...state, packageUtil: null };
      }
      return {
        ...state,
        packageUtil: { ...state.packageUtil, ...action.payload },
      };
    case actions.cardPreviewData:
      return { ...state, cardPreviewData: action.payload };
    case actions.paymentResponse:
      return { ...state, paymentResponse: action.payload };
    case actions.playerUtils:
      return { ...state, playerUtils: action.payload };
    case actions.shakaCardHoverState:
      return { ...state, shakaCardHoverState: action.payload };
    case actions.LocalLang:
      return { ...state, localLang: action.payload };
    case actions.SystemLanguages:
      return { ...state, SystemLanguages: action.payload };
    case actions.ThemeColor:
      return { ...state, ThemeColor: action.payload };
    case actions.ActivePackages:
      return { ...state, ActivePackages: action.payload };
      return state;
  }
};
