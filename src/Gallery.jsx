import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, ZoomIn, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Reveal } from './MotionPrimitives';
import { revealViewport } from './motion-variants';

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
                <Reveal className="text-center mb-12">
                    <h1 className="text-colossal-heading text-colossal text-slate-900 flex flex-wrap items-center justify-center gap-3 uppercase">
                        <Camera size={48} className="text-blue-600" />
                        {t.portfolio.galleryTitle} <span className="text-slate-300">{t.portfolio.galleryTitleHighlight}</span>
                    </h1>
                    <p className="text-slate-500 mt-4 text-lg">{t.portfolio.galleryDesc}</p>
                </Reveal>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 px-4">
                    {galleryImages.map((src, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.94 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={revealViewport}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                            onClick={() => setSelectedImage(src)}
                        >
                            <img src={src} alt={`Gallery ${idx}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                <ZoomIn className="text-white drop-shadow-md transform scale-50 group-hover:scale-100 transition-transform duration-300" size={32} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                            <X size={32} />
                        </button>
                        <motion.img
                            src={selectedImage}
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            alt="Full View"
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
