// Square-ended arrow glyph. `dir`: right | left | down | up | down-right | up-right
const ROTATE = {
  right: 0,
  'down-right': 45,
  down: 90,
  left: 180,
  up: 270,
  'up-right': -45,
};

export default function Arrow({ dir = 'right', size = 16, className = '', strokeWidth = 1.75 }) {
  return (
    <svg
      className={`arrow ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ transform: `rotate(${ROTATE[dir] ?? 0}deg)` }}
    >
      <path
        d="M1.5 8H14M8.5 2.5 14 8l-5.5 5.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </svg>
  );
}
