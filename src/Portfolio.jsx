import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Eye, Github } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const Portfolio = () => {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('all');

    // 📢 CONFIGURATION: Add your social media links here!
    // Types: 'youtube', 'tiktok', 'facebook', 'instagram'
    const socialWorks = [
        {
            id: 1,
            type: 'facebook',
            title: "U-Turn Shop: บริการซ่อมบิ๊กไบค์ครบวงจร",
            url: "https://www.facebook.com/reel/3132594807015735",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/3132594807015735&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 2,
            type: 'facebook',
            title: "U-Turn Shop: ผลงานซ่อมบิ๊กไบค์ (2)",
            url: "https://www.facebook.com/reel/1126825051425488",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/1126825051425488&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 3,
            type: 'facebook',
            title: "U-Turn Shop: รายการวาไรตี้ (Variety Style)",
            url: "https://www.facebook.com/reel/2986974011532958",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/2986974011532958&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 4,
            type: 'facebook',
            title: "Saint Thonglor Clinic: รีวิวความงาม (Beauty & Clinic)",
            url: "https://www.facebook.com/reel/556328102800987",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/556328102800987&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 5,
            type: 'facebook',
            title: "Saint Thonglor Clinic: Advertising & Motion Graphic",
            url: "https://www.facebook.com/reel/424437353033861",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/424437353033861&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 6,
            type: 'facebook',
            title: "Saint Thonglor Clinic: สัมภาษณ์ (Interview)",
            url: "https://www.facebook.com/reel/334908915382953",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/334908915382953&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 7,
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

    // Gallery logic removed

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10 flex flex-wrap justify-between items-center gap-4">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
                    <ArrowLeft size={20} /> {t.nav.backToHome}
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center md:text-left uppercase flex-1">
                    {t.portfolio.title} <span className="text-blue-600">{t.portfolio.titleHighlight}</span>
                </h1>
                <Link to="/gallery" className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-bold transition-colors px-5 py-3 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    {t.nav.gallery}
                </Link>
            </div>

            {/* Intro */}
            <div className="max-w-6xl mx-auto mb-12 text-center">
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    {t.portfolio.subtitle}
                    <br />
                    <span className="text-sm text-slate-400 font-medium mt-2 block">{t.portfolio.clickToView}</span>
                </p>
            </div>

            {/* Category Filter */}
            <div className="max-w-6xl mx-auto mb-10 overflow-x-auto">
                <div className="flex gap-3 justify-start md:justify-center p-2 min-w-max">
                    {['all', 'graphic', 'cinematic', 'beauty', 'auto', 'ai'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm whitespace-nowrap ${activeCategory === cat
                                ? 'bg-blue-600 text-white shadow-blue-200 shadow-md transform -translate-y-0.5'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                                }`}
                        >
                            {t.portfolio.categories[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {socialWorks.filter(w => {
                    if (activeCategory === 'all') return true;
                    if (Array.isArray(w.category)) return w.category.includes(activeCategory);
                    return w.category === activeCategory;
                }).map((work) => (
                    <div key={work.id} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-100 group">
                        {/* Media Container */}
                        <div className="aspect-[9/16] md:aspect-video bg-slate-900 relative block overflow-hidden">
                            {((work.type === 'youtube' || work.type === 'facebook') && work.embedUrl) ? (
                                <iframe
                                    src={work.embedUrl}
                                    className="w-full h-full object-cover"
                                    title={work.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            ) : work.type === 'github' ? (
                                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group-hover:bg-slate-800 transition-colors">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white backdrop-blur-md border border-white/20">
                                        <Github size={40} />
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2 relative z-10">AI Project</h4>
                                    <p className="text-slate-400 text-xs relative z-10 px-4">
                                        {work.description}
                                    </p>
                                    <a href={work.url} target="_blank" rel="noopener noreferrer" className="mt-4 bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors z-10">
                                        <ExternalLink size={14} /> View Code
                                    </a>
                                </div>
                            ) : (
                                /* Placeholder for other types usually needing specific embed scripts */
                                <div className="w-full h-full flex items-center justify-center flex-col gap-4 p-8 text-center bg-slate-100">
                                    <p className="font-bold text-slate-400">Preview not available in offline mode</p>
                                    <a href={work.url} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                                        <ExternalLink size={16} /> Open in {work.type}
                                    </a>
                                </div>
                            )}

                            {/* Overlay Badge for Type */}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-slate-900 shadow-lg">
                                {work.type}
                            </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {work.title}
                            </h3>

                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                                    <Eye size={16} className="text-blue-500" /> {work.stats.views}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                                    <Heart size={16} className="text-pink-500" /> {work.stats.likes}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="max-w-6xl mx-auto mt-20 text-center bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black mb-6">{t.portfolio.ctaTitle}</h2>
                    <Link to="/resume" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        {t.portfolio.ctaButton}
                    </Link>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Portfolio;
