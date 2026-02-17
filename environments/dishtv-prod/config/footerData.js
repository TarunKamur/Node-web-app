// Values are keys from locale.js
import { ImageConfig } from "./ImageConfig";

const footerData = {
  topLeft: {
    title: "Watch_anywhere_anytime",
    description: "Description",
    image: "",
  },
  topRight: {
    title: "",
    description: "",
  },
  devicesLinks: [
    {
      title: "TV_app",
      list: [
        {
          image: ImageConfig?.footer?.androidTv,
          targetPath: "",
          targetType: "_blank",
          altText: "android tv",
        },
        {
          image: ImageConfig?.footer?.fireTv,
          targetPath: "",
          targetType: "_blank",
          altText: "fire tv",
        },
        {
          image: ImageConfig?.footer?.appleTv,
          targetPath: "",
          targetType: "_blank",
          altText: "apple tv",
        },
      ],
    },
    {
      title: "Mobile_app",
      list: [
        {
          image: ImageConfig?.footer?.iosDevice,
          targetPath: "",
          targetType: "_blank",
          altText: "ios mobile",
        },
        {
          image: ImageConfig?.footer?.androidDevice,
          targetPath: "",
          targetType: "_blank",
          altText: "android mobile",
        },
      ],
    },
  ],
  supportLinks: [
    {
      title: "Privacy_policy",
      targetPath: "/support/privacy-policy",
      targetType: "_self", // _blank, _self, method
    },
    {
      title: "Terms_Conditions",
      targetPath: "/support/terms",
      targetType: "_self",
    },
    // {
    //   title: "Swag_terms",
    //   targetPath: "/support/swag-terms",
    //   targetType: "_self",
    // },
    {
      title: "Grievance",
      targetPath: "/support/grievance",
      targetType: "_self",
    },
    {
      title: "Cookies",
      targetPath: "/support/cookie-policy",
      targetType: "_self",
    },
    {
      title: "About_Us",
      targetPath: "/support/about-us",
      targetType: "_self",
    },
    {
      title: "FAQ",
      targetPath: "/support/faq",
      targetType: "_self",
    },
    {
      title: "Become_Our_Partner",
      targetPath: "https://ancillary.watcho.com/BecomeOurPartner",
      targetType: "_blank",
    },
  ],
  socialLinks: {
    title: "Connect_with_us",
    list: [
      {
        image: ImageConfig?.socialIcons?.facebook,
        targetPath: "",
        targetType: "_self", // _blank, _self,
        altText: "facebook",
      },
      {
        image: ImageConfig?.socialIcons?.instagram,
        targetPath: "",
        targetType: "_self", // _blank, _self,
        altText: "instagram",
      },
      {
        image: ImageConfig?.socialIcons?.twitter,
        targetPath: "",
        targetType: "_self", // _blank, _self,
        altText: "twitter",
      },
      {
        image: ImageConfig?.socialIcons?.youtube,
        targetPath: "",
        targetType: "_self", // _blank, _self,
        altText: "youtube",
      },
    ],
  },
};

export default footerData;
