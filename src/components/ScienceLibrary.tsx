import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ExternalLink, Lightbulb, SearchX, Check, X, GraduationCap, ShieldCheck } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { scienceArticles, scienceSources } from '../data/scienceGuide';
import { useApp } from '../context/AppContext';

function Formula({ value }: { value: string }) {
  const html = useMemo(() => katex.renderToString(value.replace(/^\$\$|\$\$$/g, ''), { displayMode: true, throwOnError: false, trust: false, output: 'htmlAndMathml' }), [value]);
  return <div className="science-formula" dir="ltr" dangerouslySetInnerHTML={{ __html: html }} />;
}

const quizzes = [
  { ar: 'ماذا يحدث لهوية العنصر عندما تضيف نيوترونًا؟', en: 'What happens to element identity when you add a neutron?', choices: [['تصبح عنصرًا آخر', 'It becomes a different element'], ['يتغيّر النظير، لا العنصر', 'The isotope changes, not the element'], ['تصبح أيونًا موجبًا', 'It becomes a positive ion']], correct: 1, explanation: ['عدد البروتونات يحدد العنصر؛ عدد النيوترونات يحدد النظير.', 'Proton count defines the element; neutron count defines the isotope.'] },
  { ar: 'ما النسبة المتوقعة المتبقية بعد عمرَي نصف؟', en: 'What fraction remains after two half-lives?', choices: [['50%', '50%'], ['0%', '0%'], ['25%', '25%']], correct: 2, explanation: ['النصف ثم نصف النصف: يتبقى ربع العدد الأصلي في المتوسط.', 'Half, then half again: on average one quarter of the original nuclei remain.'] },
  { ar: 'هل اللف المغزلي هو اتجاه دوران الإلكترون حول النواة؟', en: 'Is spin the direction an electron travels around a nucleus?', choices: [['نعم، هما الشيء نفسه', 'Yes, they are the same'], ['لا، اللف خاصية كمومية ذاتية', 'No, spin is an intrinsic quantum property']], correct: 1, explanation: ['الأسهم والمدارات في المشهد وسائل توضيح وليست مسارات كمومية حقيقية.', 'The arrows and paths in the scene are visual aids, not actual quantum trajectories.'] },
];

function KnowledgeCheck() {
  const { t } = useApp();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const question = quizzes[index];
  return <section className="knowledge-check" aria-labelledby="knowledge-title">
    <div className="science-section-heading"><GraduationCap size={18} /><h3 id="knowledge-title">{t('اختبر فهمك', 'Check your understanding')}</h3><span>{index + 1} / {quizzes.length}</span></div>
    <p className="quiz-question">{t(question.ar, question.en)}</p>
    <div className="quiz-options" role="group" aria-label={t('اختر إجابة', 'Choose an answer')}>
      {question.choices.map(([ar, en], i) => <button key={i} onClick={() => setAnswer(i)} aria-pressed={answer === i} data-result={answer === i ? i === question.correct ? 'correct' : 'incorrect' : undefined}>{t(ar, en)}{answer === i && (i === question.correct ? <Check size={15} /> : <X size={15} />)}</button>)}
    </div>
    {answer !== null && <div className="quiz-feedback" role="status"><p>{answer === question.correct ? t('إجابة صحيحة. ', 'Correct. ') : t('حاول مرة أخرى. ', 'Try again. ')}{t(question.explanation[0], question.explanation[1])}</p><button onClick={() => { setIndex(i => (i + 1) % quizzes.length); setAnswer(null); }}>{t(index === quizzes.length - 1 ? 'إعادة الأسئلة' : 'السؤال التالي', index === quizzes.length - 1 ? 'Restart questions' : 'Next question')}</button></div>}
  </section>;
}

function normalize(text: string) { return text.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').trim(); }

export function ScienceLibrary({ category, query }: { category: string; query: string }) {
  const { t, lang } = useApp();
  const searching = query.trim().length > 0;
  const articles = scienceArticles.filter(article => {
    if (searching) return normalize(`${article.title.ar} ${article.title.en} ${article.body.ar} ${article.body.en} ${article.takeaway.ar} ${article.takeaway.en}`).includes(normalize(query));
    return category === 'library' || category === article.category;
  });
  return <section className="science-library">
    <div className="science-library-intro"><div><span className="science-kicker">THE SCIENCE, EXPLAINED</span><h3>{searching ? t('نتائج البحث في المكتبة', 'Library search results') : t('معرفة أعمق. تجربة أوضح.', 'Deeper knowledge. Clearer experiments.')}</h3><p>{t('شروحات جديدة، مفاهيم مصحّحة، ومراجع للقراءة والاستكشاف.', 'New explanations, clarified concepts, and sources for further exploration.')}</p></div><span className="science-count">{articles.length}<small>{t('موضوعًا', 'topics')}</small></span></div>
    <p className="science-model-notice"><ShieldCheck size={16} />{t('للتعلّم والاستكشاف فقط. النماذج والقراءات تقريبية، والتجارب الكيميائية افتراضية وليست تعليمات للتطبيق المنزلي.', 'For education and exploration. Models and readings are approximate; virtual experiments are not instructions for use at home.')}</p>
    {searching && <p className="science-search-count" role="status">{t(`تم العثور على ${articles.length} موضوعًا`, `${articles.length} topics found`)}</p>}
    {articles.length ? <div className="science-articles">{articles.map((article, i) => <details className="science-article" key={`${article.id}-${searching}`} open={searching || i === 0}>
      <summary><span className="science-article-number">{String(i + 1).padStart(2, '0')}</span><span>{article.title[lang]}</span><ChevronDown size={16} /></summary>
      <div className="science-article-body"><p>{article.body[lang]}</p>{article.formula && <Formula value={article.formula} />}<div className="science-takeaway"><Lightbulb size={17} /><p>{article.takeaway[lang]}</p></div><a href={scienceSources[article.source].url} target="_blank" rel="noopener noreferrer"><BookOpen size={13} /><span>{scienceSources[article.source].name}</span><ExternalLink size={12} /></a></div>
    </details>)}</div> : <div className="science-empty"><SearchX size={28} /><h4>{t('لا توجد نتائج مطابقة', 'No matching topics')}</h4><p>{t('جرّب: الحرارة، السحابة، عمر النصف، أو الماء.', 'Try: heat, orbitals, half-life, or water.')}</p></div>}
    {!searching && <KnowledgeCheck />}
  </section>;
}
