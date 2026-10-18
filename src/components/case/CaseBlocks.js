import RichText, { inline } from '../ui/RichText';
import useReveal from '../ui/useReveal';
import VideoEmbed from './VideoEmbed';

// Renders the `sections` array of a project (see src/content/projects.mjs).
// Each block type maps to an editorial layout; labelled blocks are numbered.

function SectionLabel({ n, label }) {
  if (!label) return <div className="cb__label" />;
  return (
    <div className="cb__label">
      <p className="mono">
        <span>[{String(n).padStart(2, '0')}]</span> {label}
      </p>
    </div>
  );
}

function Figure({ src, alt, caption, fig, bg, gray, width, height }) {
  return (
    <figure className={`cfig ${bg ? `cfig--${bg}` : ''}`}>
      <div className="cfig__frame">
        <img src={src} alt={alt || ''} width={width} height={height} loading="lazy" decoding="async" className={gray ? 'pv--gray' : ''} />
      </div>
      {(caption || fig) && (
        <figcaption className="mono">
          <span>Fig. {String(fig).padStart(2, '0')}</span>
          {caption && <span>{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function Block({ block, n, fig }) {
  switch (block.type) {
    case 'text':
      return (
        <section className="cb cb--text">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main">
            {block.heading && <h2 className="cb__heading title">{block.heading}</h2>}
            <RichText paragraphs={block.body} className={block.lead ? 'cb__lead serif' : 'cb__p'} />
          </div>
        </section>
      );

    case 'list':
      return (
        <section className="cb cb--list">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main">
            {block.heading && <h2 className="cb__heading title">{block.heading}</h2>}
            {block.intro && <p className="cb__p">{inline(block.intro)}</p>}
            <ol className="clist">
              {block.items.map((item, i) => (
                <li key={item.title} className={item.body ? '' : 'clist__item--short'}>
                  <span className="clist__n mono">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="clist__title title">{item.title}</h3>
                  {item.body && <p className="clist__body">{inline(item.body)}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      );

    case 'cards':
      return (
        <section className="cb cb--cards">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main cb__main--wide">
            {block.heading && <h2 className="cb__heading title">{block.heading}</h2>}
            <ol className="ccards">
              {block.items.map((item, i) => (
                <li key={item.title} className={`ccard ${item.highlight ? 'ccard--hl' : ''}`}>
                  <span className="ccard__n display">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="ccard__title title">{item.title}</h3>
                  <p>{inline(item.body)}</p>
                  {item.highlight && <span className="ccard__tag mono">Chosen direction</span>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      );

    case 'quote':
      return (
        <section className="cb cb--quote">
          <SectionLabel />
          <blockquote className="cquote">
            <p className="serif">{inline(block.text)}</p>
            {block.cite && <footer className="mono">{block.cite}</footer>}
          </blockquote>
        </section>
      );

    case 'stats':
      return (
        <section className="cb cb--stats">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main">
            {block.intro && <p className="cb__p">{inline(block.intro)}</p>}
            <dl className="cstats">
              {block.items.map((s) => (
                <div key={s.label}>
                  <dt className="mono">{s.label}</dt>
                  <dd className="display">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

    case 'image':
      return (
        <div className={`cb cb--media cb--${block.size || 'wide'}`}>
          <Figure {...block} fig={fig} gray={block.grayscale} />
        </div>
      );

    case 'gallery':
      return (
        <div className={`cb cb--media cb--wide cgallery cgallery--${block.columns || 2} ${block.bg ? `cgallery--${block.bg}` : ''}`}>
          {block.items.map((item, i) => (
            <Figure key={item.src} {...item} bg={block.bg} fig={fig + i} />
          ))}
        </div>
      );

    case 'video':
      return (
        <section className="cb cb--video">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main cb__main--wide">
            <VideoEmbed id={block.youtube} title={block.title} />
            {block.caption && <p className="cb__caption mono">{block.caption}</p>}
          </div>
        </section>
      );

    case 'videos':
      return (
        <section className="cb cb--videos">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main cb__main--wide">
            {block.intro && <p className="cb__p">{inline(block.intro)}</p>}
            <div className="cvideos">
              {block.items.map((v) => (
                <div key={v.youtube}>
                  <VideoEmbed id={v.youtube} title={v.title} />
                  <p className="cb__caption mono">{v.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'split':
      return (
        <section className="cb cb--split">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main cb__main--wide csplit">
            <div>
              {block.heading && <h2 className="cb__heading title">{block.heading}</h2>}
              <RichText paragraphs={block.body} className="cb__p" />
            </div>
            <div className="csplit__media">
              <img src={block.image.src} alt={block.image.alt} width={block.image.width} height={block.image.height} loading="lazy" decoding="async" />
            </div>
          </div>
        </section>
      );

    case 'placeholder':
      return (
        <section className="cb cb--placeholder">
          <SectionLabel n={n} label={block.label} />
          <div className="cb__main">
            <div className="cplaceholder">
              <p className="mono cplaceholder__tag">To add</p>
              <p>{block.note}</p>
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
}

export default function CaseBlocks({ sections = [] }) {
  const ref = useReveal({ threshold: 0.01 });
  let n = 0;
  let fig = 0;
  return (
    <div className="case-body wrap" ref={ref}>
      {sections.map((block, i) => {
        if (block.label && block.type !== 'quote') n += 1;
        const figStart = fig + 1;
        if (block.type === 'image') fig += 1;
        if (block.type === 'gallery') fig += block.items.length;
        return (
          <div key={i} className="reveal">
            <Block block={block} n={n} fig={figStart} />
          </div>
        );
      })}
    </div>
  );
}
