import { useState } from 'react';

// Click-to-load YouTube embed: shows the thumbnail until the visitor presses
// play, so case studies don't load several heavy iframes up front.
export default function VideoEmbed({ id, title }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);

  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className="video__facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
          <img
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
          />
          <span className="video__play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M6 3.5v15l13-7.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="video__label mono">Play video</span>
        </button>
      )}
    </div>
  );
}
