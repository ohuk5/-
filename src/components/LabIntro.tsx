import { ArrowLeft, ArrowRight, Box, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

const content = {
  'states-of-matter': { ar: 'اكتشف المادة، من الداخل.', en: 'Discover matter. From within.', arSub: 'غيّر الحرارة والضغط، وراقب كيف تتغيّر حركة الجزيئات أمامك.', enSub: 'Change temperature and pressure. Watch a microscopic world respond.', label: 'MATTER & THERMODYNAMICS', number: '02' },
  'atom-builder': { ar: 'عالم كامل، داخل ذرّة.', en: 'A whole world. Inside an atom.', arSub: 'ابنِ العناصر جسيمًا بجسيم، واستكشف النواة والأغلفة الإلكترونية من كل زاوية.', enSub: 'Build elements one particle at a time. Explore the nucleus from every angle.', label: 'ATOMIC STRUCTURE', number: '01' },
  'radioactive-decay': { ar: 'راقب التحوّل، عبر الزمن.', en: 'Watch change. Over time.', arSub: 'اكتشف النظائر المشعة، وعمر النصف، والاحتمالات التي تحكم الاضمحلال.', enSub: 'Explore radioactive isotopes, half-life, and the probability behind decay.', label: 'NUCLEAR PHYSICS', number: '03' },
  'experiments-lab': { ar: 'فضولك، بداية التجربة.', en: 'Curiosity starts the experiment.', arSub: 'اختبر الأفكار في بيئة افتراضية، وراقب التفاعلات، واسأل لماذا.', enSub: 'Test ideas in a virtual environment. Observe reactions. Ask why.', label: 'EXPERIMENTAL CHEMISTRY', number: '04' },
};

export function LabIntro({ onOpenGuide }: { onOpenGuide: () => void }) {
  const { activeTab, t, lang } = useApp();
  const item = content[activeTab];
  return <section className="lab-intro" aria-labelledby="lab-title">
    <div>
      <div className="lab-eyebrow"><span>{item.number}</span><span>{item.label}</span></div>
      <h1 id="lab-title">{t(item.ar, item.en)}</h1>
      <p>{t(item.arSub, item.enSub)}</p>
    </div>
    <div className="lab-intro-side">
      {(activeTab === 'states-of-matter' || activeTab === 'atom-builder') && <span className="lab-3d-tag"><Box size={15} />{t('استكشاف ثلاثي الأبعاد', '3D EXPLORATION')}</span>}
      <button onClick={onOpenGuide}><BookOpen size={15} />{t('افهم العلم وراء المشهد', 'The science behind the scene')}{lang === 'ar' ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}</button>
    </div>
  </section>;
}
