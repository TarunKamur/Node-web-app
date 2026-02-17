import Layout from "@/components/layout/layout.component";
import "@/styles/globals.scss";
import { Provider } from "@/store/store";
import { QueryClient, QueryClientProvider } from "react-query";
import PositionedNotificationbar from "@/services/notification.service";
import NextNProgress from "nextjs-progressbar";
import Script from "next/script";
import Head from "next/head";
import { appConfig } from "@/config/app.config";
import AnalyticsScriptsLoader from "@/components/analyticsScripts/analyticsScriptsLoader";

export default function App({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <>
      <NextNProgress
        stopDelayMs={0}
        options={{ showSpinner: false, minimum: 0.9 }}
        color={appConfig?.loaderColor}
      />
      <Head>
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
          name="viewport"
        />
      </Head>
      <Script
        async
        type="text/javascript"
        src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
      />
      {/* <Script async src="https://d3hprka3kr08q2.cloudfront.net/staticstorage/royalmedia/beta/VideoAnalyticsPluginV2.5.js?v=1.1"/> */}
      <Script src="/videoAnalyticsPlugin.js" />

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/mux.js/5.11.3/mux.min.js" strategy="beforeInteractive"></Script>
      
      <AnalyticsScriptsLoader/>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <PositionedNotificationbar></PositionedNotificationbar>
        </QueryClientProvider>
      </Provider>
    </>
  );
}
