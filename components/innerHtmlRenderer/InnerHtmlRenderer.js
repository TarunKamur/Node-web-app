import React, { useState } from "react";
import { isHTML } from "@/services/utility.service";

/**
 * InnerHtmlRenderer Component.
 * 
 * @param {string} data - The data to render, which may contain HTML.
 * @param {boolean} isDataTruncate - Whether to truncate the data.
 * @param {string} customClass - Custom CSS class to apply to the container.
 * @param {Object} styles - Styles object containing CSS classes for inner elements. for now readMore styles is used
 * @param {string} styles.readMore - CSS class for the "Read More" / "Show Less" toggle.
 * 
 * @returns {JSX.Element} The rendered component.
 */
const InnerHtmlRenderer = ({ data, isDataTruncate, customClass,styles }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
 
 
  // Toggle the description between full and truncated.
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  /**
   * Generate the description with HTML.
   * 
   * @returns {Object} An object containing the HTML to render.
   */
  const getDescription = () => {
    if (!data) return { __html: "" };
    if (isHTML(data)) {
      return {
        __html: data,
      };
    }
    const description = isDataTruncate
      ? showFullDescription
        ? data
        : data.length > 200
          ? data.slice(0, 200) + "... "
          : data
      : data;

    return {
      __html:
        description +
        (data.length > 200 && isDataTruncate
          ? `<span class="${styles.readMore}">${showFullDescription ? " Show Less" : " Read More"}</span>`
          : ""),
    };
  };

  return (
    <div
      className={customClass}
      onClick={toggleDescription}
      dangerouslySetInnerHTML={getDescription()}
    />
  );
};
export default InnerHtmlRenderer;
