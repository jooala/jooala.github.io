import Link from 'next/link';

// Renders the tiny inline markup used in content files: **bold** and [text](url).
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function inline(text) {
  if (!text) return null;
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) {
        return <Link key={i} href={href} className="text-link">{label}</Link>;
      }
      return (
        <a key={i} href={href} className="text-link" target="_blank" rel="noopener noreferrer">
          {label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    return part;
  });
}

export default function RichText({ paragraphs = [], className }) {
  return paragraphs.map((p, i) => (
    <p key={i} className={className}>
      {inline(p)}
    </p>
  ));
}
