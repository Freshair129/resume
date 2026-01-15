import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Download, ExternalLink, Award, Sparkles, Brain, Cpu, Code, Star, Video, Camera } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import profileImage from './assets/profile.jpg';

const Resume = () => {
    const resumeRef = useRef(null);
    const { t } = useLanguage();

    const handleDownload = async (type) => {
        const element = resumeRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Improve quality
                useCORS: true, // Handle cross-origin images
                backgroundColor: '#ffffff'
            });
            const data = canvas.toDataURL('image/jpeg', 1.0);

            if (type === 'jpg') {
                const link = document.createElement('a');
                link.href = data;
                link.download = 'Pornpon_Resume.jpg';
                link.click();
            } else if (type === 'pdf') {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(data);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                // If height > A4, we might need multiple pages, but for now fit to width
                // For a single page resume, this scales it nicely.
                pdf.addImage(data, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('Pornpon_Resume.pdf');
            }
        } catch (error) {
            console.error("Download failed:", error);
            alert(`เกิดข้อผิดพลาดในการดาวน์โหลด: ${error.message}`);
        }
    };

    // ข้อมูลรูปภาพ (ในสภาพแวดล้อมจริงคุณสามารถเปลี่ยน path รูปภาพได้ที่นี่)
    // หมายเหตุ: สำหรับรูปที่คุณอัปโหลด ระบบจะแสดงผลผ่านไฟล์ต้นฉบับที่คุณแนบมา

    const experiences = [
        {
            title: t.resume.experience.freelance.title,
            company: t.resume.experience.freelance.company,
            period: t.resume.experience.freelance.period,
            responsibilities: [
                t.resume.experience.freelance.responsibility1,
                t.resume.experience.freelance.responsibility2,
                t.resume.experience.freelance.responsibility3
            ]
        },
        {
            title: t.resume.experience.assistantManager.title,
            company: t.resume.experience.assistantManager.company,
            period: t.resume.experience.assistantManager.period,
            responsibilities: [
                t.resume.experience.assistantManager.responsibility1,
                t.resume.experience.assistantManager.responsibility2,
                t.resume.experience.assistantManager.responsibility3,
                t.resume.experience.assistantManager.responsibility4
            ]
        },
        {
            title: t.resume.experience.eventCoordinator.title,
            company: t.resume.experience.eventCoordinator.company,
            period: t.resume.experience.eventCoordinator.period,
            responsibilities: [
                t.resume.experience.eventCoordinator.responsibility1,
                t.resume.experience.eventCoordinator.responsibility2,
                t.resume.experience.eventCoordinator.responsibility3,
                t.resume.experience.eventCoordinator.responsibility4
            ]
        },
        {
            title: t.resume.experience.contentCreatorPermanent.title,
            company: t.resume.experience.contentCreatorPermanent.company,
            period: t.resume.experience.contentCreatorPermanent.period,
            responsibilities: [
                t.resume.experience.contentCreatorPermanent.responsibility1,
                t.resume.experience.contentCreatorPermanent.responsibility2,
                t.resume.experience.contentCreatorPermanent.responsibility3
            ]
        },
        {
            title: t.resume.experience.contentCreatorPartTime.title,
            company: t.resume.experience.contentCreatorPartTime.company,
            period: t.resume.experience.contentCreatorPartTime.period,
            responsibilities: [
                t.resume.experience.contentCreatorPartTime.responsibility1,
                t.resume.experience.contentCreatorPartTime.responsibility2,
                t.resume.experience.contentCreatorPartTime.responsibility3
            ]
        },
        {
            title: t.resume.experience.editorContract.title,
            company: t.resume.experience.editorContract.company,
            period: t.resume.experience.editorContract.period,
            responsibilities: [
                t.resume.experience.editorContract.responsibility1,
                t.resume.experience.editorContract.responsibility2
            ]
        }
    ];

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
            <div ref={resumeRef} className="max-w-5xl mx-auto bg-[#ffffff] shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

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
                        <h1 className="text-2xl font-bold tracking-wide">{t.resume.name}</h1>
                        <p className="text-[#60a5fa] font-medium mt-1 uppercase text-sm tracking-wider">{t.resume.title}</p>
                    </div>

                    {/* Download Buttons */}
                    <div className="flex flex-col gap-3 mb-8" data-html2canvas-ignore="true">
                        <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1">
                            <Download size={12} /> {t.resume.downloadResume}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => handleDownload('pdf')} className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-[#ffffff] px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#1e3a8a80] cursor-pointer">
                                <FileText size={16} /> PDF
                            </button>
                            <button onClick={() => handleDownload('jpg')} className="flex-1 bg-[#334155] hover:bg-[#475569] text-[#ffffff] px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#0f172a80] cursor-pointer">
                                <Image size={16} /> JPG
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <Phone size={18} className="text-[#60a5fa]" /> {t.resume.contact}
                            </h2>
                            <div className="space-y-2 text-sm text-[#cbd5e1]">
                                <div className="space-y-2 text-sm text-[#cbd5e1]">
                                    <p className="flex items-center gap-2"><Phone size={14} className="text-[#64748b]" /> 083-184-0662</p>
                                    <p className="flex items-center gap-2"><Phone size={14} className="text-[#64748b]" /> 090-973-0775</p>
                                    <p className="flex items-center gap-2"><Mail size={14} className="text-[#64748b]" /> suanranger129@gmail.com</p>
                                    <p className="flex items-center gap-2"><MapPin size={14} className="text-[#64748b]" /> {t.resume.location}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-[#334155] pb-2 mb-3 flex items-center gap-2">
                                <GraduationCap size={18} className="text-[#60a5fa]" /> {t.resume.education}
                            </h2>
                            <div className="space-y-4 text-sm text-[#cbd5e1]">
                                <div>
                                    <p className="font-bold text-[#ffffff]">{t.resume.bachelorDegree}</p>
                                    <p>{t.resume.rungsitUniversity}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-[#ffffff]">{t.resume.highSchool}</p>
                                    <p>{t.resume.suankularb}</p>
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
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3 mb-6">
                            <Briefcase className="text-[#2563eb]" /> ประสบการณ์การทำงาน
                        </h2>
                        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#f1f5f9]">
                            {experiences.map((exp, index) => (
                                <div key={index} className="relative pl-10">
                                    <div className="absolute left-0 top-1.5 w-[36px] h-[36px] bg-[#ffffff] border-2 border-[#2563eb] rounded-full flex items-center justify-center z-10 shadow-sm">
                                        <div className="w-2 h-2 bg-[#2563eb] rounded-full"></div>
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
                                </div>
                            ))}
                        </div>
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
                                "ด้วยพื้นฐานงานสาย Content Production กว่า 4 ปี ผสมผสานกับประสบการณ์บริหารจัดการทีมและการนำ AI มาปรับใช้ ผมพร้อมที่จะยกระดับการทำงานให้มีประสิทธิภาพและสร้างสรรค์ผลลัพธ์ที่จับต้องได้ให้กับองค์กร"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resume;