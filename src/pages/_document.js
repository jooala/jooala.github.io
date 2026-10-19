import { Html, Head, Main, NextScript } from 'next/document';

// `js` gates reveal animations. `fonts` is added once the display face has
// loaded (or after 1.5s), so the hero name never animates in the fallback font.
// `preload` holds the home page behind a loader while the 3D hero builds, on
// screens that will run it (wide, WebGL, not ?poster). Hero.js calls
// window.__heroDone() once the first 3D frame is drawn.
const JS_FLAGS = `(function(d){d.classList.add('js');var done=function(){d.classList.add('fonts')};
try{var l=window.location,c=document.createElement('canvas'),h=history;
// Home page: a refresh always starts at the top (no restored scroll, no #work jump)
if(l.pathname==='/'){var nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
if('scrollRestoration' in h)h.scrollRestoration='manual';if(nav&&nav.type==='reload'&&l.hash)h.replaceState(h.state,'',l.pathname+l.search);window.scrollTo(0,0);
window.addEventListener('load',function(){setTimeout(function(){if(!d.classList.contains('preload')&&'scrollRestoration' in h)h.scrollRestoration='auto'},0)})}
if(l.pathname==='/'&&!/[?&]poster/.test(l.search)&&window.matchMedia('(min-width: 1000px)').matches&&(c.getContext('webgl2')||c.getContext('webgl'))){d.classList.add('preload','hero-preloaded')}}catch(e){}
if(!document.fonts||!document.fonts.load){done();return}
Promise.race([document.fonts.load('400 1em Anton'),new Promise(function(r){setTimeout(r,1500)})]).then(done,done)})(document.documentElement)`;

// Loader. Deliberately plain while the 3D builds (the page is busy, so
// anything elaborate would stutter): a counter over a progress ring. The
// ring also spins in CSS, which keeps moving even when the script can't.
// Progress follows the clock (so it catches up after a busy moment) toward
// 92 %, and completes when the hero is ready (or after 10 s, whatever
// happens). Then it waits for a quiet moment, fades out and lets the hero
// intro play in full (hero.css).
const LOADER = `(function(d){if(!d.classList.contains('preload'))return;
var count=document.getElementById('preloader-count'),arc=document.getElementById('preloader-arc'),note=document.getElementById('preloader-note');
var notes=['Pouring concrete','Raising the tower','Parking the car','Opening the circuit'];
var t0=performance.now(),doneAt=0,from=0,p=0;
function frame(){var now=performance.now();
if(!doneAt)p=0.92*(1-Math.exp(-(now-t0)/2200));else{var k=Math.min(1,(now-doneAt)/350);p=from+(1-from)*k*(2-k)}
var v=Math.round(p*100);count.textContent=(v<10?'00':v<100?'0':'')+v;arc.style.strokeDashoffset=(100-p*100).toFixed(2);
note.firstChild.textContent=notes[Math.min(notes.length-1,Math.floor(p*notes.length))];
if(doneAt&&p>=0.999){count.textContent='100';setTimeout(idleReveal,Math.max(200,t0+900-now));return}
requestAnimationFrame(frame)}
function idleReveal(){if(window.requestIdleCallback)requestIdleCallback(reveal,{timeout:600});else reveal()}
function reveal(){if('scrollRestoration' in history)history.scrollRestoration='auto';d.classList.add('preload-out');
setTimeout(function(){d.classList.remove('preload')},180);
setTimeout(function(){d.classList.remove('preload-out')},700)}
window.__heroDone=function(){if(doneAt)return;doneAt=performance.now();from=p};
setTimeout(window.__heroDone,10000);requestAnimationFrame(frame)})(document.documentElement)`;

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
        <script dangerouslySetInnerHTML={{ __html: JS_FLAGS }} />
      </Head>
      <body>
        <div className="preloader" aria-hidden="true">
          <div className="preloader__center">
            <div className="preloader__dial">
              <svg className="preloader__ring" viewBox="0 0 120 120">
                <circle className="preloader__track" cx="60" cy="60" r="55" />
                <circle id="preloader-arc" className="preloader__arc" cx="60" cy="60" r="55" pathLength="100" />
              </svg>
              <p className="preloader__count display">
                <span id="preloader-count">000</span>
              </p>
            </div>
            <p id="preloader-note" className="preloader__note mono">
              <span>Pouring concrete</span>
            </p>
          </div>
        </div>
        <Main />
        <script dangerouslySetInnerHTML={{ __html: LOADER }} />
        <NextScript />
      </body>
    </Html>
  );
}
