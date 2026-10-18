import { getFeatured } from '../../lib/projects';
import FeaturedCard from '../projects/FeaturedCard';
import SectionHeader from '../ui/SectionHeader';
import useReveal from '../ui/useReveal';

export default function FeaturedWork() {
  const ref = useReveal({ threshold: 0.05 });
  const featured = getFeatured();

  return (
    <section className="featured wrap" id="work" aria-labelledby="featured-title" ref={ref}>
      <SectionHeader
        id="featured-title"
        title="Featured work"
        note="Selected projects across product, design and games"
        link={{ href: '/work/', label: 'View all projects' }}
      />
      <div className="featured__grid">
        {featured.map((p, i) => (
          <FeaturedCard key={p.slug} project={p} delay={(i % 3) * 110} eager={i < 3} />
        ))}
      </div>
    </section>
  );
}
