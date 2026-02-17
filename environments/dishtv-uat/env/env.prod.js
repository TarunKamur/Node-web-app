module.exports = {
   environment: "beta",
   apiURL: '/service/api/v1/',
   appDefaultLanguage: 'ENG',
   displayLanguage : 'eng',
   analyticsId:"367d9651cc7b0588c3110ed014e7de26",
   localLangconfig: 'https://d2k02uhj7uybok.cloudfront.net/init/dishtv/passcode/localization_live.json',
   GTMId:'GTM-NHLZ4NH',
   clevertapAccountId:'TEST-768-67W-776Z',
   fbPixelId:'5837984832959632',
   fbPixelId2:'2572400143047567',
   APPS_FLYER_WEB_DEV_KEY:'',
   branch_io_key:'key_test_caJmaKgOtXssxvvESMAsygcmtBb3wWqZ',
   mydthspace:'https://dishd2hunified.watcho.com/?authToken=TTT&mobileNumber=NNN&redirectTO=Unified&deviceId=5',
   myd2hspace:'https://dishd2hunified.watcho.com/?authToken=TTT&mobileNumber=NNN&redirectTO=Unified&deviceId=5',
       //  branch.io_keys : key_test_caJmaKgOtXssxvvESMAsygcmtBb3wWqZ       live: key_live_kfRjeIpRvXzvCEEzGMp6YmpaEFn7AXvK
 /* encryption Keys  not reversing the keys here*/
   encryptionKeys: [
      {
         "5": {
            "key": "fa0dc669-e1bc-484e-9ddb-562d25400ec2",
            "iv": "82bcb56179c98ed4"
         }
      },
      {
         "61": {
            "key": "fa0dc669-e1bc-484e-9ddb-562d25400ec2",
            "iv": "82bcb56179c98ed4"
         }
      },
      {
         "6": {
            "key": "fdf0dd7343f5f92aaed4754033ef46ef",
            "iv": "1843ee6e72e67a54"
         }
      },
      {
         "7": {
            "key": "9abc75e05d69a86a7794ce8a1452ffbe",
            "iv": "a7342016be809c1a"
         }
      },
      {
         "11": {
            "key": "c37dfa1a41f501fb8d74f7649aebb327",
            "iv": "8a4ab0b4d45d7528"
         },
      },
      {
         "16": {
            "key": "b61725cd72d636bb5c14c1095ebc5b20",
            "iv": "1dea0e8788cf27f9"
         },
      },
      {
         "17": {
            "key": "e6a8d04a8103c1a9d1f479a7691a000c",
            "iv": "bdebfd1b45bfa716"
         }
      },
      {
         "18": {
            "key": "73436393038393632393737323032313",
            "iv": "83836693664366361333462363936316"
         }
      },
      {
         "40": {
            "key": "219a8d641f775eaa5ac4b9e0fa3d2b88",
            "iv": "e39630582a2ce793"
         }
      },
      {
         "43": {
            "key": "ba742a70f7e04aea47740273cf49b2bd",
            "iv": "8c7546d4b26b30e2"
         }
      },
      {
         "57": {
            "key": "25049b824791c8289c54971d48dcbbdc",
            "iv": "16bc04153831175f"
         }
      },
      {
         "55": {
            "key": "710528f8ba27f798f354e9047ffc1b7c",
            "iv": "475e8ca9e0cc5ea4"
         }
      }
   ],
   initJson: {
      // "location": "https://dishtv-uatapi2.revlet.net",
	   // "api": "https://dishtv-uatapi2.revlet.net",
	   // "search": "https://dishtv-uatsearchapi2.revlet.net",
      // "pgURL": "https://dishtv-uatpaymentapi2.revlet.net",
      // "guideURL": "https://dishtv-uatapi2.revlet.net",
      // "referralURL":"http://3.6.152.69:8088",
      // "myReco": "http://13.232.120.244",
      // "tenantCode": "dishtv",
      // "product": "dishtv",
      // "isSupported": true,
      "location": "https://dishtv-uatapi.revlet.net",
      "api": "https://dishtv-uatapi.revlet.net",
      "search": "https://dishtv-uatapi.revlet.net",
      "pgURL": "https://dishtv-uatapi.revlet.net",
      "guideURL": "https://dishtv-uatapi.revlet.net",
      "referralURL":"http://3.6.152.69:8088",
      "myReco": "http://13.232.120.244",
      "tenantCode": "dishtv",
      "product": "dishtv",
      "isSupported": true
   },
  host: 'https://www.watcho.com',
  seo: {
   enable: true,
   isAuthRequired: false,
 },
   title : 'Watcho',
   GOOGLE_CLIENTID:"", //local test:- surya google id
   FB_CLIENTID:'',  //local test id :- from narendra
   //firebase test creds
   firebaseConfig: {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      measurementId: "",
   },
   vapidKey: '',
   plansUrl: 'https://plans-offers-uat.watcho.com',
   playerScript: {
     playerSrc: "https://cdn.jwplayer.com/libraries/MAaRkUjT.js",
     playerKey: "jTL7dlu7ybUI5NZnDdVgb1laM8/Hj3ftIJ5Vqg=="
   },
   googlePalLoad:{
      palSrcSdk:'https://imasdk.googleapis.com/pal/sdkloader/pal.js',
      palLoad: true,
   }
}
