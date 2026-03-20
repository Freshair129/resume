import { Presentation, Mic, Palette, ChevronRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import dimsumImg from './assets/dimsum.png';

const PresentationSection = () => {
  const { language } = useLanguage();

  const works = [
    {
      id: 1,
      image: dimsumImg,
      title: language === 'th'
        ? 'The V School Express — Dim Sum Grab & Go'
        : 'The V School Express — Dim Sum Grab & Go',
      desc: language === 'th'
        ? 'ออกแบบป้ายโปรโมทบูธ Dim Sum Grab & Go สำหรับ The V School — ออกแบบครบทั้ง backdrop, ป้ายโต๊ะ และ standee'
        : 'Designed booth promotional signage for The V School Dim Sum Grab & Go — full set including backdrop, table sign, and standee',
      tags: ['Graphic Design', 'Booth Design', 'Photoshop'],
      type: language === 'th' ? 'งานออกแบบ' : 'Design',
    },
  ];

  return (
    <section id="presentation" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Presentation size={16} />
            {language === 'th' ? 'ผลงานการนำเสนอ & ออกแบบ' : 'Presentation & Design Work'}
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            {language === 'th' ? 'ทำได้มากกว่าแค่โค้ด' : 'More Than Just Code'}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            {language === 'th'
              ? 'นอกจากสร้างระบบได้แล้ว ผมยังมีทักษะด้านการนำเสนอ ออกแบบกราฟิก และผลิตสื่อจากประสบการณ์ทำงานจริงกว่า 6 ปี'
              : 'Beyond building systems, I bring 6+ years of presentation, graphic design, and media production skills from real-world experience'}
          </p>
        </div>

        {/* Skills Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Mic size={24} className="text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {language === 'th' ? 'นำเสนอ & พรีเซนต์' : 'Presentation & MC'}
            </h3>
            <p className="text-slate-500 text-sm">
              {language === 'th'
                ? 'นำเสนอหลักสูตรอาหารให้นักเรียน, สาธิตการทำอาหารญี่ปุ่น, จัดทำ Pitch Deck สำหรับฝ่ายบริหาร'
                : 'Course presentations to students, Japanese cooking demos, executive pitch decks'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
              <Palette size={24} className="text-orange-500 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {language === 'th' ? 'ออกแบบกราฟิก & สื่อ' : 'Graphic & Media Design'}
            </h3>
            <p className="text-slate-500 text-sm">
              {language === 'th'
                ? 'ออกแบบป้ายโปรโมท, Booth Design, Motion Graphics, ตัดต่อวิดีโอด้วย Premiere Pro & After Effects'
                : 'Promotional signage, booth design, motion graphics, video editing with Premiere Pro & After Effects'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Presentation size={24} className="text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              {language === 'th' ? 'Pitch Deck & Data Dashboard' : 'Pitch Deck & Data Dashboard'}
            </h3>
            <p className="text-slate-500 text-sm">
              {language === 'th'
                ? 'จัดทำ Pitch Deck, Data Dashboard สำหรับฝ่ายบริหาร, วิเคราะห์ข้อมูลและนำเสนอ insight'
                : 'Executive pitch decks, data dashboards, analytics insights presentation'}
            </p>
          </div>
        </div>

        {/* Works Gallery */}
        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          {language === 'th' ? 'ตัวอย่างผลงาน' : 'Sample Work'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work) => (
            <div key={work.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                    {work.type}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-2">{work.title}</h4>
                <p className="text-slate-500 text-sm mb-4">{work.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {work.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;
