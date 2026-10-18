import { useEffect, useState } from 'react';
import { PROFILE } from '../../content/profile.mjs';

const format = (date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PROFILE.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('hour')}:${get('minute')}:${get('second')} ${get('timeZoneName')}`;
};

// Live Helsinki clock. Renders a stable placeholder on the server to avoid
// hydration mismatches, then ticks once per second on the client.
export default function LocalTime({ className = '' }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(format(new Date()));
    const id = setInterval(() => setNow(format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className={className} aria-label="Local time in Helsinki" suppressHydrationWarning>
      {now ?? '--:--:-- '}
    </time>
  );
}
