import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, ZoomIn, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const Gallery = () => {
    const { t } = useLanguage();
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
            <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
                    <ArrowLeft size={20} /> {t.nav.backToHome}
                </Link>
                <div className="flex gap-4">
                    <Link to="/portfolio" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
                        {t.nav.backToPortfolio}
                    </Link>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="max-w-7xl mx-auto mt-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center justify-center gap-3 uppercase">
                        <Camera size={40} className="text-blue-600" />
                        {t.portfolio.galleryTitle} <span className="text-slate-300">{t.portfolio.galleryTitleHighlight}</span>
                    </h1>
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
        </div>
    );
};

export default Gallery;
