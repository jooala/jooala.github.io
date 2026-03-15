import Link from 'next/link';
import Header from '../Header';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { trackPageTime } from '../../utils/googleAnalytics';
import FooterCTA from '../../components/FooterCTA';

/**
 * Shared layout for all project case-study pages.
 *
 * Props:
 *   pageTitle    – <title> tag value
 *   category     – e.g. "UX Design" shown as an accent tag
 *   title        – project title (h1)
 *   meta         – array of { label, value } objects for the meta strip
 *   tools        – array of tool/tech strings, rendered as chips
 *   children     – project-specific content sections
 */
export default function ProjectLayout({
    pageTitle,
    description = '',
    category,
    title,
    meta = [],
    tools = [],
    coverImage = '/og-cover.svg',
    noIndex = false,
    children,
}) {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://jooala.github.io/';
    useEffect(() => {
        const stopTracking = trackPageTime();
        return () => { stopTracking(); };
    }, []);

    return (
        <div>
            <Head>
                <title>{pageTitle}</title>
                {noIndex && <meta name="robots" content="noindex, nofollow" />}
                {description && <meta name="description" content={description} />}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="canonical" href={pageUrl} />
                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={pageTitle} />
                {description && <meta property="og:description" content={description} />}
                <meta property="og:image" content={`https://jooala.github.io${coverImage}`} />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                {description && <meta name="twitter:description" content={description} />}
                <meta name="twitter:image" content={`https://jooala.github.io${coverImage}`} />
            </Head>

            <section className="min-h-screen relative bg-[#111111]">

                {/* Header */}
                <div className="w-full bg-opacity-50 absolute top-0 z-20">
                    <Header />
                </div>

                {/* Hero — contained */}
                <div id="main" className="container mx-auto px-4 relative z-10">
                    <div className="pt-24 flex flex-col">

                        {/* Back button */}
                        <div className="mt-20 mb-8">
                            <Link href="/" className="back-btn">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                                <span>Back to Projects</span>
                            </Link>
                        </div>

                        {/* Hero bar */}
                        <div className="pb-12 border-b border-[#333333] mb-12">
                            {category ? (
                                <span className="inline-block text-sm font-bold font-mono tracking-widest mb-6 text-[#ccff00]">
                                    [ {category} ]
                                </span>
                            ) : null}
                            <h1 className="text-5xl md:text-8xl text-[#EAEAEA] font-bold font-oswald uppercase leading-[0.9] tracking-tight">
                                {title}
                            </h1>
                        </div>

                        {/* Meta & Tools grouped */}
                        <div className="flex flex-col md:flex-row gap-12 mb-20 font-mono text-sm">
                            {meta.length > 0 ? (
                                <div className="flex gap-8">
                                    {meta.map(({ label, value }) => (
                                        <div key={label} className="flex flex-col gap-2">
                                            <span className="text-[#666666] uppercase">{label}</span>
                                            <span className="text-[#EAEAEA]">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {tools.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[#666666] uppercase">Tech &amp; Tools</span>
                                    <div className="flex flex-wrap gap-2 text-[#EAEAEA]">
                                        {tools.map((tool) => (
                                            <span key={tool}>[{tool}]</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                    </div>
                </div>

                {/* Project-specific content — full-bleed capable */}
                <div className="text-[#EAEAEA] text-lg leading-relaxed">
                    {children}
                </div>

                <FooterCTA />

            </section>
        </div>
    );
}
