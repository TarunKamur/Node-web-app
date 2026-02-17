import { getAbsolutePath } from "@/services/user.service";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import styles from "@/components/banners/banners.module.scss";
import Link from "next/link";
import BannerVideo from "@/components/banners/bannersVideo.component";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import { ImageConfig } from "@/config/ImageConfig";
import { sendEvent } from "@/services/analytics.service";
import { getPagePath, getSelectedMenu } from "@/services/utility.service";
import { useRouter } from "next/router";

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
  };
  return (
    <Link
      href={item.target.path}
      prefetch={false}
      target={_isblank}
      onClick={() => {
        sendAnalytics(item);
      }}
      aria-label="banner"
    >
      {props.children}
    </Link>
  );
};

const Banners = ({ bannerslist }) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [startSwiper, setStartSwiper] = useState(null);
  const [banners, setbanners] = useState([]);
  const [isbannerVideo, setIsbannerVideo] = useState(null);
  const [timeoutId, settimeoutId] = useState(null);
  const imageElementRef = useRef(null);

  useEffect(() => {
    if (bannerslist) {
      const wbanners = bannerslist?.map((ele) => {
        ele.imageUrl = getImagePath(ele.imageUrl);
        if (
          !!ele.params &&
          !!ele.params.streamUrl &&
          ele.params.streamUrl.length
        ) {
          ele.videoAvilable = true;
        } else ele.videoAvilable = false;
        return { ...ele };
      });
      setbanners(wbanners);
    }
  }, [bannerslist]);

  function getImagePath(path) {
    return !!path ? getAbsolutePath(path) : "";
  }

  if (banners && banners.length == 0) {
    return <></>;
  }

  function getResolution() {
    var width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;

    var height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    return { width: width, height: height };
  }

  const SliderChange = (sw) => {
    var resolution = getResolution();
    if (sw.realIndex == 0) window.addEventListener("resize", handleResize());

    if (banners[sw.realIndex].videoAvilable && resolution.width > 991) {
      setpagNatCss();
      sw.autoplay.stop();
      let timeoutIds = setTimeout(() => {
        sw?.autoplay?.stop();
        setIsbannerVideo(banners[sw.realIndex]);
      }, 3000);
      settimeoutId(timeoutIds);
    } else {
      stratSwiperSlide();
    }
  };
  const setpagNatCss = () => {
    if (startSwiper?.pagination?.el)
      startSwiper.pagination.el.classList.remove(
        styles.videoCustomPaginationClass
      );
  };

  const stratSwiperSlide = () => {
    if (startSwiper && typeof startSwiper?.autoplay?.start === "function") {
      clearTimeout(timeoutId);
      startSwiper.autoplay.start();
      setIsbannerVideo(null);
      cntrlImgdisplay("block");
      setpagNatCss();
    }
  };

  const setEndHandular = (status) => {
    const imageElement = document.getElementById(
      "img_bannerImg_" + isbannerVideo?.id
    );
    imageElementRef.current = imageElement;
    if (status == "firstFrame") {
      if (startSwiper.pagination.el) {
        startSwiper?.pagination?.el?.classList.add(
          styles.videoCustomPaginationClass
        );
      }
      cntrlImgdisplay("none");
    } else {
      stratSwiperSlide();
    }
  };

  const handleResize = () => {
    var resolution = getResolution();
    if (resolution.width > 991) setEndHandular("");
  };

  const loaderProp = ({ src }) => {
    return src;
  };

  const cntrlImgdisplay = (setdisplay) => {
    if (imageElementRef.current) {
      imageElementRef.current.style.display = setdisplay;
    }
  };

  return (
    <>
      <div className={` ${styles.banners_wrap}`}>
        <span className={` ${styles.banner_bottom_gradient}`}></span>
        <div className={` ${styles.banner_cont}`} id="banner_cont">
          <Swiper
            id="banner_cont"
            onSlideChange={SliderChange}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            effect={"fade"}
            breakpoints={{
              768: {
                slidesPerView: 1.2,
              },
              1024: {
                slidesPerView: 1,
              },
            }}
            centeredSlidesBounds={true}
            initialSlide={0}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              horizontalClass: `${styles.customPaginationClass}`,
            }}
            modules={[EffectFade, Autoplay, Pagination, Navigation]}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
              setStartSwiper(swiper);
            }}
          >
            {banners.map((item) => (
              <SwiperSlide key={item.id}>
                <BannerWrappper item={item}>
                  <div className={`${styles.imgContainer}`}>
                    <Image
                      fill
                      sizes="100vw"
                      loader={loaderProp}
                      src={item.imageUrl}
                      id={`img_bannerImg_${item.id}`}
                      className={`${styles.img_responsive} `}
                      alt={`Banner ${item.id}`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.srcset = `${ImageConfig?.defaultbanner}`;
                      }}
                    />

                    {!!isbannerVideo &&
                      item.videoAvilable &&
                      item.id === isbannerVideo?.id && (
                        <div
                          className={`${styles.JWPlayers_parent} ${!!isbannerVideo && styles.img_remvZIndex}  `}
                        >
                          {isbannerVideo?.params?.streamUrl && (
                            <BannerVideo
                              className={`${styles.img_responsive} ${item.id}`}
                              id="JWPlayer"
                              streamPath={{
                                streamUrl: isbannerVideo?.params?.streamUrl,
                                imageUrl: item.imageUrl,
                                isbannerVideo: isbannerVideo,
                              }}
                              streamEnd={setEndHandular}
                            />
                          )}
                        </div>
                      )}
                  </div>
                </BannerWrappper>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default Banners;
