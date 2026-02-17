export const appConfig = {
  appLogo:
    "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg",
  staticImagesPath:
    "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/",
  statisFilesPath: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/files/",
  authMaxLength: 15,
  authMinLength: 4,
  otpMinLength: 4,
  otpMaxLength: 6,
  configVersionApi: 1,
  namePattern: /^[A-Za-z ]+$/,
  authMobilePattern: /^[0-9]{10}$/,
  authEmailPattern:
    /^[a-zA-Z0-9_.-]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  appDefaultLanguage: "eng",
  loaderColor: "#df1f5a",
  isOldFavourite: false,
  ctSDK_android: "yvsdishenveu",
  ctSDK_IOS: "yvsdishenveu",
  header: {
    type: 1, // 1-regular header , 2-vesta-header
    partners: false,
    languages: true,
    topHeader: true,
    signin: true,
    signup: false,
    help_and_support: true,
    become_our_partner: true,
    aboutus: false,
    Support_mail: false,
    searchVersion: "v3", // v1,v3
    become_swag_creator: true,
    accountDropdown: [
      {
        displayName: "Help_Support",
        key: "help_support",
        targetPath: "/support/terms",
        isInternal: true,
      },
      {
        displayName: "FAQ",
        key: "faq",
        targetPath: "/support/faq",
        isInternal: true,
      },
    ],
  },
  carousel: {
    continue_watching_delete: true,
  },
  settings: {
    personal: 1,
    email: 0,
    mobile: 0,
    password: 0,
    logout: 1,
    unSubscribe: true,
    resubscribe: true,
    showDeleteButtonIos: true,
    showDeleteButtonAndroid: true,
    showPackages: true,
    userSettings: true,
    videoQuality: true,
    showDeleteWeb: true,
    profileControls: false,
    cpactivation: true,
    transaction: 2, // 1 -- internalBrowser , 2 -- externalBrowser
    isCCEnable1: false, //outside and regular accordion
    isCCEnable2: false, //inside of user settings
    activeDevices: true,
    activeScreens: true,
    editProfile: {
      name: true,
      firstLastName: false,
      age: true,
      dob: false,
      mobile: true,
    },
  },
  myAccount: {
    languagesFilter: 1,
    contentFilter: 0,
  },

  signin: {
    primary: "mobile", // email (or) mobile
    emailPhoneToggle: 1,
    guestLogin: false,
  },
  signup: {
    firstName: 0,
    lastName: 0,
    firstNameCharLimit: 30,
    lastNameCharLimit: 30,
    email: 1,
    mobile: 1,
    confirm: 0,
    dob: "0",
    gender: "0",
    guestLogin: false,
  },
  forgot: {
    verification: "mobile",
  },
  profile: {
    type: "otp",
    languages: true,
    expiry: 100 * 24 * 60 * 60,
    forgotParentalPin: true,
  },
  deleteAccountType: {
    otp: true,
    password: false,
  },
  packageSettings: {
    activePlans: "both", // 'false' // ‘both’
    paymentGateway: {
      typeOfPayment: "internal", // external (Razorpay gateway on the same page or external page)
    },
  },
  pageNotFoundPage: {
    show404Data: true,
  },
  languages: {
    isselectcpDiplay: true,
    isContentandDisplay: 1,
    primary: "display", // display (or) content
  },
  analyticsConfig: {
    GTM: true,
    firebase: false,
    firebaseSW: false,
    cleverTap: true,
    adsFlyer: false,
    facebook: true,
    branchio: true,
  },
  footer: {
    type: "watchoFooter", // ["firstshowsFooter","reeldramaFooter","vestaFooter","footer","watchoFooter","default"]
    appsDownloadPageUrl: "https://www.watcho.com/apps.html",
    fb_link: "https://www.facebook.com/LetsWatcho/",
    instagram_link: "https://www.instagram.com/watchoapp/",
    twitter_link: "https://x.com/watchoapphttps://x.com/watchoapp",
    linkdin_link: "",
    youtube_link: "https://www.youtube.com/channel/UCs_VbCkjjq5x5yGFgY6tAPg",
    androidAppLink: "https://play.google.com/store/apps/details?id=com.watcho",
    androidTVLink:
      "https://play.google.com/store/apps/details?id=com.watcho_multi",
    amazonFireTVLink:
      "https://www.amazon.in/Watcho-Original-Spotlight-Exclusive-Shows/dp/B07XPG5FW5",
    lgAppLink: "",
    samsungAppLink:
      "https://www.samsung.com/levant/tvs/smart-tv/smart-hub-and-apps/",
    rokuLink: "",
    fireTVLink:
      "https://www.amazon.in/Watcho-Original-Spotlight-Exclusive-Shows/dp/B07XPG5FW5",
    iOSAppLink:
      "https://apps.apple.com/in/app/watcho-new-web-series-livetv/id1440733653?platform=iphone",
    appleTVLink:
      "https://apps.apple.com/in/app/watcho-new-web-series-livetv/id1440733653?platform=appleTV",
  },
  datePicker: {
    format: "en-gb", // 'en' for MM/DD/YYYY, 'en-gb' for DD/MM/YYYY
    dformat: "DD/MM/YYYY",
  },
  tvGuide: {
    filter: true,
    dates: false,
    time: 24,
  },
  supportConfig: {
    supportPages: [
      {
        displayName: "about_us",
        url: "about-us",
        target: "_self",
      },
      {
        displayName: "terms_of_use",
        url: "terms",
        target: "_self",
      },
      // {
      //   displayName: "content_guidelines",
      //   url: "content-guidelines",
      //   target: "_self",
      // },
      // {
      //   displayName: "swag_terms",
      //   url: "swag-terms",
      //   target: "_self",
      // },
      {
        displayName: "grievance",
        url: "grievance",
        target: "_self",
      },
      {
        displayName: "privacy_policy",
        url: "privacy-policy",
        target: "_self",
      },
      {
        displayName: "cookies",
        url: "cookie-policy",
        target: "_self",
      },
      {
        displayName: "faqs",
        url: "https://faq.watcho.com/",
        target: "_blank",
      },
      {
        displayName: "Become_Our_Partner",
        url: "https://ancillary.watcho.com/BecomeOurPartner",
        target: "_blank",
      },
      {
        displayName: "help",
        url: "https://help.watcho.com/",
        target: "_blank",
      },
    ],
    supportPagesDubai: [
      {
        displayName: "about_us",
        url: "about-us",
        target: "_self",
      },
      {
        displayName: "terms_of_use",
        url: "terms",
        target: "_self",
      },

      {
        displayName: "privacy_policy",
        url: "privacy-policy",
        target: "_self",
      },
      {
        displayName: "cookies",
        url: "cookie-policy",
        target: "_self",
      },
    ],
  },

  myAccountlist: {
    "My Content": {
      title: "My Content",
      postLoginMenu: true,
      menus: [
        // {
        //   displayName: "My_Downloads",
        //   targetPath: "downloads",
        //   postLoginMenu: true,
        //   show: true,
        //   icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_download_icon.svg",
        // },
        {
          displayName: "My_Favourites",
          targetPath: "fav",
          postLoginMenu: true,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_watchlist_icon.svg",
        },
        {
          displayName: "Channels",
          targetPath: "Channels",
          postLoginMenu: true,
          systemConfigKey: "enableSideMenuPages",
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_channel_icon.svg",
        },
        {
          displayName: "mylikedvideos",
          targetPath: "my_liked_videos",
          postLoginMenu: true,
          systemConfigKey: "enableSideMenuPages",
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_liked_icon.svg",
        },
        {
          displayName: "Purchased_content",
          targetPath: "Purchased_content",
          postLoginMenu: true,
          systemConfigKey: "enableSideMenuPages",
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_purchase_icon.svg",
        },
      ],
    },

    Account: {
      title: "Account",
      menus: [
        {
          displayName: "Account_Settings",
          targetPath: "settings",
          postLoginMenu: true,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_profile_circle.svg",
        },
        {
          displayName: "Languages",
          targetPath: "language",
          postLoginMenu: false,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_lang_icon.svg",
        },
        // {
        //   displayName: "App_Settings",
        //   targetPath: "app-settings",
        //   postLoginMenu: false,
        //   show: true,
        //   icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_setting_icon.svg",
        // },
        {
          displayName: "Activate_TV",
          targetPath: "activateTV",
          postLoginMenu: true,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_activatetv_icon.svg",
        },
      ],
    },

    "Help Centre": {
      title: "Help Centre",
      menus: [
        {
          displayName: "Help_Support",
          targetPath: "help",
          postLoginMenu: false,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_help_icon.svg",
        },
        {
          displayName: "FAQs",
          targetPath: "faq",
          postLoginMenu: false,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_faq_icon.svg",
        },
      ],
    },

    Legal: {
      title: "Legal",
      menus: [
        {
          displayName: "grienavce_redressal",
          targetPath: "grievance",
          postLoginMenu: false,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_graviance_icon.svg",
        },
        {
          displayName: "About_us",
          targetPath: "aboutus",
          postLoginMenu: false,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_about_icon.svg",
        },
        {
          displayName: "Privacy_Policy",
          targetPath: "privacy-policy",
          postLoginMenu: false,
          show: true,
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/myaccount_privacy_icon.svg",
        },
      ],
    },
  },

  myAccountMenus: [
    // {
    //   displayName: "Account_Settings",
    //   targetPath: "settings",
    //   postLoginMenu: true,
    //   show: true,
    // },
    // {
    //   displayName: "Languages",
    //   targetPath: "language",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "My_Favourites",
    //   targetPath: "fav",
    //   postLoginMenu: true, // To display only for logged in users
    //   show: true, // Menu visibility based on this key
    // },
    // {
    //   displayName: "videoquality",
    //   targetPath: "video_quality",
    //   postLoginMenu: true,
    //   show: true,
    // },
    // {
    //   displayName: "My_Purchases",
    //   targetPath: "purchased-movies-config",
    //   postLoginMenu: false,
    //   systemConfigKey: "myPurchasesTargetPathWeb", // Menu visibility is based on the variable presence in SystemConfig.configs
    //   show: true,
    // },
    // {
    //   displayName: "Languages",
    //   targetPath: "language",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "Account_Settings",
    //   targetPath: "settings",
    //   postLoginMenu: true,
    //   show: true,
    // },
    // {
    //   displayName: "Channels",
    //   targetPath: "list?content=Channels",
    //   postLoginMenu: true,
    //   systemConfigKey: "enableSideMenuPages",
    //   show: true,
    // },
    // {
    //   displayName: "Purchased_content",
    //   targetPath: "list?content=purchasedcontent",
    //   postLoginMenu: true,
    //   systemConfigKey: "enableSideMenuPages",
    //   show: true,
    // },
    // {
    //   displayName: "mylikedvideos",
    //   targetPath: "list?content=mylikedvideos",
    //   postLoginMenu: true,
    //   systemConfigKey: "enableSideMenuPages",
    //   show: true,
    // },
    // {
    //   displayName: "Help_Support",
    //   targetPath: "help",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "FAQs",
    //   targetPath: "faq",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "Become_our_Partner",
    //   targetPath: "becomepartner",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "Activate_TV",
    //   targetPath: "activateTV",
    //   postLoginMenu: true,
    //   show: true,
    // },
    // {
    //   displayName: "grienavce_redressal",
    //   targetPath: "grievance",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "faqs",
    //   targetPath: "faqs",
    //   postLoginMenu: false,
    //   show: false,
    // },
    // {
    //   displayName: "Become_Our_Partner",
    //   targetPath: "Become_Our_Partner",
    //   postLoginMenu: false,
    //   show: false,
    // },
    // {
    //   displayName: "Activate_TV",
    //   targetPath: "activateTV",
    //   postLoginMenu: false,
    //   show: false,
    // },
    // {
    //   displayName: "Grievance",
    //   targetPath: "grievance",
    //   postLoginMenu: false,
    // },
    // {
    //   displayName: "Terms_Conditions",
    //   targetPath: "terms",
    //   postLoginMenu: false,
    // },
    // {
    //   displayName: "Privacy_Policy",
    //   targetPath: "privacy-policy",
    //   postLoginMenu: false,
    // },
    // {
    //   displayName: "Cookie_Policy",
    //   targetPath: "cookie-policy",
    //   postLoginMenu: false,
    // },
    // {
    //   displayName: "About_us",
    //   targetPath: "aboutus",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "become_a_swag_creator",
    //   targetPath: "swag_creator",
    //   postLoginMenu: false,
    //   show: true,
    // },
    // {
    //   displayName: "Become_swag_partner",
    //   targetPath: "become_swag_partner",
    //   postLoginMenu: false,
    // },
  ],
  detailsPage: {
    favType: 2, // 1-icon , 2-button
  },
  shortPage: {
    dishtvApiHits: 1,
    share: 1,
    programBar: 1,
    shortsControls: 0,
    shortsMore: 1,
    solarEye: 1,
  },

  distroPixelUrlAnalytics: {
    isdistroAnalyticsEnebled: true,
    distroAnalyticsUrl: "https://i.jsrdn.com/i/1.gif",
  },

  ads: {
    GoogleAds: true,
  },
  leftMenuArray: [
    {
      title: "Content Preferences",
      subtitle: "Help us personalize your experience",
      cards: [
        {
          label: "Content Rating",
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/content_rating.png",
          activ_icon:
            "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/content_rating_active.png",
          path: "rating",
        },
        {
          label: "Content Language Preferences",
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/language_preference.png",
          activ_icon:
            "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/language_preference_active.png",
          path: "langs",
        },
        {
          label: "Genre Preferences",
          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/genre_preference.png",
          activ_icon:
            "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/Capa_1.png",
          path: "genre",
        },
      ],
    },
    //    {
    //      title: "About You",
    //      subtitle: "Let’s get to know you better",
    //      cards: [
    //        {
    //          label: "Age & Gender",
    //          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/age_gender.png",
    //  activ_icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/age_gender_active.png",

    //          path:"age"
    //        },
    //        {
    //          label: "City",
    //          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/city.png",
    //    activ_icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/carbon_location.png",

    //          path:"city"
    //        },
    //         {
    //          label: "Age Group",
    //          icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/age_gender.png",
    //  activ_icon: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/age_gender_active.png",

    //          path:"kid"
    //        },
    //      ],
    //    },
  ],
};
