import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Download, ExternalLink, Brain, Cpu, Code, Star, Briefcase, FileText, GraduationCap, CheckCircle2, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import React from 'react';
import profileImage from './assets/profile.jpg';
import { resumeVariants, allExperiences } from './data/resumeVariants';
import { RevealGroup, RevealItem } from './MotionPrimitives';
import { tapPress } from './motion-variants';

const Resume = () => {
    const { t, language } = useLanguage();
    const { variantSlug } = useParams();
    const variant = resumeVariants[variantSlug] || resumeVariants.default;

    // Build experience list from variant config
    const resolveExperience = (key) => {
        const entry = allExperiences[key];
        if (!entry) return null;
        if (entry.useTranslation) {
            const tr = t.resume.experience[entry.translationKey];
            if (!tr) return null;
            const responsibilities = [];
            for (let i = 1; i <= 10; i++) {
                if (tr[`responsibility${i}`]) responsibilities.push(tr[`responsibility${i}`]);
            }
            return { key, title: tr.title, company: tr.company, period: tr.period, responsibilities };
        }
        return { key, title: entry.title, company: entry.company, period: entry.period, responsibilities: [...entry.responsibilities] };
    };

    const experiences = variant.experienceOrder
        .map(resolveExperience)
        .filter(Boolean);

    // Resume data structure aligned with Portfolio.jsx structure for consistency if needed,
    // but here we primarily use the translation object for static text.

    const hardSkills = ["Photoshop", "Premiere Pro", "After Effects", "Illustrator", "CapCut", "Canva", "Tiktok", "Reels", "Shorts"];
    const aiSkills = [
        "VS Code", "Antigravity", "Claude Code", "Gemini CLI", "Ollama", "LM Studio", "AnythingLLM",
        "ChatGPT", "Gemini", "Maus", "Claude", "Poe",
        "Prompt Engineering", "Context Engineering", "Agentic RAG"
    ];
    const coreCompetencies = ["Video Editor", "Creative", "Photography", "Motion Graphic", "Song Writer", "Coding", "English (Read/Write/Speak)"];
    const softSkills = ["Communication", "Teamwork", "Crisis Solving", "Growth Mindset", "Management", "Adaptability", "Work Smart"];

    return (
        <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8 font-sans text-[#1e293b]">
            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
                <div className="flex gap-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#475569] hover:text-[#2563eb] font-bold transition-colors bg-[#ffffff] px-4 py-2 rounded-xl shadow-sm border border-[#f1f5f9]">
                        <ArrowLeft size={18} /> {t.nav.home}
                    </Link>
                    <Link to="/portfolio" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        <Briefcase size={18} /> {t.nav.portfolio}
                    </Link>
                </div>
                <div className="text-xl font-black tracking-tighter text-[#2563eb] hidden sm:block">PORNPON.T</div>
            </div>
            <motion.div
                className="max-w-5xl mx-auto bg-[#ffffff] shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >

                {/* Left Column / Sidebar */}
                <div className="md:w-1/3 bg-[#0f172a] text-[#ffffff] p-8">
                    <div className="text-center mb-8">
                        <div className="w-40 h-40 mx-auto mb-4 border-4 border-[#3b82f6] rounded-2xl overflow-hidden shadow-lg bg-[#1e293b] flex items-center justify-center">
                            {/* Profile Image with Fallback */}
                            <img
                                src={profileImage}
                                alt={t.resume.profileAlt}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150?text=Profile";
                                }}
                            />
                        </div>
                        <h1 className="text-colossal-heading text-3xl text-[#ffffff]">{t.resume.name}</h1>
                        <p className="text-[#60a5fa] font-medium mt-1 uppercase text-sm tracking-wider">
                            {variant.titleOverride ? variant.titleOverride[language] || variant.titleOverride.en : t.resume.title}
                        </p>
                    </div>

                    {/* Tailored-for badge */}
                    {variant.label && (
                        <div className="flex items-center justify-center gap-2 mb-4 bg-[#1e3a5f] text-[#93c5fd] px-4 py-2 rounded-xl text-xs font-bold">
                            <Target size={14} />
                            <span>Tailored for {variant.roleName || variant.label}</span>
                        </div>
                    )}

                    {/* Download Buttons */}
                    <div className="flex flex-col gap-3 mb-8">
                        <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1">
                            <Download size={12} /> {t.resume.downloadResume}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <motion.a
                                whileHover={{ y: -2 }}
                                whileTap={tapPress}
                                href={variant.downloadFile}
                                download={variant.downloadFile.startsWith('http') ? undefined : true}
                                target={variant.downloadFile.startsWith('http') ? "_blank" : undefined}
                                rel={variant.downloadFile.startsWith('http') ? "noopener noreferrer" : undefined}
                                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-[#ffffff] px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#1e3a8a80] cursor-pointer"
                            >
                                <FileText size={16} /> {variant.downloadFile.includes('export?format=pdf') ? 'Download PDF' : 'DOCX'}
                            </motion.a>
                            {variant.viewFile && (
                                <motion.a
                                    whileHover={{ y: -2 }}
                                    whileTap={tapPress}
                                    href={variant.viewFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#ffffff] px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#0f172a80] cursor-pointer"
                                >
                                    <ExternalLink size={16} /> View in Docs
                                </motion.a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <Phone size={18} className="text-[#60a5fa]" /> {t.resume.contact}
                            </h2>
                            <div className="space-y-2 text-sm text-[#cbd5e1]">
                                <div className="space-y-2 text-sm text-[#cbd5e1]">
                                    <p className="flex items-center gap-2"><Phone size={14} className="text-[#64748b]" /> 093-184-0662</p>
                                    <p className="flex items-center gap-2"><Phone size={14} className="text-[#64748b]" /> 090-973-0775</p>
                                    <p className="flex items-center gap-2"><Mail size={14} className="text-[#64748b]" /> suanranger129@gmail.com</p>
                                    <p className="flex items-center gap-2"><MapPin size={14} className="text-[#64748b]" /> {t.resume.location}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <GraduationCap size={18} className="text-[#60a5fa]" /> {t.resume.education.title}
                            </h2>
                            <div className="space-y-4 text-sm text-[#cbd5e1]">
                                <div>
                                    <p className="font-bold text-[#ffffff]">{t.resume.education.university}</p>
                                    <p>{t.resume.education.universityName}</p>
                                </div>
                                {t.resume.education.prevUniversity && (
                                    <div>
                                        <p className="font-bold text-[#ffffff]">{t.resume.education.prevUniversity}</p>
                                        <p>{t.resume.education.prevUniversityName}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-[#ffffff]">{t.resume.education.highschool}</p>
                                    <p>{t.resume.education.highschoolName}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <Cpu size={18} className="text-[#60a5fa]" /> {t.resume.techStack.title}
                            </h2>
                            <div className="space-y-3 text-[11px] text-[#cbd5e1]">
                                <div>
                                    <p className="font-bold text-[#60a5fa] uppercase tracking-wider mb-1">Marketing</p>
                                    <p>{t.resume.techStack.marketing}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-[#60a5fa] uppercase tracking-wider mb-1">Design</p>
                                    <p>{t.resume.techStack.design}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-[#60a5fa] uppercase tracking-wider mb-1">AI / Innovation</p>
                                    <p>{t.resume.techStack.ai}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-[#60a5fa] uppercase tracking-wider mb-1">Office</p>
                                    <p>{t.resume.techStack.office}</p>
                                </div>
                                <div className="mt-2 p-2 bg-[#1e3a5f] rounded-lg border border-[#3b82f633]">
                                    <p className="italic text-[#93c5fd]">{t.resume.techStack.facebookDev}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <Brain size={18} className="text-[#60a5fa]" /> {t.resume.aiFutureSkills}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {aiSkills.map(skill => (
                                    <span key={skill} className="bg-[#2563eb33] text-[#93c5fd] px-2 py-1 rounded text-[11px] border border-[#3b82f64d]">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-[#60a5fa]" /> Core Competencies
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {coreCompetencies.map(skill => (
                                    <span key={skill} className="bg-[#10b98133] text-[#6ee7b7] px-2 py-1 rounded text-[11px] border border-[#10b9814d]">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <Star size={18} className="text-[#60a5fa]" /> Soft Skills
                            </h2>
                            <ul className="space-y-1 text-sm text-[#cbd5e1]">
                                {softSkills.map(skill => (
                                    <li key={skill} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></div> {skill}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Right Column / Content */}
                <div className="md:w-2/3 p-8 lg:p-12">
                    {/* About Me - variant override */}
                    {variant.aboutOverride && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3 mb-4">
                                <Star className="text-[#2563eb]" /> {t.resume.aboutMe || 'About Me'}
                            </h2>
                            <p className="text-[#475569] text-sm leading-relaxed bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
                                {variant.aboutOverride[language] || variant.aboutOverride.en}
                            </p>
                        </section>
                    )}

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3 mb-6">
                            <Briefcase className="text-[#2563eb]" /> ประสบการณ์การทำงาน
                        </h2>
                        <RevealGroup className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#f1f5f9]">
                            {experiences.map((exp, index) => {
                                const isEmphasized = variant.emphasisKeys?.includes(exp.key);
                                return (
                                <RevealItem key={index} className={`relative pl-10 ${isEmphasized ? 'bg-[#eff6ff] -mx-3 px-3 pl-[52px] py-3 rounded-xl border border-[#bfdbfe]' : ''}`}>
                                    <div className={`absolute ${isEmphasized ? 'left-3' : 'left-0'} top-1.5 w-[36px] h-[36px] bg-[#ffffff] border-2 ${isEmphasized ? 'border-[#2563eb] shadow-md shadow-blue-200' : 'border-[#2563eb]'} rounded-full flex items-center justify-center z-10 shadow-sm`}>
                                        <div className={`w-2 h-2 ${isEmphasized ? 'bg-[#2563eb]' : 'bg-[#2563eb]'} rounded-full`}></div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                        <h3 className="text-xl font-bold text-[#1e293b] leading-tight">{exp.title}</h3>
                                        <span className="text-xs font-bold text-[#2563eb] bg-[#eff6ff] px-3 py-1 rounded-full mt-2 sm:mt-0 whitespace-nowrap">
                                            {exp.period}
                                        </span>
                                    </div>
                                    <p className="text-[#64748b] font-medium text-sm mb-3 uppercase tracking-wide">{exp.company}</p>
                                    <ul className="list-none space-y-2 text-[#475569] text-sm leading-relaxed">
                                        {exp.responsibilities.map((item, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-[#3b82f6] font-bold">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </RevealItem>
                                );
                            })}
                        </RevealGroup>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3 mb-6">
                            <Code className="text-[#2563eb]" /> ทักษะความสามารถ (Hard Skills)
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {hardSkills.map(skill => (
                                <div key={skill} className="bg-[#ffffff] border border-[#e2e8f0] p-3 rounded-lg flex items-center gap-3 shadow-sm hover:shadow-md hover:border-[#bfdbfe] transition-all">
                                    <div className="w-2 h-2 bg-[#3b82f6] rounded-full"></div>
                                    <span className="font-semibold text-[#334155] text-sm">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="mt-12 pt-8 border-t border-[#f1f5f9]">
                        <div className="bg-[#eff6ff] border-l-4 border-[#3b82f6] p-4 rounded-r-lg">
                            <p className="text-[#475569] text-xs italic">
                                {language === 'th'
                                    ? '"ด้วยพื้นฐานงานสาย Content Production กว่า 4 ปี ผสมผสานกับประสบการณ์บริหารจัดการทีมและการนำ AI มาปรับใช้ ผมพร้อมที่จะยกระดับการทำงานให้มีประสิทธิภาพและสร้างสรรค์ผลลัพธ์ที่จับต้องได้ให้กับองค์กร"'
                                    : '"With 4+ years in Content Production combined with team management experience and AI integration skills, I am ready to elevate organizational productivity and deliver tangible results."'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Resume;