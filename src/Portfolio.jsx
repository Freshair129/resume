import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Play, Clapperboard } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Reveal, RevealGroup, RevealItem } from './MotionPrimitives';
import { hoverLift, tapPress } from './motion-variants';

// Poster treatment per category — replaces the old black box when a platform
// gives us no thumbnail (Facebook reels), so every card still reads as a designed piece.
const CATEGORY_STYLE = {
    beauty: { gradient: 'from-rose-400 via-pink-500 to-fuchsia-700', chip: 'bg-rose-50 text-rose-700 border-rose-100' },
    auto: { gradient: 'from-amber-400 via-orange-500 to-red-600', chip: 'bg-amber-50 text-amber-700 border-amber-100' },
    graphic: { gradient: 'from-violet-400 via-purple-500 to-indigo-700', chip: 'bg-violet-50 text-violet-700 border-violet-100' },
    cinematic: { gradient: 'from-slate-600 via-slate-800 to-cyan-900', chip: 'bg-slate-100 text-slate-700 border-slate-200' },
    ai: { gradient: 'from-indigo-500 via-blue-600 to-slate-900', chip: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    default: { gradient: 'from-slate-700 via-slate-800 to-slate-900', chip: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const categoriesOf = (work) => (Array.isArray(work.category) ? work.category : work.category ? [work.category] : []);
const styleOf = (work) => CATEGORY_STYLE[categoriesOf(work)[0]] || CATEGORY_STYLE.default;

// "Client: Piece" → { client, piece } so the poster can lead with the brand name.
const splitTitle = (title) => {
    const idx = title.indexOf(':');
    if (idx === -1) return { client: null, piece: title };
    return { client: title.slice(0, idx).trim(), piece: title.slice(idx + 1).trim() };
};

const Portfolio = () => {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('all');
    // Iframes are only mounted once their card is clicked (facade pattern) —
    // keeps the page light on mobile instead of loading 15+ embeds upfront.
    const [activated, setActivated] = useState(() => new Set());

    const activate = (id) => setActivated((prev) => new Set(prev).add(id));

    // 📢 CONFIGURATION: Add your social media links here!
    // Types: 'youtube', 'tiktok', 'facebook', 'instagram'
    const socialWorks = [
        {
            id: 1,
            category: 'auto',
            type: 'facebook',
            title: "U-Turn Shop: บริการซ่อมบิ๊กไบค์ครบวงจร",
            url: "https://www.facebook.com/reel/3132594807015735",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/3132594807015735&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 2,
            category: 'auto',
            type: 'facebook',
            title: "U-Turn Shop: ผลงานซ่อมบิ๊กไบค์ (2)",
            url: "https://www.facebook.com/reel/1126825051425488",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/1126825051425488&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 3,
            category: 'auto',
            type: 'facebook',
            title: "U-Turn Shop: รายการวาไรตี้ (Variety Style)",
            url: "https://www.facebook.com/reel/2986974011532958",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/2986974011532958&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 4,
            category: 'beauty',
            type: 'facebook',
            title: "Saint Thonglor Clinic: รีวิวความงาม (Beauty & Clinic)",
            url: "https://www.facebook.com/reel/556328102800987",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/556328102800987&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 5,
            category: 'beauty',
            type: 'facebook',
            title: "Saint Thonglor Clinic: Advertising & Motion Graphic",
            url: "https://www.facebook.com/reel/424437353033861",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/424437353033861&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 6,
            category: 'beauty',
            type: 'facebook',
            title: "Saint Thonglor Clinic: สัมภาษณ์ (Interview)",
            url: "https://www.facebook.com/reel/334908915382953",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/334908915382953&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 7,
            category: 'beauty',
            type: 'facebook',
            title: "Saint Thonglor Clinic: Interview, Review & Motion Graphic",
            url: "https://www.facebook.com/reel/1161312484633412",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/1161312484633412&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 8,
            category: 'graphic',
            type: 'facebook',
            title: "HAPPY SONGKRAN DAY: Motion Graphic",
            url: "https://www.facebook.com/reel/563823075079559",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/563823075079559&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 9,
            category: 'graphic',
            type: 'facebook',
            title: "Filler Lip Review: Motion Graphic",
            url: "https://www.facebook.com/reel/244837657727946",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/244837657727946&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 10,
            category: 'beauty',
            type: 'facebook',
            title: "Saint Thonglor Clinic: Influencer Review (ชานนท์ Master Chef Thailand)",
            url: "https://www.facebook.com/reel/282073853726582",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/282073853726582&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 11,
            category: 'graphic',
            type: 'facebook',
            title: "Melasma Laser: Motion Graphic Info",
            url: "https://www.facebook.com/reel/371694187327344",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/371694187327344&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 12,
            type: 'github',
            category: 'ai', // Added category
            title: "Agentic Agent: AI Innovation Project",
            url: "https://github.com/Freshair129/agentic_agent.git",
            description: "Advanced AI Agent Architecture (EVA 9.4.0) exploring consciousness, memory systems, and autonomous task execution.",
            stats: { views: "Code", likes: "Project" }
        },
        {
            id: 13,
            type: 'youtube',
            category: 'ai', // Added category
            title: "Original Song: AI Sound Production (1)",
            url: "https://www.youtube.com/embed/rKZ0Z09fXJQ",
            stats: { views: "YouTube", likes: "Music" }
        },
        {
            id: 14,
            type: 'youtube',
            category: 'ai', // Added category
            title: "Original Song: AI Sound Production (2)",
            url: "https://www.youtube.com/embed/EndPHFnbnRQ",
            stats: { views: "YouTube", likes: "Music" }
        },
        {
            id: 15,
            type: 'youtube',
            category: 'cinematic', // Added category
            title: "Full Production: Directing, Filming & Editing",
            url: "https://www.youtube.com/embed/kGRRIG-WLAU",
            stats: { views: "YouTube", likes: "Production" }
        },
        {
            id: 16,
            type: 'facebook',
            category: ['auto', 'cinematic'],
            title: "Harley-Davidson Road Glide 2020: Cinematic Coating",
            url: "https://www.facebook.com/reel/10218575119024607",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/10218575119024607&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 17,
            category: ['auto', 'cinematic'],
            type: 'facebook',
            title: "Harley-Davidson Street Glide: Cinematic Detailing",
            url: "https://www.facebook.com/reel/10218454125839853",
            // embedUrl removed due to music copyright restrictions
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 18,
            category: ['auto', 'cinematic'],
            type: 'facebook',
            title: "Kawasaki Ninja H2: Cinematic Detailing & Coating",
            url: "https://www.facebook.com/reel/10218348629802518",
            // embedUrl removed due to music copyright restrictions
            stats: { views: "View on FB", likes: "View on FB" }
        },
        // Add more works here...
    ];

    const youtubeId = (embedUrl) => {
        const m = embedUrl.match(/embed\/([\w-]+)/);
        return m ? m[1] : null;
    };

    const filtered = socialWorks.filter((w) => {
        if (activeCategory === 'all') return true;
        if (Array.isArray(w.category)) return w.category.includes(activeCategory);
        return w.category === activeCategory;
    });

    // Designed poster used wherever the platform gives us no thumbnail.
    const Poster = ({ work, children }) => {
        const { client, piece } = splitTitle(work.title);
        const style = styleOf(work);
        const cats = categoriesOf(work);
        return (
            <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${style.gradient}`}>
                <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_80%,white,transparent_40%)]"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-left text-white">
                    <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            <Clapperboard size={12} /> {cats[0] ? t.portfolio.categories[cats[0]] : work.type}
                        </span>
                    </div>
                    <div className="pr-16">
                        {client && <p className="text-xs font-bold uppercase tracking-widest text-white/75 mb-1">{client}</p>}
                        <p className="text-xl md:text-2xl font-black leading-tight line-clamp-3 drop-shadow-sm">{piece}</p>
                    </div>
                </div>
                {children}
            </div>
        );
    };

    const renderMedia = (work) => {
        const isActivated = activated.has(work.id);
        const playable =
            (work.type === 'youtube') ||
            (work.type === 'facebook' && !!work.embedUrl);

        // GitHub project card
        if (work.type === 'github') {
            return (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group-hover:bg-slate-800 transition-colors">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white backdrop-blur-md border border-white/20">
                        <Github size={40} />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 relative z-10">AI Project</h3>
                    <p className="text-slate-400 text-xs relative z-10 px-4">{work.description}</p>
                    <a href={work.url} target="_blank" rel="noopener noreferrer" className="mt-4 bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors z-10">
                        <ExternalLink size={14} /> View Code
                    </a>
                </div>
            );
        }

        // Activated → mount the real iframe
        if (playable && isActivated) {
            const src = work.type === 'youtube'
                ? `${work.url}?autoplay=1`
                : work.embedUrl;
            return (
                <iframe
                    src={src}
                    className="w-full h-full"
                    title={work.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            );
        }

        // Facade poster (click-to-play)
        if (playable) {
            const ytId = work.type === 'youtube' ? youtubeId(work.url) : null;
            return (
                <button
                    onClick={() => activate(work.id)}
                    className="w-full h-full relative block group/poster"
                    aria-label={`Play ${work.title}`}
                >
                    {ytId ? (
                        <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={work.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <Poster work={work} />
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center transition-colors ${ytId ? 'bg-black/30 group-hover/poster:bg-black/10' : ''}`}>
                        <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover/poster:scale-110 transition-transform">
                            <Play size={26} className="text-slate-900 ml-1" fill="currentColor" />
                        </span>
                    </div>
                </button>
            );
        }

        // Facebook without an embeddable URL → open externally
        return (
            <Poster work={work}>
                <a
                    href={work.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-6 right-6 bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
                >
                    <ExternalLink size={14} /> Facebook
                </a>
            </Poster>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
                    <ArrowLeft size={20} /> {t.nav.backToHome}
                </Link>
            </div>

            {/* Colossal Title */}
            <Reveal className="max-w-6xl mx-auto mb-6">
                <h1 className="text-colossal-heading text-colossal text-slate-900 uppercase">
                    {t.portfolio.title}
                    <span className="block text-blue-600">{t.portfolio.titleHighlight}</span>
                </h1>
            </Reveal>

            {/* Intro */}
            <Reveal className="max-w-6xl mx-auto mb-12">
                <p className="text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed">
                    {t.portfolio.subtitle}
                    <span className="text-sm text-slate-500 font-medium mt-2 block">{t.portfolio.clickToView}</span>
                </p>
            </Reveal>

            {/* Category Filter */}
            <h2 className="sr-only">{t.portfolio.title} {t.portfolio.titleHighlight}</h2>
            <div className="max-w-6xl mx-auto mb-10 overflow-x-auto">
                <div className="flex gap-3 justify-start p-2 min-w-max">
                    {['all', 'graphic', 'cinematic', 'beauty', 'auto', 'ai'].map((cat) => (
                        <motion.button
                            key={cat}
                            whileTap={tapPress}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm whitespace-nowrap ${activeCategory === cat
                                ? 'bg-blue-600 text-white shadow-blue-200 shadow-md'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                                }`}
                        >
                            {t.portfolio.categories[cat]}
                        </motion.button>
                    ))}
                    <Link
                        to="/gallery"
                        className="px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm whitespace-nowrap bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:shadow-md"
                    >
                        Gallery
                    </Link>
                </div>
            </div>

            {/* Grid */}
            <RevealGroup
                key={activeCategory}
                className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filtered.map((work) => (
                    <RevealItem key={work.id}>
                        <motion.div
                            whileHover={hoverLift}
                            className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow border border-slate-100 group h-full"
                        >
                            {/* Media Container */}
                            <div className="aspect-[9/16] md:aspect-video bg-slate-900 relative block overflow-hidden">
                                {renderMedia(work)}
                                {/* Overlay Badge for Type */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-slate-900 shadow-lg pointer-events-none">
                                    {work.type}
                                </div>
                            </div>

                            {/* Content Info */}
                            <div className="p-6">
                                {splitTitle(work.title).client && (
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{splitTitle(work.title).client}</p>
                                )}
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                    {splitTitle(work.title).piece}
                                </h3>
                                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap gap-1.5">
                                        {categoriesOf(work).map((cat) => (
                                            <span key={cat} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${(CATEGORY_STYLE[cat] || CATEGORY_STYLE.default).chip}`}>
                                                {t.portfolio.categories[cat] || cat}
                                            </span>
                                        ))}
                                    </div>
                                    {work.type !== 'github' && (
                                        <a
                                            href={work.url.replace('/embed/', '/watch?v=')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                        >
                                            {t.portfolio.originalPost} <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </RevealItem>
                ))}
            </RevealGroup>

            {/* CTA */}
            <div className="max-w-6xl mx-auto mt-20 text-center bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-colossal-heading text-giant mb-6">{t.portfolio.ctaTitle}</h2>
                    <motion.div whileHover={hoverLift} whileTap={tapPress} className="inline-block">
                        <Link to="/resume" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg">
                            {t.portfolio.ctaButton}
                        </Link>
                    </motion.div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Portfolio;
