import { getDynamicSchema } from "@/services/utility.service";
import Head from "next/head";
import { useRouter } from "next/router";
import { memo } from "react";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Watcho",
  url: "https://www.watcho.com/",
  image: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg",
  logo: {
    "@type": "ImageObject",
    url: "https://d2ivesio5kogrp.cloudfront.net/static/watcho/images/logo.svg",
    width: 80,
    height: 19,
  },
  description:
    "Watcho is your one-stop destination for all the entertainment get 19+ OTT apps. Watch latest movies, web series, TV serials and more from your favorite OTT apps such as ZEE5, Disney+ Hotstar, Sony Liv, hoichoi, chaupal and more.",
  sameAs: [
    "https://www.facebook.com/LetsWatcho/",
    "https://www.instagram.com/watchoapp/",
    "https://x.com/watchoapp",
    "https://www.youtube.com/@watchoapp",
    "https://play.google.com/store/apps/details?id=com.watcho&hl=en_IN",
    "https://apps.apple.com/in/app/watcho-new-web-series-livetv/id1440733653",
  ],
};


function MetaTags({ seodata, noindex }) {
  const { locale, asPath } = useRouter();

  const formatJsonLd = (schema, schemaName = "schema") => {
    try {
      if (!schema) {
        console.warn(`No ${schemaName} data provided`);
        return null;
      }
      if (typeof schema === "string") {
        try {
          const parsed = JSON.parse(schema);
          return JSON.stringify(parsed, null, 2);
        } catch (error) {
          console.error(
            `Invalid JSON string for ${schemaName}:`,
            schema,
            error
          );
          return null;
        }
      }
      return JSON.stringify(schema, null, 2);
    } catch (error) {
      console.error(`Error formatting ${schemaName}:`, error);
      return null;
    }
  };

  const renderJsonLd = (schema, schemaName) => {
    const formattedSchema = formatJsonLd(schema, schemaName);
    if (!formattedSchema) return null;
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: formattedSchema }}
      />
    );
  };

  let dynamicSchemaData = null;
  try {
    dynamicSchemaData =
      seodata?.status && getDynamicSchema(seodata)
        ? getDynamicSchema(seodata)
        : null;
    if (!dynamicSchemaData) {
      console.warn("Dynamic schema is null or undefined", { seodata });
    }
  } catch (error) {
    console.error("Error generating dynamic schema:", error);
  }

  const response = seodata?.response || {};
  const seoData = response.pageSeo || response;
  const metaTags = seoData.metaTags || [];
  const canonicalTag = metaTags.find((tag) => tag.tagType === "canonical");
  
  return (
    <Head>
      <title>{seoData?.title || process.env.title}</title>

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {seoData?.description && (
        <meta name="description" content={seoData.description} />
      )}
      {seoData?.keywords && <meta name="keywords" content={seoData.keywords} />}

      {canonicalTag ? (
        <link rel={canonicalTag.tagType} href={canonicalTag.content} />
      ) : (
        <link rel="canonical" href={`${process.env.host}${asPath}`} />
      )}

       {(asPath === "/" ||  asPath === "/home") && renderJsonLd(organizationSchema, "organizationSchema")}

      {dynamicSchemaData && renderJsonLd(dynamicSchemaData, "dynamicSchema")}


      {metaTags.length > 0 &&
        metaTags.map((tag, i) => {
          if (tag.tagName === "name") {
            return (
              <meta
                name={tag.tagType}
                content={tag.content}
                key={`${tag.tagType}-${i}`}
              />
            );
          } else if (tag.tagName === "property") {
            return (
              <meta
                property={tag.tagType}
                content={tag.content}
                key={`${tag.tagType}-${i}`}
              />
            );
          } else if (tag.tagName === "rel" && tag.tagType !== "canonical") {
            return (
              <link
                rel={tag.tagType}
                href={tag.content}
                key={`${tag.tagType}-${i}`}
              />
            );
          }
          return null;
        })}
    </Head>
  );
}

export default memo(MetaTags);
