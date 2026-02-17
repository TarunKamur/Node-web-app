import { useEffect, useRef, useState } from "react";
import styles from "@/components/banners/banners.module.scss";
import { appConfig } from "@/config/app.config";

const BannerVideo = ({ streamPath, streamEnd}) => {
  const playerInstancRef = useRef({current:null});
  const playerRef = useRef(null);  
  const winRef = useRef({current:null});
  const [jwBannerM, setJwBannerM] = useState(true);
  


  useEffect(() => {
    if (!!streamPath){
      try {
        let playSource = [
          {
            sources: [
              {
                file: streamPath.streamUrl,
                default: false,
                label: "0",
                preload: "metadata",
                type: "hls",
              },
            ],
            tracks: [],
          },
        ];
       startPlay(playSource);
      } catch (e) {}
    }
    return () => {
      removeplayer();
    };
  }, [streamPath]);

  const removeplayer = () => {
    if(playerInstancRef.current ) {
      playerInstancRef.current?.pause();
      playerInstancRef.current?.stop();
      playerInstancRef.current?.remove();
      playerRef.current = null;
      playerInstancRef.current=null;
    }
  };
  const handleScroll = () => {
    if (!!playerInstancRef.current) {
      if (window.scrollY > 500) {
        playerInstancRef.current.pause();
      } else {
        playerInstancRef.current.play();
      }
    }
  };

  const startPlay = (stream) => {
    let playerObj;
    const winRef = window;
    winRef.current = winRef;
    winRef.addEventListener("beforeunload",()=>{ setMuteData(true)});
   let mutedata = getMuteData();
   setJwBannerM(mutedata);
    if (playerRef.current) {
      let playerSetUP = {
        playlist: stream,
        controls: false,
        mute: mutedata,
        primary: "html5",
        width: "100%",
        autostart: true,
        preload: "auto",
        pipIcon: "disabled",
        aspectratio: "16:9",
        floating: false,
        hlshtml: true,
        poster: streamPath.imageUrl,
        intl: {
          en: {
            notLive: "Go Live",
          },
        },
        captions: {
          fontSize: 10,
          backgroundOpacity: 0,
        },
        logo: {
          hide: "false",
          position: "bottom-right",
        },
        events: {
          complete: (data) => {
            removeplayer();
            streamEnd(true);
          },
          error: (data) => {
            removeplayer();
             streamEnd(true);
          },
          setupError: (data) => {
            removeplayer();
            streamEnd(true);
          },
          ready: (data) => {
            getMuteData();
            streamEnd('firstFrame');
          },
          play:(data) =>{          },
          firstFrame: (data) => {
            if(winRef.scrollY > 500 ) {
              playerObj.pause() 
            }else{
              playerObj.play() 
            }
          
          },
        },
      };

      playerObj = window.jwplayer(playerRef.current);
      playerObj.setup(playerSetUP);
    }

    winRef.addEventListener("scroll",()=> handleScroll());
    playerInstancRef.current = playerObj;
  };

  const setMuteData = (mute) => {
    sessionStorage.setItem('jwBannerMute', JSON.stringify(mute));
  }

  const getMuteData = () => {
    const storedMute = sessionStorage.getItem('jwBannerMute');
    return storedMute ? JSON.parse(storedMute) : true;
  }

  const toggleMute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const muteSet = !jwBannerM;
    setJwBannerM(muteSet);
    setMuteData(muteSet);
    playerInstancRef.current.setMute(muteSet);
  };

  return (
    <>
      <div ref={playerRef}></div>
        <img key={ jwBannerM ? "volume-mute" : "volume-unmute"}
        className={`${styles.player_mute}`}
        onClick={toggleMute}       
        src={`${appConfig.staticImagesPath}${
          jwBannerM ? "volume-mute.svg" : "volume-unmute.svg"
        }`}
        width="30"
        alt="unmute"
      />
    </>
  );
};

export default BannerVideo;
