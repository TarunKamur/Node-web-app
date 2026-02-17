import { getAbsolutePath } from "@/services/user.service";
import { useEffect, useRef, useState } from "react";
import styles from "./SlickBanners.module.scss";
import Link from "next/link";
// import "swiper/css";
// import "swiper/css/effect-fade";
// import "swiper/css/pagination";
// import "swiper/css/navigation";
// import "swiper/css/grid";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ShakaBannerVideo from "@/components/bannersV2/ShakaBannerVideo.component";
import {
  getPagePath,
  getResolution,
  getSelectedMenu,
} from "@/services/utility.service";
import { sendEvent } from "@/services/analytics.service";
import { analyticsForMyReco } from "@/services/myReco.service";
import { useRouter } from "next/router";
import { BannerImage } from "./bannerImage";

const BannerWrappper = (props) => {
  const { item } = props;
  const _isblank = item.isInternal ? "_self" : "_blank";
  const router = useRouter();
  const sendAnalytics = (bannerImage) => {
    sendEvent("craousel_clicked", {
      header_button: getSelectedMenu(getPagePath(router.asPath)),
      banner_title:
        bannerImage?.title && bannerImage.title.trim()
          ? bannerImage.title
          : "-1",
      redirection_link: bannerImage?.target?.path,
    });
    sendMyrecoAnalytics();
  };
  const sendMyrecoAnalytics = () => {
    let carouselPosition = 0;
    let contentPosition = props?.index;
    carouselPosition = carouselPosition.toString() || "";
    contentPosition = contentPosition.toString() || "";
    const myRecoAnalyticsData = {
      contentPath: props?.item?.target?.path,
      carouselPosition,
      contentPosition,
      trackingId: "",
      originName: "Banner",
    };
    const pagePath = {
      dataType: "",
      pagePath: router.asPath,
    };
    analyticsForMyReco(myRecoAnalyticsData, pagePath);
  };

  const getLink = (item) => {
    sendAnalytics(item);
    if (item?.metadata?.planId && item.isInternal) {
      let url = `${item.target.path}?planId=${encodeURIComponent(btoa(item.metadata.planId))}`;
      router.push(url);
    } else {
      let urlNav = item.target.path;
      if (item.isInternal) {
        router.push("/" + item.target.path);
      } else {
        let path = item.target.path;

        urlNav = path.includes("http")
          ? item.target.path
          : window?.location?.origin + "/" + item.target.path;
        window.open(urlNav, _isblank);
      }
    }
  };
  return (
    <div onClick={() => getLink(item)} aria-label="banner">
      {props.children}
    </div>
  );
};

const SlickBanners = ({ bannerslist, bannerCode }) => {
  const [banners, setbanners] = useState([]);
  const [isbannerVideo, setIsbannerVideo] = useState(null);
  const imageElementRef = useRef(null);
  const slickSlider = useRef(null);
  const videoTimeout = useRef(null);
  const bannerInnerWidth = window.innerWidth;

  useEffect(() => {
    if (bannerslist) {
      const wbanners = bannerslist?.map((ele) => ({
        ...ele,
        imageUrl: getImagePath(ele.imageUrl),
        videoAvilable: !!ele.params?.streamUrl?.length,
      }));
      setbanners(wbanners);
      //setting banner video as muted when mounted
      sessionStorage.setItem("isMutedSessionStored", true);
    }
  }, [bannerslist]);

  const getImagePath = (path) => {
    try {
      return !!path ? getAbsolutePath(path) : "";
    } catch (e) {}
  };

  const handleResize = () => {
    let resolution = getResolution();
    if (resolution.width > 991) streamEnded();
  };

  const cntrlImgdisplay = (setdisplay) => {
    if (imageElementRef.current) {
      imageElementRef.current.style.display = setdisplay;
    }
  };

  const onInitalization = () => {
    setTimeout(() => {
      checkIsVideoAvailable(0);
    }, 100);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    fade: true,
    autoplay: true,
    autoplaySpeed: 5000,
    afterChange: (current) => checkIsVideoAvailable(current),
    onInit: () => onInitalization(),
    appendDots: (dots) => (
      <div
        id="slickDots"
        className={`${bannerCode == "freedom-tv" && "freedomTv"}`}
      >
        <ul> {dots} </ul>
      </div>
    ),
  };

  const checkIsVideoAvailable = (currentIndex) => {
    //clearing old video banner if applicable
    setIsbannerVideo(null);
    //clearing video timeout
    clearTimeout(videoTimeout.current);
    videoTimeout.current = null;

    const resolution = getResolution();
    if (currentIndex === 0) {
      window.addEventListener("resize", handleResize);
    }
    const currentBanner = banners[currentIndex];
    if (currentBanner?.videoAvilable && resolution.width > 991) {
      slickSlider?.current?.slickPause();
      videoTimeout.current = setTimeout(() => {
        slickSlider?.current?.slickPause();
        setIsbannerVideo(currentBanner);
      }, 3000);
    } else {
      slickSlider?.current?.slickPlay();
    }
  };

  const streamEnded = () => {
    setIsbannerVideo(null);
    cntrlImgdisplay("block");
    //pushing slide to next slide
    slickSlider?.current?.slickGoTo(
      slickSlider?.current?.innerSlider?.state?.currentSlide + 1,
      true
    );
    //resume play
    slickSlider?.current?.slickPlay();
  };

  if (banners && banners.length == 0) {
    return <></>;
  }

  return (
    <div
      className={`${styles.banners_wrap} ${styles[bannerCode]} ${bannerCode}`}
    >
      <span className={styles.banner_bottom_gradient}></span>
      <div className={`${styles.banner_cont} `} id="banner_cont">
        <Slider {...settings} ref={slickSlider}>
          {banners.map((item, index) => (
            <div key={item.id}>
              <BannerWrappper item={item} index={index}>
                {!isbannerVideo && (
                  <BannerImage item={item} bannerCode={bannerCode} />
                )}
                {isbannerVideo &&
                  item.videoAvilable &&
                  item.id === isbannerVideo?.id &&
                  isbannerVideo?.params?.streamUrl && (
                    <div
                      className={`${styles.JWPlayers_parent} ${styles.img_remvZIndex}`}
                      style={{ height: bannerInnerWidth * 0.4375 + "px" }}
                    >
                      <ShakaBannerVideo
                        item={item}
                        streamPath={{
                          streamUrl: isbannerVideo?.params?.streamUrl,
                          imageUrl: item.imageUrl,
                          isbannerVideo: isbannerVideo,
                        }}
                        streamEnd={streamEnded}
                      />
                    </div>
                  )}
              </BannerWrappper>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default SlickBanners;
