import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#ebe8e1" />
        <meta name="author" content="Joonas Alanenpää" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,400&display=swap"
        />
        {/* Enables reveal animations only when JS runs; content is visible without it */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
