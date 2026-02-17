
/**
 * The closure which is supposed to work as a Node Package Module or on ANY Browser, whether it is 
 * on mobile or on Desktop. This closure produces the instance of the Plugin accordingly. 
 * 
 * @author shivakumarn@yupptv.com for OTT Plateform - LastUpdated - 14-12-2022(DeviceId added)
 * @version V2 --1.6
 * @returns VideoAnalyticsPlugin's instance.
 */

(function (rootObject, pluginFactory) {
    'use strict';
    if (typeof exports === 'object') {
        module.exports = pluginFactory();
    } else if (typeof define === 'function' && define.amd) {
        define(pluginFactory);
    } else {
        rootObject.VideoAnalyticsPlugin = pluginFactory(rootObject);
    }
})

    /**
     * The factory function which creates and returns the instance of VideoAnalyticsPlugin to be used
     * with the web media players of the HTML5 media players.
     */
    (this, function (window) {
             
        /**
         * The object maintaining the Collector end point details.
         */
        var Configuration = function () {

            this.setConfig = function (analytics_id) {
                if (!localStorage.getItem("collector_api")) {
                    $.ajax({
                        dataType: "json",
                        url: "https://test-analytics.revlet.net/sdk/validation?analytics_id=" + analytics_id,
                        // url: "http://119.81.201.168:8081/sdk/validation?analytics_id=" + analytics_id,  // test
                        //url: "http://location.api.yuppcdn.net/sdk/validation?analytics_id="+analytics_id,    //   live     
                    })
                        .done(function (response) {

                            localStorage.setItem("hb_rate", response.hb_rate);
                            localStorage.setItem("collector_api", response.collector_api);
                            localStorage.setItem("analytics_id", analytics_id);
                        });
                }
            }

        };

        /**
         * A simple implementation of the a QUEUE using a Java Script Array.
         * The methods are offer and poll in sync (name wise) with Linked Blocking Queue of Java.
         */
        var Queue = function () {
            var _queue = [];

            return {
                /**
                 * @param element to be pushed to the Queue.
                 */
                offer: function (element) { _queue.push(element); },

                /**
                 * @returns element next in the Queue.
                 */
                poll: function () {
                    var element = _queue.shift();
                    if (element) {
                        return element;
                    }
                }
            };
        };

        /**
         * The factory for the events.
         */
        var EventFactory = function () {
            /**
             * @param eventData the Json map holding the details for the map.
             * @param responseKey the response key to be tracked.
             * @return the event instance.
             */
            this.create = function (eventData) { return new Event(eventData); };
        };

        /**
         * The Event Data object, has two parts, parameterMap which holds the event details.
         * The other part is the response key tracker not used for now but will be used.
         */
        var Event = function (pParameterMap) {
            this.parameterMap = pParameterMap;
        };

        /**
         * A simple Event Queue implementation for Java Script.
         * This class is responsible for managing the event queue, polling and sending them to the server.
         */
        var EventQueueManager = function () {


            var eventQueue = new Queue(); // The Queue Data structure.
            var $ = {}; // The handle to the JQuery instance for making AJAX.
            var _this = this; // Self reference.
            //  this.eventCounter = 1;
            // Determine where to retrieve the JQuery Handle from.
            if (typeof exports === 'object') {
                var domino = require('domino');
                $ = require('jquery')(domino.createWindow());
                var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
                $.support.cors = true; // cross domain
                $.ajaxSettings.xhr = function () { return new XMLHttpRequest(); };
            } else if (window) {
                $ = window.$;
            }

            /**
             * The simple function which does the HTTP GET/POST to send data to 
             * the Event Collector.
             */
            var httpService = function () {
                var eventData = eventQueue.poll();

                if (eventData && eventData.parameterMap) {
                    var eventJson = JSON.stringify(eventData.parameterMap)
                    if (!!eventJson) {
                        _this.doAjax(eventJson);
                    }
                }
            };


            /**
             * The ajax utility function.
             */
            this.doAjax = function (eventData) {
                var collector_api = localStorage.getItem("collector_api")
                if (!!collector_api) {
                    try {     
                    $.ajax({
                        type: 'POST',
                        url: 'http://' + collector_api,
                        data: { data: eventData, analytics_id: localStorage.getItem("analytics_id") }
                    }).done(function (response) {
                       /* console.log("Received response: " + response); */
                    }).fail(function (data) {
                      //  console.log(data);
                    });
                    
                } catch (error) {
                        
                }
                }
            };

            // Schedule the services at 1/2 a second intervals.
            var httpWorker = (window) ? window.setInterval(httpService, 0) : setInterval(httpService, 0);
            var eventFactory = new EventFactory();

            /**
             * Shuts down the timers clearing them.
             */
            this.shutdown = function () {
                if (window) { window.clearInterval(httpWorker); } else { clearInterval(httpWorker); }
            };

            /**
             * The event handler, which pushes the events to the Event-Queue.
             * 
             * @param eventMap the event details.
             * @reponseKey the response tracker.
             */
            this.handleEvent = function (eventMap) {
                eventQueue.offer(eventFactory.create(eventMap));
            };
        };

        /**
         * Enumeration representing the types of events supported by the plugin.
         */
        var EventContextKeys = function () {
            this.EVENT_TYPE = "et";
            this.EVENT_OCCURENCE_TIME = "eot";
            this.ERROR_REASON_CODE = "erc";

            this.THUMB_VIDEO_CLICK = 1;
            this.PLAYER_LOAD = 2;
            this.AD_STARTED = 3;
            this.AD_SKIPPED = 4;
            this.AD_ENDED_BY_USER = 5;
            this.AD_COMPLETED = 6;
            this.VIDEO_STARTED = 7;
            this.VIDEO_ENDED_BY_USER = 8;
            this.VIDEO_COMPLETED = 9;
            this.VIDEO_SEEK = 10;
            this.BUFFER_START = 11;
            this.BUFFER_END = 12;
            this.VIDEO_PAUSE = 13;
            this.VIDEO_RESUME = 14;
            this.HEART_BEAT = 15;
            this.ERROR_MSGS = 16;
            this.BITRATE_CHANGE = 17;

        };




        /**
         * The Video analytics plugin's main class.
         */
        var VideoAnalyticsPlugin = function () {

            var yupptv = {};
            yupptv.eventContextKeys = new EventContextKeys();
            yupptv.eventQueueManager = {};
            yupptv.sessionKey = {};
            yupptv._this = this;
            yupptv.heartBeatRate = 60;
            yupptv.httpHeartBeatWorker = {};
            yupptv.eventCounter = 1;
            yupptv.playerData = {};
            yupptv.contentData = {};
            yupptv.userData = {};
            yupptv.demographics = {};
            yupptv.clientData = {};
            yupptv.videoData = {};
            yupptv.eventDefaultValue = -1;
            yupptv.playSessionKey = yupptv.bitRate = yupptv.eventDefaultValue;
            yupptv.eventMetaData = {
                STPosition: yupptv.eventDefaultValue,
                ETPosition: yupptv.eventDefaultValue,
                errorMsg: yupptv.eventDefaultValue,
                adType: yupptv.eventDefaultValue,
            };
            yupptv.serverTimeStamp = 0;
            yupptv.timer = '';
            yupptv.systemConfig = '';

            yupptv.isVideoPlaying = false;
            yupptv.isPaused = false;
            yupptv.isAdPlaying = false;
            yupptv.isBuffering = false;
            yupptv.isSessionEnded = false;

            /**
             * Set the Geographical information.
             */

            function setValue(value) {
                return (!!value) ? value : yupptv.eventDefaultValue;
            }

            function getPlayerPosition(eventContextKey){
                if(!!window.jwplayer().getPosition && !!(window.jwplayer().getPosition() && yupptv.videoData.contentType != 'live')){
                    return Math.floor(window.jwplayer().getPosition() * 1000);
                } 
                else{
                   return eventContextKey ===  yupptv.eventContextKeys.VIDEO_STARTED ? 0 : yupptv.eventDefaultValue;
                }
            }

            function getPlayerState(eventContextKey){
                 if(eventContextKey === yupptv.eventContextKeys.VIDEO_STARTED){
                    return 'playing';
                }                
                else if((eventContextKey === yupptv.eventContextKeys.THUMB_VIDEO_CLICK) || (eventContextKey === yupptv.eventContextKeys.PLAYER_LOAD) || (eventContextKey === yupptv.eventContextKeys.VIDEO_COMPLETED) || (eventContextKey === yupptv.eventContextKeys.VIDEO_ENDED_BY_USER) || (eventContextKey === yupptv.eventContextKeys.ERROR_MSGS)){
                    return 'idle';
                }
                else if(!!window.jwplayer().getPosition && !!(window.jwplayer().getPosition())) {
                    return window.jwplayer().getState();
                }
                else {                    
                    return yupptv.eventDefaultValue;           
                }
            }

            function getVideoDuration(){  // totalVideoLength 
                if(!!window.jwplayer().getDuration && !!(window.jwplayer().getDuration()) && yupptv.videoData.contentType != 'live'){
                    return Math.floor(window.jwplayer().getDuration() * 1000);
                }
                else {
                    return yupptv.eventDefaultValue;    
                }
            }
            

            

            /**
             * Set some meta data about the player used to play the streams.
             */
            this.setPlayerMetaData = function (data) {
                yupptv.playerData.playerName = setValue(data.playerName);
                yupptv.playerData.playerVersion = setValue(data.playerVersion);
            };


            /*
              sets the meta information about sessions and network 
              */
            this.setClientMetaData = function (data) {
                yupptv.clientData.appVersion = setValue(data.appVersion);
                yupptv.clientData.connectionType = setValue(data.connectionType);
                yupptv.clientData.clientIP = setValue(data.clientIP);
                yupptv.clientData.NWProvider = setValue(data.NWProvider);
            }

            /**
             * Set meta data about the content which is being played.
             */
            this.setContentMetaData = function (data) {

                yupptv.contentData.CDNetwork = setValue(data.CDNetwork);
                yupptv.contentData.navigationFrom = setValue(data.navigationFrom);
                yupptv.contentData.metaId = setValue(data.metaId);   //  set content identifier.
                yupptv.contentData.metaMap = setValue(data.metaMap);    // set the key and value paire of the content being played.
                yupptv.contentData.a1 = setValue(data.a1); 
                yupptv.contentData.a2 = setValue(data.a2);                 
            };

            /**
             * Sets the meta information about the user who has logged in.
             */
            this.setUserMetaData = function (data) {

                yupptv.userData.userId = setValue(data.userId);
                yupptv.userData.profileId = setValue(data.profileId);
                yupptv.userData.boxId = setValue(data.boxId);
                yupptv.userData.deviceType = setValue(data.deviceType);
				yupptv.userData.deviceId = setValue(data.deviceId);
                yupptv.userData.deviceClient = this.getBrowserName();
                yupptv.userData.deviceOS = this.getPlatForm();
                yupptv.contentData.isSubscribed = setValue(data.isSubscribed);
            };

            /*
             set meta data for video information
            */
            this.setVideoMetaData = function (data) {
                yupptv.videoData.autoplay = data.autoplay;
                yupptv.videoData.productName = setValue(data.productName);
                yupptv.videoData.streamURL = setValue(data.streamURL);
                yupptv.videoData.contentType = setValue(data.contentType);
            }

            /*
            set meta data for video information
           */
            this.setBitRate = function (data) {
                yupptv.bitRate = setValue(data.bitRate);
            }
            // reset eventmeta data		 
            var resetEventMetaData = function () {
                for (var key in yupptv.eventMetaData) {
                    yupptv.eventMetaData[key] = yupptv.eventDefaultValue;
                }
            }

            /*
             *  functon to collect total analytics data to push   
             */
            var collateEventData = function (eventContextKey) {
                var eventDataMap = {};
                 if (eventContextKey === yupptv.eventContextKeys.THUMB_VIDEO_CLICK) {


                    // collate user and device information				                       
                    //eventDataMap.dt = yupptv.userData.deviceType;     // DeviceType		                               
                    eventDataMap.dos = yupptv.userData.deviceOS;    // DeviceOS                                
					
                    // Collate player information.
                    eventDataMap.pln = yupptv.playerData.playerName;    // PlayerName  
                    eventDataMap.plv = yupptv.playerData.playerVersion;    // PlayerVersion

                    // Collate program information.		                                
                    eventDataMap.cdn = yupptv.contentData.CDNetwork;     // ContentDeliveryNetwork		              
                    eventDataMap.nf = yupptv.contentData.navigationFrom;    // NavigationFrom            
                    eventDataMap.is = yupptv.contentData.isSubscribed;     // IsSubscribed              

                    // Collate client information.
                    eventDataMap.appv = yupptv.clientData.appVersion;    // AppVersion
                    eventDataMap.cnt = yupptv.clientData.connectionType;     // ConnectionType
                    eventDataMap.ip = yupptv.clientData.clientIP;     // ClientIP		
                    eventDataMap.np = yupptv.clientData.NWProvider;    // NetworkProvider-Carri           

                    // collate video information
                    eventDataMap.ap = yupptv.videoData.autoplay;     // Autoplay                  		
                    eventDataMap.su = yupptv.videoData.streamURL;     // StreamURL                                                                                 

                }
                eventDataMap.dt = yupptv.userData.deviceType;     // DeviceType
                eventDataMap.dc = yupptv.userData.deviceClient;     // DeviceClient  
				eventDataMap.di = yupptv.userData.deviceId; // DeviceId				
                eventDataMap.bi = yupptv.userData.boxId;   // BoxId		// box id need for every heart beat event. new requirement
                eventDataMap.sk = yupptv.sessionKey.key;     // SessionKey    
                eventDataMap.psk = yupptv.playSessionKey;     // playSessionKey    		   		             
                eventDataMap.ui = yupptv.userData.userId;          // UserId  
                eventDataMap.pid = yupptv.userData.profileId;          // profileId                              
                eventDataMap.pdn = yupptv.videoData.productName;     // ProductName      
		        eventDataMap.pp = getPlayerPosition(eventContextKey);
                eventDataMap.ps = getPlayerState(eventContextKey);
                eventDataMap.meta_id = yupptv.contentData.metaId;
                eventDataMap.meta_map = yupptv.contentData.metaMap;
                eventDataMap.a1 = yupptv.contentData.a1;
                eventDataMap.a2 = yupptv.contentData.a2;              
                eventDataMap.sp = Math.floor(setValue(yupptv.eventMetaData.STPosition));     // StartTime-Position    
                eventDataMap.ep = Math.floor(setValue(yupptv.eventMetaData.ETPosition));     // EndTime-Position   
                eventDataMap.br = yupptv.bitRate;     // BitRate    		 
		        eventDataMap.tvl = getVideoDuration();
                eventDataMap.em = yupptv.eventMetaData.errorMsg;     // EventMessage 
                eventDataMap.at = yupptv.eventMetaData.adType;     // AdType    
                eventDataMap.et = eventContextKey; //
                eventDataMap.av = 'v2';     // AnalyticsVersion  
                eventDataMap.ts = new Date().getTime();     // TimeStamp 	in milli seconds
                eventDataMap.ec = yupptv.eventCounter;
                yupptv.eventCounter = yupptv.eventCounter + 1; //
                return eventDataMap;

            };

            /* The heart beat service, to make sure the client is live while watching the event. */
            var heartBeatService = function (et) {
                resetEventMetaData();
                var eventDataMap = collateEventData(et);
                yupptv.eventQueueManager.doAjax(JSON.stringify(eventDataMap));
            };

            /* This function starts the heart-beat for the client. */
            var startHeartbeat = function () {
                var event_type = yupptv.eventContextKeys.HEART_BEAT;
                var heartBeat = !!localStorage.getItem("hb_rate") ? localStorage.getItem("hb_rate") : 60;
                yupptv.httpHeartBeatWorker = (window) ? window.setInterval(function () { heartBeatService(event_type); }, (1000 * heartBeat)) :
                    setInterval(function () { heartBeatService(event_type); }, (1000 * heartBeat));
            };

            /**
             * This function stops the heart-beat for the client.
             */
            var stopHeartbeat = function () {
                (window) ? window.clearInterval(yupptv.httpHeartBeatWorker) : clearInterval(yupptv.httpHeartBeatWorker);
                //clearInterval(timer);
                yupptv.eventCounter = 1;
                yupptv.isVideoPlaying = false;
                yupptv.isPaused = false;
                yupptv.isAdPlaying = false;
                yupptv.isBuffering = false;               
            };

            /**
             * Loads and initializes the Plugin.
             */
            this.load = function (initData) {

                var configObj = new Configuration();
                configObj.setConfig(initData.analytics_id);

                yupptv.eventQueueManager = new EventQueueManager();
                yupptv.sessionKey.key = initData.authKey;
                yupptv.sessionKey.trueIp = initData.trueIp;
                yupptv.sessionKey.clientId = initData.clientId;
                return yupptv._this;
            };

            /* The generic handle event method. */
            var handleEvent = function (eventContextKey) {
                 var eventDataMap = collateEventData(eventContextKey);
                yupptv.eventQueueManager.handleEvent(eventDataMap);
            };


            //  player events by shiva nomula 200671
            //************* starts here ********************//
            /*
               triggers when thumbnail video clicks
            */
            this.thumbnailVideoClick = function () {

                yupptv.playSessionKey = new Date().getTime();
                yupptv.isSessionEnded = false;
                resetEventMetaData();
                stopHeartbeat();
                handleEvent(yupptv.eventContextKeys.THUMB_VIDEO_CLICK);
                startHeartbeat();
            }

            /*  triggers when player loads. */
            this.handlePlayerLoad = function () {
                handleEvent(yupptv.eventContextKeys.PLAYER_LOAD);
            }

            /*  triggers when ad started. */
            this.handleAdStarted = function (playerEvent) {
                if (!yupptv.isAdPlaying) {
                    yupptv.eventMetaData.adType = playerEvent.adType;
                    handleEvent(yupptv.eventContextKeys.AD_STARTED);
                    yupptv.isAdPlaying = true;
                }
            }

            /* 		   triggers when ad skipped. */
            this.handleAdSkipped = function (playerEvent) {
                if (yupptv.isAdPlaying) {
                    yupptv.eventMetaData.adType = playerEvent.adType;
                    handleEvent(yupptv.eventContextKeys.AD_SKIPPED);
                    resetEventMetaData();
                    yupptv.isAdPlaying = false;
                }
            }

            /* triggers when ad ended by user.*/
            this.handleAdEndedByUser = function (playerEvent) {
                if (yupptv.isAdPlaying) {
                    yupptv.eventMetaData.adType = playerEvent.adType;
                    handleEvent(yupptv.eventContextKeys.AD_ENDED_BY_USER);
                    resetEventMetaData();
                    yupptv.isAdPlaying = false;
                }
            }

            /* triggers when ad skipped.*/
            this.handleAdCompleted = function (playerEvent) {
                if (yupptv.isAdPlaying) {
                    yupptv.eventMetaData.adType = playerEvent.adType;
                    handleEvent(yupptv.eventContextKeys.AD_COMPLETED);
                    resetEventMetaData();
                    yupptv.isAdPlaying = false;
                }
            }

            /*  triggers when play starts */
            this.handlePlayStarted = function () {

                if (!yupptv.isVideoPlaying) {
                    resetEventMetaData();                   
                    handleEvent(yupptv.eventContextKeys.VIDEO_STARTED);
                    yupptv.isVideoPlaying = true;
		    
                }

            };

            /* triggers when play ends by user		 */
            this.handlePlayEndedByUser = function () {
                if (yupptv.isVideoPlaying || yupptv.isAdPlaying || yupptv.isBuffering || yupptv.isPaused) {
                    resetEventMetaData();
                    handleEvent(yupptv.eventContextKeys.VIDEO_ENDED_BY_USER);
                    stopHeartbeat();
                    yupptv.isSessionEnded = true;
                }
            };

            /* *  triggers when play ends (completed) */
            this.handlePlayCompleted = function () {
                if ((yupptv.isVideoPlaying || yupptv.isAdPlaying || yupptv.isBuffering || yupptv.isPaused) && !yupptv.isSessionEnded) {
                    resetEventMetaData();
                    handleEvent(yupptv.eventContextKeys.VIDEO_COMPLETED);
                    stopHeartbeat();
                    yupptv.isSessionEnded = true;
                }
            };

            /*  triggers when seek  */
            this.handleSeek = function (playerEvent) {
                yupptv.eventMetaData.STPosition = playerEvent.STPosition;
                yupptv.eventMetaData.ETPosition = playerEvent.ETPosition;
                handleEvent(yupptv.eventContextKeys.VIDEO_SEEK);
            };

            /*  triggers when video buffer starts */
            this.handleBufferStart = function () {
                if (!yupptv.isBuffering) {
                    resetEventMetaData();
                    handleEvent(yupptv.eventContextKeys.BUFFER_START);
                    yupptv.isBuffering = true;
                }
            };

            /**   triggers when video buffer starts */
            this.handleBufferEnd = function () {
                if (yupptv.isBuffering) {
                    resetEventMetaData();
                    handleEvent(yupptv.eventContextKeys.BUFFER_END);
                    yupptv.isBuffering = false;
                }
            };

            /* function to handle pause event */
            this.handlePause = function () {
                if (!yupptv.isPaused) {
                    resetEventMetaData();
                    handleEvent(yupptv.eventContextKeys.VIDEO_PAUSE);
                    yupptv.isPaused = true;
                }
            };

            /* function to handle resume event */
            this.handleResume = function () {
                if (yupptv.isPaused) {
                    resetEventMetaData();
                     handleEvent(yupptv.eventContextKeys.VIDEO_RESUME);
                    yupptv.isPaused = false;
                }
            };

            /* function to playing status */
            this.handleIsPlaying = function () {
                if (!!yupptv.httpHeartBeatWorker) {
                    return true;
                }
                else {
                    return false;
                }
            };

            /* function for handling error event */
            this.handleError = function (playerEvent) {

                if (!yupptv.isSessionEnded) {
                    yupptv.eventMetaData.errorMsg = playerEvent.errorMsg;
                    handleEvent(yupptv.eventContextKeys.ERROR_MSGS);
                    stopHeartbeat();
                    yupptv.isSessionEnded = true;
                }
            };

            /* function to handle bitrate change envent */
            this.handleBitRateChange = function (playerEvent) {
                yupptv.bitRate = playerEvent.bitRate;
                handleEvent(yupptv.eventContextKeys.BITRATE_CHANGE);
            };

            this.getBrowserName = function () {
                                                

                var client = "other web browser";                
                if(window.navigator.userAgent.toLowerCase().indexOf("edge") > -1){
                    client = "edge";
                }
                else if(window.navigator.userAgent.toLowerCase().indexOf("edg") > -1){
                    client = "chromium based edge";
                }
                else if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
                    client = "opera";
                }
                else if (typeof InstallTrigger !== 'undefined') {
                    client = "firefox";
                }
                else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification)) {
                    client = "safari";
                }
                else if (/*@cc_on!@*/false || !!document.documentMode) {
                    client = "ie";
                }
                else if ((!!window.chrome && !!window.chrome.webstore) || (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor))) {
                    client = "chrome";
                }
                else if ((navigator.userAgent.match(/iphone/i) != null)) {
                    client = "iphone";
                }
                else if((navigator.userAgent.match(/ipad/i) != null)){
                    client = "ipad";
                }
                else if((navigator.userAgent.match(/ipod touch/i) != null)){
                    client = "ipod";
                }
                else if (navigator.userAgent.indexOf('534.30') > 0 && navigator.userAgent.toLowerCase().match(/android/)) {
                    client = "android";
                }
                else if (navigator.userAgent.toLowerCase().match(/android/)) {
                    client = "android";
                }

                return client;
            }

            this.getPlatForm = function () {
                var platform = navigator.platform;
                if((platform.toLowerCase().match(/iphone/i) != null) || (platform.toLowerCase().match(/ipad/i) != null) || (platform.toLowerCase().match(/ipod/i) != null)) {
                    return 'ios';
                }
                else {
                    return platform;
                }               
            }


            //************* ends here ********************//

        };

        return new VideoAnalyticsPlugin();
    });
// End of Plugin Code.
