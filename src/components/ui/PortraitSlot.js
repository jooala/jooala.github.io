import { PROFILE } from '../../content/profile.mjs';

// Shows PROFILE.photo when set; otherwise a clearly marked, editable slot.
export default function PortraitSlot({ className = '' }) {
  const photo = PROFILE.photo;
  if (photo) {
    return (
      <figure className={`portrait ${className}`}>
        <img src={photo.src} alt={photo.alt || PROFILE.name} loading="lazy" decoding="async" />
      </figure>
    );
  }
  return (
    <figure className={`portrait portrait--empty ${className}`}>
      <span className="portrait__cross" aria-hidden="true" />
      <figcaption className="mono">
        Portrait
        <br />
        <span>to add: set PROFILE.photo</span>
      </figcaption>
    </figure>
  );
}
