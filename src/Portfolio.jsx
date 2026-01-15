import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Eye, MessageCircle, Share2, Play, Github, Code, Camera, X, ZoomIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const Portfolio = () => {
    const { t } = useLanguage();
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
            type: 'facebook',
            title: "Creative Motion Graphic",
            url: "https://www.facebook.com/reel/563823075079559",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/563823075079559&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 9,
            type: 'facebook',
            title: "Creative Motion Graphic (2)",
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
            type: 'facebook',
            title: "Creative Motion Graphic (3)",
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
            category: 'auto', // Added category
            title: "Harley-Davidson Road Glide 2020: Cinematic Coating",
            url: "https://www.facebook.com/reel/10218575119024607",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/10218575119024607&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 17,
            category: 'auto',
            type: 'facebook',
            title: "Harley-Davidson Street Glide: Cinematic Detailing",
            url: "https://www.facebook.com/reel/10218454125839853",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/10218454125839853&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        {
            id: 18,
            category: 'auto',
            type: 'facebook',
            title: "Kawasaki Ninja H2: Cinematic Detailing & Coating",
            url: "https://www.facebook.com/reel/10218348629802518",
            embedUrl: "https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/10218348629802518&show_text=false&t=0",
            stats: { views: "View on FB", likes: "View on FB" }
        },
        // Add more works here...
    ];

    const [galleryImages, setGalleryImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const loadImages = async () => {
            const modules = import.meta.glob('./assets/gallery/*.jpg', { eager: true });
            const images = Object.values(modules).map((mod) => mod.default);
            setGalleryImages(images);
        };
        loadImages();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
                    <ArrowLeft size={20} /> {t.nav.backToHome}
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight text-right md:text-left uppercase">
                    {t.portfolio.title} <span className="text-blue-600">{t.portfolio.titleHighlight}</span>
                </h1>
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
                    {['all', 'cinematic', 'beauty', 'auto', 'ai'].map((cat) => (
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
                {socialWorks.filter(w => activeCategory === 'all' || w.category === activeCategory).map((work) => (
                    <div key={work.id} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-100 group">
                        {/* Media Container */}
                        <div className="aspect-[9/16] md:aspect-video bg-slate-900 relative block overflow-hidden">
                            {(work.type === 'youtube' || work.type === 'facebook') ? (
                                <iframe
                                    src={work.embedUrl || work.url}
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

            {/* Gallery Section */}
            <div id="gallery" className="max-w-7xl mx-auto mt-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center justify-center gap-3 uppercase">
                        <Camera size={40} className="text-blue-600" />
                        {t.portfolio.galleryTitle} <span className="text-slate-300">{t.portfolio.galleryTitleHighlight}</span>
                    </h2>
                    <p className="text-slate-500 mt-4 text-lg">{t.portfolio.galleryDesc}</p>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 px-4">
                    {galleryImages.map((src, idx) => (
                        <div key={idx} className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300" onClick={() => setSelectedImage(src)}>
                            <img src={src} alt={`Gallery ${idx}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                <ZoomIn className="text-white drop-shadow-md transform scale-50 group-hover:scale-100 transition-transform duration-300" size={32} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                        alt="Full View"
                    />
                </div>
            )}

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
