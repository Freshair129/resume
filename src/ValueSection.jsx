import { Link } from 'react-router-dom';
import { CalendarCheck, ShieldCheck, Bot, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Reveal, RevealGroup, RevealItem } from './MotionPrimitives';
import { hoverLift } from './motion-variants';
import { profile } from './data/profile';

const ICONS = { calendar: CalendarCheck, shield: ShieldCheck, bot: Bot };

const ItemLink = ({ link, children }) => {
  const className = 'mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors';
  if (link.to) {
    return <Link to={link.to} className={className}>{children}</Link>;
  }
  return <a href={link.href} className={className}>{children}</a>;
};

const ValueSection = () => {
  const { language } = useLanguage();
  const { value } = profile[language] || profile.th;

  return (
    <section id="value" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">{value.eyebrow}</p>
          <h2 className="text-colossal-heading text-giant text-slate-900">{value.title}</h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">{value.lead}</p>
        </Reveal>

        <RevealGroup className="grid md:grid-cols-3 gap-6">
          {value.items.map((item) => {
            const Icon = ICONS[item.icon] || Bot;
            return (
              <RevealItem key={item.title} className="h-full">
                <motion.article
                  whileHover={hoverLift}
                  className="h-full flex flex-col bg-slate-50 rounded-[2rem] p-8 border border-slate-100"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed flex-1">{item.desc}</p>
                  <p className="mt-6 pt-5 border-t border-slate-200 text-sm text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700">{value.proofLabel}</span> {item.proof}
                  </p>
                  {item.link && (
                    <ItemLink link={item.link}>
                      {item.link.label} <ArrowRight size={14} />
                    </ItemLink>
                  )}
                </motion.article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
};

export default ValueSection;
