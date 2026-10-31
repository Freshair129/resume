import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, ZoomIn, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Reveal } from './MotionPrimitives';
import { revealViewport } from './motion-variants';

const galleryImages = Object.values(import.meta.glob('./assets/gallery/*.jpg', { eager: true })).map(mod => mod.default);

const GalleryLightbox = ({ src, onClose }) => {
    const dialogRef = useRef(null);
    const { language } = useLanguage();
    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        dialog.showModal();
        return () => { dialog.close(); queueMicrotask(() => { if (previousFocus?.isConnected) previousFocus.focus(); }); };
    }, []);
    return <dialog ref={dialogRef} aria-label={language === 'th' ? 'ภาพขยาย' : 'Enlarged photograph'}
        className="fixed inset-0 m-0 w-screen h-screen max-w-none max-h-none bg-black/95 p-4 border-0 open:flex items-center justify-center"
        onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialogRef.current) onClose(); }}>
        <button onClick={onClose} aria-label={language === 'th' ? 'ปิดภาพขยาย' : 'Close photograph'} className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20"><X size={28} /></button>
        <motion.img src={src} alt={language === 'th' ? 'ภาพจากแกลเลอรีในขนาดเต็ม' : 'Full-size photograph from the gallery'} className="max-w-full max-h-[85dvh] rounded-lg shadow-2xl" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} />
    </dialog>;
};

const Gallery = () => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
                    <ArrowLeft size={20} /> {t.nav.backToHome}
                </Link>
                <div className="flex gap-4">
                    <Link to="/media" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md">
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
                        <motion.button
                            key={idx}
                            aria-label={`Open photograph ${idx + 1}`}
                            initial={{ opacity: 0, scale: 0.94 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={revealViewport}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                            onClick={() => setSelectedImage(src)}
                        >
                            <img src={src} alt={`Gallery ${idx}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                <ZoomIn className="text-white drop-shadow-md transform scale-50 group-hover:scale-100 transition-transform duration-300" size={32} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <GalleryLightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
