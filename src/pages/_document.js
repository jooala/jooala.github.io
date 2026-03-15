import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="theme-color" content="#111111" />
        <meta name="author" content="Joonas Alanenpää" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
