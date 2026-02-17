import { actions, useStore } from "@/store/store";
import { useRef, createContext, useEffect, useMemo } from "react";
import _shaka from "shaka-player";

export const CardpreviewContext = createContext(null);

function CardpreviewContextProvider(props) {
  const cardpreviewplayerInstanceRef = useRef(null);
  const cardpreviewplayerEventListenerRef = useRef(null);
  const { dispatch } = useStore();
  const { children } = props;

  function destroypreviewplayer() {
    const garbagePlayerInstance = cardpreviewplayerInstanceRef?.current;
    async function destroy() {
      if (garbagePlayerInstance) {
        await garbagePlayerInstance.destroy();
      }
    }
    cardpreviewplayerInstanceRef.current = undefined;
    destroy();
  }

  useEffect(() => {
    _shaka.polyfill.installAll();
    if (_shaka.Player.isBrowserSupported()) {
      // setPlayerSupported(true)
    }

    const destory = destroypreviewplayer;
    return () => {
      destory();
    };
  }, []);

  function attachMedia(mediaElement, stream_url, playereventCallback) {
    if (cardpreviewplayerInstanceRef.current !== undefined) {
      destroypreviewplayer();
    }
    cardpreviewplayerInstanceRef.current = new _shaka.Player();
    cardpreviewplayerEventListenerRef.current = new _shaka.util.EventManager();

    if (stream_url.includes(".m3u8")) {
      cardpreviewplayerInstanceRef.current
        .getNetworkingEngine()
        .registerRequestFilter(function requestFilter(type, request) {
          if (type === _shaka.net.NetworkingEngine.RequestType.SEGMENT) {
            request.method = "GET";
          }
        });

      cardpreviewplayerInstanceRef.current.configure({
        streaming: {
          lowLatencyMode: true,
          inaccurateManifestTolerance: 0,
          rebufferingGoal: 0.01,
          segmentPrefetchLimit: 2,
        },
      });
    }

    (async function load() {
      try {
        cardpreviewplayerEventListenerRef.current.listen(
          cardpreviewplayerInstanceRef.current,
          "onstatechange",
          (event) => {
            playereventCallback(event);
          }
        );
        dispatch({ type: actions.shakaCardHoverState, payload: true });
        await cardpreviewplayerInstanceRef.current.attach(mediaElement, true);
        // console.log("card preview attached media");
        // "https://cph-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        await cardpreviewplayerInstanceRef.current.load(stream_url);
        // console.log("card preview player loaded...");
      } catch (e) {
        // console.log("error",error);
      }
    })();
  }

  function detachMedia() {
    if (cardpreviewplayerInstanceRef.current) {
      (async function cleanup() {
        await cardpreviewplayerEventListenerRef.current.removeAll();
      })();
      dispatch({ type: actions.shakaCardHoverState, payload: false });
    }
  }

  return (
    <CardpreviewContext.Provider
      value={useMemo(() => ({ attachMedia, detachMedia }), [])}
    >
      {children}
    </CardpreviewContext.Provider>
  );
}

export default CardpreviewContextProvider;

/*
AbrStatusChangedEvent 'abrstatuschanged'
AdaptationEvent 'adaptation'
BufferingEvent 'buffering'
DownloadFailed 'downloadfailed'
DownloadHeadersReceived 'downloadheadersreceived'
DrmSessionUpdateEvent 'drmsessionupdate'
EmsgEvent 'emsg'
ErrorEvent 'error'
ExpirationUpdatedEvent 'expirationupdated'
GapJumpedEvent 'gapjumped'
LoadedEvent 'loaded'
LoadingEvent 'loading'
ManifestParsedEvent 'manifestparsed'
MediaQualityChangedEvent 'mediaqualitychanged'
MetadataEvent 	'metadata'
RateChangeEvent 'ratechange'
SegmentAppended 'segmentappended'
SessionDataEvent 'sessiondata'
StallDetectedEvent 'stalldetected'
StateChangeEvent 	'onstatechange'
StateIdleEvent 'onstateidle'
StreamingEvent 'streaming'
TextChangedEvent 'textchanged'
TextTrackVisibilityEvent 'texttrackvisibility'
TimelineRegionAddedEvent 'timelineregionadded'
TimelineRegionEnterEvent 'timelineregionenter'
TimelineRegionExitEvent 'timelineregionexit'
TracksChangedEvent 'trackschanged'
UnloadingEvent 'unloading'
VariantChangedEvent 'variantchanged'
*/
