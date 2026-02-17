import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./breadCrumb.module.scss";

const Breadcrumb = () => {
  const router = useRouter();
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const pathWithoutQuery = router.asPath.split("?")[0];
    const pathSegments = pathWithoutQuery.split("/").filter(Boolean);

    const segmentPaths = pathSegments.map((segment, index) => ({
      name: segment,
      path: "/" + pathSegments.slice(0, index + 1).join("/"),
    }));

    setSegments(segmentPaths);
  }, [router.asPath]);

  const formatSegment = (segment) =>
    segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleNavigation = (index) => {
    if (index === segments.length - 1) return; 
    if (index === -1) {
      router.push("/"); 
    } else {
      if (window.history.length > 1) {
        router.back();
      } else {
        const previousPath = segments[index].path;
        router.push(previousPath);
      }
    }
  };

  if (!segments.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbContainer}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <button
            onClick={() => handleNavigation(-1)}
            className={styles.homeLink}
            aria-label="Home"
          >
            <svg className={styles.homeIcon} viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>
        </li>

        {segments.map((segment, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            <span className={styles.separator} aria-hidden="true"></span>
            <button
              onClick={() => handleNavigation(index)}
              className={`${styles.link} ${
                index === segments.length - 1 ? styles.current : ""
              }`}
              aria-current={index === segments.length - 1 ? "page" : undefined}
              disabled={index === segments.length - 1}
            >
              {formatSegment(segment.name)}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
