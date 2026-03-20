import { Presentation, Mic, Palette } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import dimsumImg from './assets/dimsum.png';
import mock1Img from './assets/pre_mock1.png';
import mock2Img from './assets/pre_mock2.png';
import packagingImg from './assets/pre_packaging.png';

const PresentationSection = () => {
  const { language } = useLanguage();

  const works = [
    {
      id: 1,
      image: mock1Img,
      title: 'V Signature — 3D Cart Mockup',
      desc: language === 'th'
        ? 'ออกแบบรถเข็น Dim Sum แบบ 3D สำหรับ V Signature by The V School — Premium Dim Sum Grab & Go พร้อมโลโก้และเมนูบอร์ด'
        : '3D dim sum cart design for V Signature by The V School — Premium Grab & Go with branding and menu board',
      tags: ['3D Mockup', 'Branding', 'Product Design'],
      type: language === 'th' ? '3D Mockup' : '3D Mockup',
    },
    {
      id: 2,
      image: mock2Img,
      title: 'V Signature — Booth Multi-View',
      desc: language === 'th'
        ? 'ออกแบบบูธ Dim Sum แบบ Multi-angle — Front, Side, Rear View พร้อม Flag Banner, Menu Detail และ Close-up สินค้า'
        : 'Multi-angle booth design — Front, Side, Rear views with flag banner, menu detail, and product close-ups',
      tags: ['Booth Design', '3D Render', 'Multi-View'],
      type: language === 'th' ? '3D Mockup' : '3D Mockup',
    },
    {
      id: 3,
      image: packagingImg,
      title: 'V Signature — Packaging Design',
      desc: language === 'th'
        ? 'ออกแบบกล่องบรรจุภัณฑ์ Dim Sum Grab & Go — กล่องแดงสไตล์ Premium พร้อมโลโก้ V Signature แสดงผลสินค้าจริง'
        : 'Dim Sum Grab & Go packaging design — premium red box with V Signature branding and real product visualization',
      tags: ['Packaging', 'Branding', 'AI-Assisted'],
      type: language === 'th' ? 'บรรจุภัณฑ์' : 'Packaging',
    },
    {
      id: 4,
      image: dimsumImg,
      title: 'The V School Express — Signage',
      desc: language === 'th'
        ? 'ออกแบบป้ายโปรโมทบูธ Dim Sum Grab & Go — ครบทั้ง backdrop 150cm, ป้ายข้าง 60cm และพื้นที่โต๊ะสำหรับใช้งาน'
        : 'Booth promotional signage — full set: 150cm backdrop, 60cm side panels, and table display area',
      tags: ['Graphic Design', 'Signage', 'Photoshop'],
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
                ? 'ออกแบบป้ายโปรโมท, Booth Design, Packaging, Motion Graphics, ตัดต่อวิดีโอด้วย Premiere Pro & After Effects'
                : 'Promotional signage, booth design, packaging, motion graphics, video editing with Premiere Pro & After Effects'}
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

        {/* Project Context */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🥟</span>
            <div>
              <h3 className="font-bold text-xl text-slate-900">The V Dim Sum Lab — V Signature</h3>
              <p className="text-slate-500 text-sm">
                {language === 'th'
                  ? 'โปรเจค Pitch ครบวงจร สำหรับ The V School — ออกแบบตั้งแต่ Branding, 3D Mockup, Packaging, Signage, Executive Dashboard, Market Analysis, Pricing Strategy'
                  : 'Full pitch project for The V School — complete branding, 3D mockup, packaging, signage, executive dashboard, market analysis, pricing strategy'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Branding</span>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">3D Mockup</span>
            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">Packaging</span>
            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Signage</span>
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">Market Analysis</span>
            <span className="bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full text-xs font-bold">Pricing Strategy</span>
            <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold">Executive Dashboard</span>
          </div>
        </div>

        {/* Works Gallery */}
        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          {language === 'th' ? 'ตัวอย่างผลงาน' : 'Sample Work'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {works.map((work) => (
            <div key={work.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
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
