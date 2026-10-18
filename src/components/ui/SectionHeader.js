import Link from 'next/link';
import Arrow from './Arrow';

// "■ FEATURED WORK" style section header with optional note and link.
export default function SectionHeader({ title, id, note, link, as: Tag = 'h2', className = '' }) {
  return (
    <div className={`sh ${className}`}>
      <Tag className="sh__title" id={id}>
        <span className="sh__square" aria-hidden="true" />
        {title}
      </Tag>
      {note && <p className="sh__note mono">{note}</p>}
      {link && (
        <Link href={link.href} className="sh__link mono">
          {link.label}
          <Arrow size={12} />
        </Link>
      )}
    </div>
  );
}
