import Link from "next/link";
import styles from "@/components/logo/logo.module.scss";
import { appConfig } from "@/config/app.config";

const Logo = ({ children, showLogo }) => {
  return (
    <>
      {showLogo && (
        <Link href="/" prefetch={false} aria-label="app logo">
          <img
            alt="logo"
            className={`${styles.logo}`}
            src={appConfig?.appLogo}
          />
        </Link>
      )}
      {children}
    </>
  );
};

export default Logo;
