import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router';
import { getPagePath, getQueryParams, } from '@/services/utility.service';
import useGetApiMutate from '@/hooks/useGetApidata';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import styles from '@/components/tvguide/tvguide.module.scss'

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';



const TvGuidedates = () => {
    const router = useRouter();
    const { mutate: mutateGetData, data: channelsData } = useGetApiMutate()
    const [pagePath, setPagePath] = useState({});
    // const [channelData, setChannelData] = useState({})
    const prevRef = useRef(null)
    const nextRef = useRef(null)

    useEffect(() => {
        let pPath = router.asPath;
        setPagePath({
            path: getPagePath(pPath),
            query: getQueryParams(pPath),
        });
        getChannelsData(getPagePath(pPath));
    }, [router.asPath]);
    const getChannelsData = async (path) => {
        let url = process.env.initJson["api"] + "/service/api/v1/tvguide/channels"
        try {
            mutateGetData(url)
        } catch (e) { }
    };

    const customNavigation = (swiper) => {
        swiper.params.navigation.prevEl = prevRef.current
        swiper.params.navigation.nextEl = nextRef.current
        swiper.navigation.init()
        swiper.navigation.update()
    }

    return (
        <div>
            <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={50}
                slidesPerView={10}
                navigation={
                    {
                        prevEl: prevRef.current,
                        nextEl: nextRef.current
                    }
                }
                onInit={(swiper) => { customNavigation(swiper) }}
                scrollbar={{ draggable: true }}
            >
                {channelsData && channelsData?.data?.response?.tabs.map((tab) => {
                    return <SwiperSlide key={tab.subtitle}>{tab.title}{tab.subtitle}</SwiperSlide>
                })}

                <div className={`${styles.prev}`} ref={prevRef}></div>
                <div className={`${styles.next}`} ref={nextRef}></div>
            </Swiper>
        </div>
    )
}
export default TvGuidedates