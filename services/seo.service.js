import defaultSeoData from "@/seo/default-seo.json";
import emptySeo from "@/seo/empty-seo.json";
import { getPagePath } from "@/services/utility.service";

// to set page title ex: <<path>> | <<Tenant Name>>
const setTitle = (page, pageTitle) => {
  page = page?.includes("/")
    ? page?.split("/")[page?.split("/").length - 1]
    : page;
  return !!page
    ? `${page?.replace(/-|_|\//g, " ").toTitleCase()} | ${pageTitle.toTitleCase()}`
    : pageTitle.toTitleCase();
};

// adding prototype for string method to change sentance into title case
String.prototype.toTitleCase = function () {
  return this.replace(/\w\S*/g, function (word) {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
};

// SEO response
export async function AddSeoTags(req, pagePath, type) {
  let dupEmptySeo = JSON.parse(JSON.stringify(emptySeo));
  let dupDefaultSeo = JSON.parse(JSON.stringify(defaultSeoData));
  try {
    const sessionId = req.cookies._sessionId_v3 || undefined;
    const boxId = req.cookies._boxId_v3 || undefined;
    // if invalid session or box id return default/empty seo
    if (process.env.seo.isAuthRequired && (!sessionId || !boxId)) {
      dupEmptySeo.response.title = setTitle(pagePath, emptySeo.response.title);
      //if page path is home return default seo
      if (pagePath === "/" || pagePath === "" || pagePath === "/home") {
        return {
          props: {
            seodata: dupDefaultSeo.default || {},
          },
        };
      }
      // if it is packages list page return packages seo in default seo
      if (pagePath === "pricing") {
        dupDefaultSeo.packages.response.title = setTitle(
          pagePath,
          dupDefaultSeo.packages.response.title
        );
        return {
          props: {
            seodata: dupDefaultSeo.packages || {},
          },
        };
      }
      // if it is support pages return support seo in default seo
      if (pagePath.includes("/support")) {
        return {
          props: {
            seodata: dupDefaultSeo.support || {},
          },
        };
      }
      // if page path is not home/packages return empty seo
      return {
        props: {
          seodata: dupEmptySeo.default || {},
        },
      };
    }

    // if seo disabled return empty seo
    if (process.env.seo.enable === false) {
      dupEmptySeo.response.title = setTitle(pagePath, emptySeo.response.title);
      return {
        props: {
          seodata: dupEmptySeo || {},
        },
      };
    }
    /* if type is
    default : render default seo
    api: hit seo api
    no_crawl: render empty seo, adds noindex tag
    */
    // switch (type) {
    //   case "default":
    //     return returnDefaultSEO(pagePath);
    //   case "api":
    //     const url = `${process.env.initJson.api}/service/api/v1/page/seo?path=${pagePath === "/" || pagePath === "" ? "home" : getPagePath(pagePath)}`;
    //     try {
    //       let headersObj = {
    //         "Session-Id": sessionId?.slice(1, -1),
    //         "Box-Id": boxId?.slice(1, -1),
    //         "Tenant-Code": process.env.initJson.tenantCode,
    //         "X-Forwarded-For": req?.headers?.["x-forwarded-for"] || "",
    //       };
    //       let apidata = await fetch(url, {
    //         method: "GET",
    //         headers: process.env.seo.isAuthRequired
    //           ? headersObj
    //           : { "Tenant-Code": process.env.initJson.tenantCode },
    //       });
    //       let aData = await apidata.json();
    //       console.log("=======start=========")
    //       console.log("Page Path: ",pagePath)
    //       console.log("Session Id: ",sessionId?.slice(1,-1))
    //       console.log("Box Id: ",boxId?.slice(1, -1))
    //       console.log(JSON.stringify(aData,2,2),'SEO')
    //       console.log("=======end=========")
    //       if (aData.status == false) {
    //         return returnDefaultSEO(pagePath);
    //       }

    //       return {
    //         props: {
    //           seodata: aData,
    //         },
    //       };
    //     } catch (e) {
    //       return returnDefaultSEO(pagePath);
    //     }
    //   case "no_crawl":
    //     dupEmptySeo.response.title = setTitle(
    //       pagePath,
    //       emptySeo.response.title
    //     );
    //     return {
    //       props: {
    //         seodata: dupEmptySeo || {},
    //       },
    //     };
    // }

    if (type === "default") {
      return returnDefaultSEO(pagePath);
    } else if (type === "api") {
      const url = `${process.env.initJson.api}/service/api/v2/page/seo?path=${pagePath === "/" || pagePath === "" ? "home" : getPagePath(pagePath)}`;
      try {
        let headersObj = {
          "Session-Id": sessionId?.slice(1, -1),
          "Box-Id": boxId?.slice(1, -1),
          "Tenant-Code": process.env.initJson.tenantCode,
          "X-Forwarded-For": req?.headers?.["x-forwarded-for"] || "",
        };
        let apidata = await fetch(url, {
          method: "GET",
          headers: process.env.seo.isAuthRequired
            ? headersObj
            : {
                "Tenant-Code": process.env.initJson.tenantCode,
                "X-Forwarded-For": req?.headers?.["x-forwarded-for"] || "",
              },
        });
        let aData = await apidata.json();
        // console.log("=======start=========");
        // console.log("Page Path: ", pagePath);
        // console.log("Session Id: ", sessionId?.slice(1, -1));
        // console.log("Box Id: ", boxId?.slice(1, -1));
        // console.log(JSON.stringify(aData, 2, 2), "SEO");
        // console.log("=======end=========");
        if (aData.status == false) {
          return returnDefaultSEO(pagePath);
        }

        return {
          props: {
            seodata: aData,
            dynamicSeo: aData.response.dynamicSeo || null
          },
        };
      } catch (e) {
        return returnDefaultSEO(pagePath);
      }
    } else if (type === "no_crawl") {
      dupEmptySeo.response.title = setTitle(pagePath, emptySeo.response.title);
      return {
        props: {
          seodata: dupEmptySeo || {},
        },
      };
    }
  } catch (e) {
    emptySeo.response.title = setTitle(pagePath, emptySeo.response.title);
    return {
      props: {
        seodata: emptySeo || {},
      },
    };
  }
}

// returns default seo based on pages
const returnDefaultSEO = (pagePath) => {
  let dupEmptySeo = JSON.parse(JSON.stringify(emptySeo));
  let dupDefaultSeo = JSON.parse(JSON.stringify(defaultSeoData));
  // if it is home page return default seo
  if (pagePath === "/" || pagePath === "" || pagePath === "/home") {
    return {
      props: {
        seodata: dupDefaultSeo.default || {},
      },
    };
  }
  // if it is packages list page return packages seo in default seo
  if (pagePath === "pricing") {
    dupDefaultSeo.packages.response.title = setTitle(
      pagePath,
      dupDefaultSeo.packages.response.title
    );
    return {
      props: {
        seodata: dupDefaultSeo.packages || {},
      },
    };
  }
  // if it is support pages return support seo in default seo
  if (pagePath.includes("/support")) {
    dupDefaultSeo.support.response.title = setTitle(
      pagePath,
      dupDefaultSeo.support.response.title
    );
    return {
      props: {
        seodata: dupDefaultSeo.support || {},
      },
    };
  }
  dupEmptySeo.response.title = setTitle(pagePath, emptySeo.response.title);
  return {
    props: {
      seodata: dupEmptySeo || {},
    },
  };
};
