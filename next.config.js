/** @type {import('next').NextConfig} */

const path = require('path');
const enFile= require('./env/env.prod');

const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],   
  },
  env: enFile,
  // images: {
  //   domains: ['d229kpbsb5jevy.cloudfront.net', 'd2ivesio5kogrp.cloudfront.net', 'slike-tnn.akamaized.net'],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/auth/signin',
        destination: '/signin',
        permanent: true,
      },
      {
        source: '/auth/signup',
        destination: '/signup',
        permanent: true,
      },
      {
        source: '/auth/forgot-password',
        destination: '/forgot-password',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/support/about-us',
        permanent: true,
      },
      {
        source: '/terms-use',
        destination: '/support/terms',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/support/privacy-policy',
        permanent: true,
      },
      {
        source: '/content-guidelines',
        destination: '/support/content-guidelines',
        permanent: true,
      },
      {
        source: '/grievance',
        destination: '/support/grievance',
        permanent: true,
      },
      {
        source: '/cookies',
        destination: '/support/cookie-policy',
        permanent: true,
      },
      {
        source: '/live_tv',
        destination: '/live-tv',
        permanent: true,
      },
      {
        source: '/OTTPlans',
        destination: '/plans/list',
        permanent: true,
      },
      {
        source: '/premium',
        destination: '/partner/watcho',
        permanent: true,
      },
      {
        source: '/OTTPlans/update-details',
        destination: '/plans/list',
        permanent: true,
      },
     
      {
        source: '/watch/webEpisode/details/episode-1--wajah/1388925',
        destination: '/tvshow/play/vmlo7rd',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1---lips-don-t lie/1367674',
        destination: '/tvshow/play/vwdvvbk',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1--jaunpur/1250213',
        destination: '/tvshow/play/v2qglqf',
        permanent: true,
      },
      {
        source: '/watch/webSeries/details/undercover-season-1/1376426',
        destination: '/tvshow/play/vt8eh0b',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1--cheaters/1172226',
        destination: '/tvshow/play/vl7qo8i',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1---virgin-at-27--hindi /1118457',
        destination: '/tvshow/play/vxaxa2m',
        permanent: true,
      },
      {
        source: '/watch/spotlightEpisode/details/episode-1---badel sharma/1273118',
        destination: '/tvshow/play/vikhuh6',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2---the mortuary/915987',
        destination: '/tvshow/play/vcmqdox',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2--jaunpur/1250214',
        destination: '/tvshow/play/vtf98sz',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2--wajah/1388934',
        destination: '/tvshow/play/vxovqpc',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2--cheaters/1172227',
        destination: '/tvshow/play/vfvaeal',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2--aarop/1401803',
        destination: '/tvshow/play/vfo81ic',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1---masala family/707311',
        destination: '/tvshow/play/vf7qhce',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1--explosive/1445176',
        destination: '/tvshow/play/vzjruje',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-3--jaunpur/1250216',
        destination: '/tvshow/play/vjz4bbw',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1---the lieutenant/1381538',
        destination: '/tvshow/play/ve4hzc8',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2---lips-don-t lie/1367691',
        destination: '/tvshow/play/vup0rct',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1--ekaterina/1381613',
        destination: '/tvshow/play/vc7qzow',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-2---virgin-at-27--hindi /1118449',
        destination: '/tvshow/play/vywdnke',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-9---virgin-at-27--hindi /1118450',
        destination: '/tvshow/play/vvwh3y0',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-1---undercover-season 1/1375768',
        destination: '/tvshow/play/vt8eh0b',
        permanent: true,
      },
      {
        source: '/watch/webSeries/details/sweet-revenge---season 2/1406289',
        destination: '/tvshow/play/vhfyujh',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode-4---virgin-at-27--hindi /1118459',
        destination: '/tvshow/play/vwu3qfp',
        permanent: true,
      },
      {
        source: '/watch/webEpisode/details/episode 1-bauchaar-e-ishq/1297736',
        destination: '/tvshow/play/vvewzel',
        permanent: true,
      },
      {
        source: '/watch/webSeries/details/:wname/:wcode',
        destination: '/tvshow/:wname',
        permanent: true,
      },
      {
        source: '/watch/channel/:wname/:wcode',
        destination: '/channel/live/:wname',
        permanent: true,
      },

      
      
    ]
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
  esmExternals: true,
}
 
};

module.exports = nextConfig
