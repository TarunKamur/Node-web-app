import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const playerScrit = process.env?.playerScript;
  const googlePalLoad = process.env?.googlePalLoad;
  return (
    <Html lang="en" className="notranslate" translate="no">
      <Head>
        <meta name="google" content="notranslate" />
        {!!playerScrit && (
          <>
            <script
              async
              src={`${playerScrit?.playerSrc}`}
              onLoad={() => {
                jwplayer.key = `${playerScrit?.playerKey}`;
              }}
            />
          </>
        )}
         {!!googlePalLoad?.palLoad && (
          <>
            <script
              async
              src={`${googlePalLoad?.palSrcSdk}`}
              onLoad={() => {
              }}
            />
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
