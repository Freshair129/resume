import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, GraduationCap, Briefcase, Code, Brain, Star, CheckCircle2, ArrowLeft } from 'lucide-react';

const Resume = () => {
    // ข้อมูลรูปภาพ (ในสภาพแวดล้อมจริงคุณสามารถเปลี่ยน path รูปภาพได้ที่นี่)
    const profileImage = "https://i.postimg.cc/tTGwsnXb/518287125-10228728079362270-6514242073905598389-n.jpg";
    // หมายเหตุ: สำหรับรูปที่คุณอัปโหลด ระบบจะแสดงผลผ่านไฟล์ต้นฉบับที่คุณแนบมา

    const experiences = [
        {
            title: "Assistant Manager",
            company: "Hostpital Feelgood Club",
            period: "2025 (6 Months)",
            responsibilities: [
                "ดูแลบริหารจัดการภาพรวมการดำเนินงานของร้านให้ราบรื่น",
                "บริหารจัดการและมอบหมายหน้าที่ให้ทีม Service, Security และทีม Host (PR)",
                "ทำหน้าที่ MC ควบคุมลำดับกิจกรรมและบรรยากาศทั้งหมดภายในร้าน",
                "บริหารจัดการความสัมพันธ์ลูกค้า (CRM) และแก้ไขปัญหาเฉพาะหน้าอย่างมีประสิทธิภาพ"
            ]
        },
        {
            title: "Event Project Coordinator",
            company: "Joe Luxury Car Service",
            period: "2024 (1 Year)",
            responsibilities: [
                "วางแผนและบริหารจัดการทรัพยากร (บุคคล, ยานพาหนะ, เวลา) ให้สอดคล้องกับความต้องการ",
                "ดูแลประสานงานระหว่างทีมภาคสนามและลูกค้ากลุ่ม VIP โดยตรง",
                "แก้ไขปัญหาเฉพาะหน้าด้วยความรวดเร็วและรักษามาตรฐานการบริการ",
                "สื่อสารและตอบสนองความต้องการเบื้องต้นของลูกค้าในฐานะตัวแทนทีม"
            ]
        },
        {
            title: "Content Creator",
            company: "Saint Thonglor Clinic (Permanent)",
            period: "2020 - 2022",
            responsibilities: [
                "วางแผนกลยุทธ์คอนเทนต์รายวัน รายสัปดาห์ และรายเดือน",
                "ประสานงานร่วมกับทีมแพทย์และทีม Digital Marketing ภายนอกเพื่อสร้างสรรค์เนื้อหา",
                "ควบคุมการผลิตคอนเทนต์ให้เป็นไปตามภาพลักษณ์ของแบรนด์"
            ]
        },
        {
            title: "Content Creator",
            company: "U-Turn Shop (Part-Time)",
            period: "2020 - 2022",
            responsibilities: [
                "วางแผนและผลิตสื่อวิดีโอ/ภาพนิ่งสำหรับโปรโมทสินค้า",
                "ให้คำปรึกษาและดูแลแนวทางการตอบแชทของทีม Admin",
                "ประสานงานร่วมกับทีมช่างเพื่อผลิตคอนเทนต์เจาะลึกทางเทคนิค"
            ]
        },
        {
            title: "Editor",
            company: "Punnisa Clinic (Contract)",
            period: "2019 (1 Year)",
            responsibilities: [
                "รับผิดชอบการผลิตและตัดต่อคอนเทนต์วิดีโอและภาพเคลื่อนไหวทั้งหมด",
                "สร้างสรรค์สื่อเพื่อสนับสนุนแคมเปญการตลาดของคลินิก"
            ]
        }
    ];

    const hardSkills = ["Photoshop", "Illustrator", "Premiere Pro", "After Effects", "Canva"];
    const aiSkills = [
        "Prompt Engineering", "Context Engineering", "Claude Code",
        "Antigravity", "Agentic RAG", "AI Agent", "AI Search Engine", "AI Marketing"
    ];
    const softSkills = ["การสื่อสาร", "การทำงานเป็นทีม", "การแก้ปัญหาเฉพาะหน้า", "ความคิดสร้างสรรค์", "การบริหารเวลา", "Growth Mindset"];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <ArrowLeft size={18} /> กลับหน้าหลัก
                </Link>
            </div>
            <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Left Column / Sidebar */}
                <div className="md:w-1/3 bg-slate-900 text-white p-8">
                    <div className="text-center mb-8">
                        <div className="w-40 h-40 mx-auto mb-4 border-4 border-blue-500 rounded-2xl overflow-hidden shadow-lg bg-slate-800 flex items-center justify-center">
                            {/* Profile Image with Fallback */}
                            <img
                                src={profileImage}
                                alt="พรพล ธนสุวรรณธาร"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150?text=Profile";
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-wide">พรพล ธนสุวรรณธาร</h1>
                        <p className="text-blue-400 font-medium mt-1 uppercase text-sm tracking-wider">Assistant Manager & Content Specialist</p>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
                                <Phone size={18} className="text-blue-400" /> ติดต่อ
                            </h2>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p className="flex items-center gap-2"><Phone size={14} className="text-slate-500" /> 083-184-0662</p>
                                <p className="flex items-center gap-2"><Mail size={14} className="text-slate-500" /> suanranger129@gmail.com</p>
                                <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> กรุงเทพมหานคร, ประเทศไทย</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
                                <GraduationCap size={18} className="text-blue-400" /> การศึกษา
                            </h2>
                            <div className="space-y-4 text-sm text-slate-300">
                                <div>
                                    <p className="font-bold text-white">ปริญญาตรี นิเทศศาสตร์ (โฆษณา)</p>
                                    <p>มหาวิทยาลัยรังสิต</p>
                                </div>
                                <div>
                                    <p className="font-bold text-white">มัธยมศึกษา</p>
                                    <p>โรงเรียนสวนกุหลาบวิทยาลัย</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
                                <Brain size={18} className="text-blue-400" /> AI & Future Skills
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {aiSkills.map(skill => (
                                    <span key={skill} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-[11px] border border-blue-500/30">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold border-b border-slate-700 pb-2 mb-3 flex items-center gap-2">
                                <Star size={18} className="text-blue-400" /> Soft Skills
                            </h2>
                            <ul className="space-y-1 text-sm text-slate-300">
                                {softSkills.map(skill => (
                                    <li key={skill} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {skill}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Right Column / Content */}
                <div className="md:w-2/3 p-8 lg:p-12">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                            <Briefcase className="text-blue-600" /> ประสบการณ์การทำงาน
                        </h2>
                        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {experiences.map((exp, index) => (
                                <div key={index} className="relative pl-10">
                                    <div className="absolute left-0 top-1.5 w-[36px] h-[36px] bg-white border-2 border-blue-600 rounded-full flex items-center justify-center z-10 shadow-sm">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                        <h3 className="text-xl font-bold text-slate-800 leading-tight">{exp.title}</h3>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 sm:mt-0 whitespace-nowrap">
                                            {exp.period}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-medium text-sm mb-3 uppercase tracking-wide">{exp.company}</p>
                                    <ul className="list-none space-y-2 text-slate-600 text-sm leading-relaxed">
                                        {exp.responsibilities.map((item, i) => (
                                            <li key={i} className="flex gap-2">
                                                <span className="text-blue-500 font-bold">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                            <Code className="text-blue-600" /> ทักษะความสามารถ (Hard Skills)
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {hardSkills.map(skill => (
                                <div key={skill} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center gap-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="font-semibold text-slate-700 text-sm">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <p className="text-slate-600 text-xs italic">
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