import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { Reveal, RevealGroup, RevealItem } from './MotionPrimitives';
import { caseStudies } from './data/caseStudies';

const CaseStudies = () => {
  const { language, t } = useLanguage();

  return (
    <section id="case-studies" className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">{t.caseStudies.eyebrow}</p>
          <h2 className="text-colossal-heading text-giant text-slate-900">{t.caseStudies.title}</h2>
        </Reveal>

        <RevealGroup className="space-y-6">
          {caseStudies.map((item) => {
            const content = item[language] || item.th;
            const CaseLink = content.link.startsWith('/') ? Link : 'a';
            const linkProps = content.link.startsWith('/') ? { to: content.link } : { href: content.link };

            return (
              <RevealItem key={item.id} className="min-w-0">
                <article className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 lg:gap-10 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                  <div className="min-w-0 flex flex-col">
                    <p className="text-sm font-bold text-blue-600 mb-2">{content.client}</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-snug">{content.title}</h3>
                    <div className="mt-6 space-y-5">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{t.caseStudies.problem}</h4>
                        <p className="text-slate-700 leading-relaxed">{content.problem}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{t.caseStudies.approach}</h4>
                        <p className="text-slate-700 leading-relaxed">{content.approach}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{t.caseStudies.result}</h4>
                        <ul className="space-y-1 text-slate-700 leading-relaxed">
                          {content.result.map((result) => <li key={result}>{result}</li>)}
                        </ul>
                      </div>
                    </div>
                    <CaseLink {...linkProps} className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      {t.caseStudies.viewCase} <ArrowRight size={14} />
                    </CaseLink>
                  </div>

                  <div className="min-w-0 self-center">
                    {content.images.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory" aria-label={content.title}>
                        {content.images.map((image) => (
                          <div key={image} className="w-64 sm:w-72 lg:w-[calc(50%-0.5rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                            <img src={image} alt={content.title} loading="lazy" decoding="async" className="w-full h-52 md:h-60 object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="min-h-56 rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100 border border-rose-100 p-8 flex items-center justify-center text-center">
                        <p className="max-w-xs text-sm font-bold text-rose-800">{t.caseStudies.portfolioFallback}</p>
                      </div>
                    )}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
};

export default CaseStudies;
