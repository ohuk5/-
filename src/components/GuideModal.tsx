import React, { useState } from 'react';
import {
  X,
  Atom,
  Flame,
  Radiation,
  BookOpen,
  Compass,
  Gauge,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Globe2,
  Layers,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'basics' | 'states' | 'atoms' | 'decay' | 'missions';
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'basics'
}) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';
  const isAr = lang === 'ar';
  const [activeCategory, setActiveCategory] = useState<'basics' | 'states' | 'atoms' | 'decay' | 'missions'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className={`border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] ${
          isAr ? 'text-right' : 'text-left'
        } ${isDark ? 'bg-slate-900 border-slate-700/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
      >
        {/* Top Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{t('الموسوعة والدليل العلمي التفاعلي المبسط', 'Interactive Scientific Encyclopedia & Guide')}</span>
                <span className="text-[11px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30 hidden sm:inline-block">
                  {t('من الصفر حتى الاحتراف', 'Beginner to Advanced')}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  'شرح كل ظاهرة فيزيائية وكيميائية بتشبيهات يومية وأمثلة واقعية يفهمها الجميع',
                  'Every physical & chemical phenomenon explained with intuitive everyday analogies'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900'
            }`}
            title={t('إغلاق الدليل', 'Close Guide')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Navigation Bar */}
        <div
          className={`px-4 py-3 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
            isDark ? 'bg-slate-950/50 border-slate-800/80' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold no-scrollbar">
            <button
              onClick={() => setActiveCategory('basics')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'basics'
                  ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30'
                  : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🐣</span>
              <span>{t('مقدمة المبتدئين', 'Beginner Basics')}</span>
            </button>

            <button
              onClick={() => setActiveCategory('states')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'states'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30'
                  : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t('أسرار حالات المادة والضغط', 'States & Pressure')}</span>
            </button>

            <button
              onClick={() => setActiveCategory('atoms')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'atoms'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30'
                  : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>{t('بنية الذرة والجدول الدوري', 'Atoms & Table')}</span>
            </button>

            <button
              onClick={() => setActiveCategory('decay')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'decay'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                  : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Radiation className="w-3.5 h-3.5" />
              <span>{t('عمر النصف والإشعاع', 'Half-Life & Decay')}</span>
            </button>

            <button
              onClick={() => setActiveCategory('missions')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'missions'
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                  : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('مهمات وتجارب عملية', 'Missions & Labs')}</span>
            </button>
          </div>

          {/* Quick Search Box */}
          <div className="relative min-w-[200px]">
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ابحث في الدليل العلمي...', 'Search scientific guide...')}
              className={`w-full border rounded-xl py-1.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 ${
                isAr ? 'pl-9 pr-3' : 'pr-9 pl-3'
              } ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className={`p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {/* TAB 1: BEGINNER BASICS */}
          {activeCategory === 'basics' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                  <span>
                    {t(
                      '💡 ما هي الذرة والمادة؟ تخيل أن الكون مبني من مكعبات ليغو مجهرية!',
                      '💡 What are Atoms and Matter? Imagine the universe built of microscopic Legos!'
                    )}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {t(
                    'كل شيء تراه أو تلمسه حولك — الهواء الذي تتنفسه، الماء الذي تشربه، شاشة هاتفك، وحتى خلايا جسدك — كلها تتكون من لبنات بناء صغيرة جداً لا تُرى حتى بأقوى المجاهر العادية تسمى الذرات (Atoms).',
                    'Everything you see or touch around you — the air you breathe, the water you drink, your smartphone screen, and even your living cells — is assembled from tiny sub-microscopic building blocks called Atoms.'
                  )}
                </p>
              </div>

              {/* Analogy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Analogy 1: Football Stadium Atom */}
                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <span>🏟️</span>
                    <span>{t('تشبيه ملعب كرة القدم (كم يبلغ حجم الذرة؟):', 'Football Stadium Analogy (How big is an atom?):')}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t('لو كبّرنا الذرة لتصبح بحجم استاد كرة قدم ضخم:', 'If we scaled up a single atom to the size of a massive football stadium:')}
                  </p>
                  <ul className={`text-xs space-y-1.5 list-disc list-inside p-3 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <li>
                      <strong className="text-cyan-400">{t('النواة:', 'The Nucleus:')}</strong>{' '}
                      {t('ستكون في منتصف الملعب تماماً بحجم حبة بازلاء أو خرزة صغيرة!', 'Would sit at the exact center spot, the size of a tiny green pea!')}
                    </li>
                    <li>
                      <strong className="text-blue-400">{t('الإلكترونات:', 'The Electrons:')}</strong>{' '}
                      {t('حشرات مجهرية سريعة جداً تطير حول أعلى صفوف مدرجات الملعب!', 'Would be microscopic gnats buzzing around the highest stadium spectator rows!')}
                    </li>
                    <li>
                      <strong className="text-amber-400">{t('المفاجأة العلمية:', 'Scientific Reality:')}</strong>{' '}
                      {t('باقي الملعب بالكامل (99.99999%) عبارة عن فراغ محض! الذرة معظمها فراغ!', 'The entire rest of the stadium (99.99999%) is completely empty space! Matter is mostly void!')}
                    </li>
                  </ul>
                </div>

                {/* Analogy 2: Heat as a Dance Party */}
                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <span>🕺</span>
                    <span>{t('ما هي الحرارة حقاً؟ (ليست سائلاً سحرياً!):', 'What is Heat Really? (Not a fluid, but motion!):')}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'كثير من الناس يظنون أن الحرارة مادة تضاف، لكن في الفيزياء الحرارة هي ببساطة سرعة رقص واهتزاز الجزيئات:',
                      'Heat is not a mysterious substance; in physics, temperature simply measures the average kinetic energy and vibrational dance of particles:'
                    )}
                  </p>
                  <ul className={`text-xs space-y-1.5 list-disc list-inside p-3 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <li>
                      <strong className="text-blue-400">{t('البرد القارس (الصلب):', 'Extreme Cold (Solid):')}</strong>{' '}
                      {t('الجزيئات تمسك أيدي بعضها بإحكام، وتهتز فقط في مكانها دون أن تفلت.', 'Particles lock arms firmly in a rigid crystal lattice, merely shivering in place.')}
                    </li>
                    <li>
                      <strong className="text-cyan-400">{t('الحرارة المعتدلة (السائل):', 'Moderate Heat (Liquid):')}</strong>{' '}
                      {t('تفلت الأيدي قليلاً وتنزلق الجزيئات فوق بعضها مثل ممر المشاة المزدحم.', 'Bonds loosen enough for molecules to slip and roll over one another like a crowded street.')}
                    </li>
                    <li>
                      <strong className="text-orange-400">{t('الحرارة العالية (الغاز):', 'High Heat (Gas):')}</strong>{' '}
                      {t('تتحرر الجزيئات وتركض بسرعة جنونية وتطير في كل الاتجاهات وتصطدم بالجدران!', 'Particles break completely free, flying at supersonic speeds and bouncing off walls!')}
                    </li>
                  </ul>
                </div>

                {/* Analogy 3: Pressure as Tennis Balls */}
                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span>🎾</span>
                    <span>{t('ما هو الضغط (Pressure)؟:', 'What is Pressure?:')}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'تخيل غرفة مغلقة بداخلها 100 شخص يقذفون كرات تنس بسرعة هائلة نحو الجدران باستمرار:',
                      'Imagine a closed room where billions of tiny rubber balls bounce continuously off every wall:'
                    )}
                  </p>
                  <p className={`text-xs p-3 rounded-xl border leading-relaxed ${
                    isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    {t(
                      'كل ضربة كرة على الجدار هي دفعة صغيرة. مجموع مليارات الضربات في الثانية الواحدة هو ما نسميه الضغط! إذا صغّرت حجم الغرفة (كبست المكبس)، أو زدت سرعة الكرات (رفعت الحرارة)، ستضرب الكرات الجدران بمعدل أكبر، وسيقفز مؤشر الضغط عالياً!',
                      'Each collision exerts a tiny push. The sum of billions of impacts per square centimeter per second is Pressure! If you compress the chamber (lower the piston) or heat up the particles, they strike the boundaries more violently, and the pressure gauge rises!'
                    )}
                  </p>
                </div>

                {/* Analogy 4: Absolute Zero */}
                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <span>❄️</span>
                    <span>{t('الصفر المطلق (0 Kelvin = -273.15 °C):', 'Absolute Zero (0 Kelvin = -273.15 °C):')}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t('هل يمكن تبريد الأشياء إلى ما لا نهاية؟ الإجابة: لا!', 'Can matter be cooled down forever? The answer is: No!')}
                  </p>
                  <p className={`text-xs p-3 rounded-xl border leading-relaxed ${
                    isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    {t(
                      'بما أن الحرارة هي حركة الجزيئات، فهناك حد أدنى تتوقف عنده الجزيئات عن الحركة تماماً وتسكن كلياً! هذا الحد يسمى الصفر المطلق (0 كلفن)، ولا يمكن لأي شيء في الكون أن يكون أبرد منه أبداً.',
                      'Because temperature represents atomic motion, there is a fundamental theoretical minimum where molecular kinetic motion drops to zero. That limit is Absolute Zero (0 K). Nothing in the cosmos can ever be colder than this point.'
                    )}
                  </p>
                </div>
              </div>

              {/* Quick FAQ Cards */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>{t('أسئلة شائعة يجيب عنها هذا المحاكي:', 'Everyday Questions Answered by This Simulator:')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-cyan-400 block mb-1">
                      {t('❓ لماذا يطفو الماء ككرة سحرية في الفضاء؟', '❓ Why does water float as a floating sphere in space?')}
                    </span>
                    <span className="text-slate-400">
                      {t(
                        'لأنه في غياب الجاذبية تسحبه قوى التوتر السطحي لأقل مساحة سطح ممكنة وهي الكرة الهندسية!',
                        'Without gravity pulling it to the bottom, surface tension pulls all water molecules into the minimal surface area shape: a perfect sphere!'
                      )}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-orange-400 block mb-1">
                      {t('❓ لماذا يطهى الطعام بسرعة في قدر الضغط؟', '❓ Why does food cook so quickly in a pressure cooker?')}
                    </span>
                    <span className="text-slate-400">
                      {t(
                        'لأن حبس البخار يرفع الضغط، والضغط العالي يمنع الماء من التبخر حتى يصل إلى 120°C بدلاً من 100°C فيطهى أسرع بكثير!',
                        'Trapping steam raises pressure, which elevates water’s boiling point up to 120°C instead of 100°C, cooking food much faster!'
                      )}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-blue-400 block mb-1">
                      {t('❓ لماذا لا يذوب الجليد الجاف (CO₂) إلى ماء؟', '❓ Why does dry ice (CO₂) never melt into a puddle?')}
                    </span>
                    <span className="text-slate-400">
                      {t(
                        'لأنه يتسامى مباشرة من صلب إلى غاز عند الضغط العادي، ويحتاج ضغطاً يفوق 5.1 ضغط جوي لكي يظهر في الحالة السائلة!',
                        'It sublimates directly from solid to gas at standard pressure. It requires over 5.1 atmospheres to exist as a liquid!'
                      )}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-purple-400 block mb-1">
                      {t('❓ ما هو المعدن الوحيد السائل في حرارة الغرفة؟', '❓ What is the only metal that is liquid at room temperature?')}
                    </span>
                    <span className="text-slate-400">
                      {t(
                        'إنه الزئبق (Hg)، روابطه الإلكترونية المميزة تجعل درجة انصهاره منخفضة (-38.8°C) فيبقى سائلاً كثيفاً ولامعاً.',
                        'Mercury (Hg), whose relativistic electron shell effects weaken metallic bonding so that it melts at -38.8°C and remains a dense liquid.'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATES OF MATTER, PRESSURE & GRAVITY */}
          {activeCategory === 'states' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-orange-950/60 via-slate-900 to-slate-950 border border-orange-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-orange-400 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>{t('حالات المادة الثلاث وقوانين الغازات والضغط والجاذبية', 'States of Matter, Gas Laws, Pressure & Gravity')}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {t(
                    'شرح علمي لكيفية تأثير درجة الحرارة (T)، والضغط (P)، والحجم (V)، والجاذبية (g) على المادة وسلوكها الحركي.',
                    'Scientific explanation of how Temperature (T), Pressure (P), Volume (V), and Gravity (g) govern matter.'
                  )}
                </p>
              </div>

              {/* The Three States Table / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`border p-4 rounded-2xl space-y-2 ${isDark ? 'bg-blue-950/40 border-blue-500/40' : 'bg-blue-50/60 border-blue-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-black text-sm">{t('الحالة الصلبة (Solid)', 'Solid State (Crystal)')}</span>
                    <span className="text-xl">🧊</span>
                  </div>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300">
                    <li><strong className="text-blue-300">{t('الشكل والحجم:', 'Shape & Volume:')}</strong> {t('ثابتان ومحددان بدقة.', 'Definite shape and volume.')}</li>
                    <li><strong className="text-blue-300">{t('حركة الجزيئات:', 'Motion:')}</strong> {t('اهتزاز موضعي حول مراكز اتزانها.', 'Vibrating in fixed lattice positions.')}</li>
                    <li><strong className="text-blue-300">{t('قوى التماسك:', 'Intermolecular Forces:')}</strong> {t('قوية جداً تقاوم التفكك.', 'Strong attractions resisting shear.')}</li>
                    <li><strong className="text-blue-300">{t('تأثير الحرارة:', 'Thermal Effect:')}</strong> {t('التسخين يكسبها طاقة انصهار لكسر الشبكة.', 'Heat provides latent energy to melt.')}</li>
                  </ul>
                </div>

                <div className={`border p-4 rounded-2xl space-y-2 ${isDark ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-cyan-50/60 border-cyan-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-black text-sm">{t('الحالة السائلة (Liquid)', 'Liquid State (Fluid)')}</span>
                    <span className="text-xl">💧</span>
                  </div>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300">
                    <li><strong className="text-cyan-300">{t('الشكل والحجم:', 'Shape & Volume:')}</strong> {t('حجم ثابت ويأخذ شكل الإناء.', 'Definite volume, adapts to vessel.')}</li>
                    <li><strong className="text-cyan-300">{t('حركة الجزيئات:', 'Motion:')}</strong> {t('انسيابية وانزلاقية مائعة.', 'Fluid sliding and rolling motion.')}</li>
                    <li><strong className="text-cyan-300">{t('قوى التماسك:', 'Intermolecular Forces:')}</strong> {t('متوسطة تسمح بالتوتر السطحي.', 'Moderate, enabling surface tension.')}</li>
                    <li><strong className="text-cyan-300">{t('تأثير الحرارة:', 'Thermal Effect:')}</strong> {t('التسخين يفلت الجزيئات بالتبخر والغليان.', 'Heat triggers evaporation & boiling.')}</li>
                  </ul>
                </div>

                <div className={`border p-4 rounded-2xl space-y-2 ${isDark ? 'bg-orange-950/40 border-orange-500/40' : 'bg-orange-50/60 border-orange-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-black text-sm">{t('الحالة الغازية (Gas)', 'Gas State (Vapor)')}</span>
                    <span className="text-xl">💨</span>
                  </div>
                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300">
                    <li><strong className="text-orange-300">{t('الشكل والحجم:', 'Shape & Volume:')}</strong> {t('يتمدد ليملأ أي وعاء بالكامل.', 'Expands to fill entire container.')}</li>
                    <li><strong className="text-orange-300">{t('حركة الجزيئات:', 'Motion:')}</strong> {t('عشوائية وسريعة جداً في كل اتجاه.', 'High-velocity random trajectories.')}</li>
                    <li><strong className="text-orange-300">{t('قوى التماسك:', 'Intermolecular Forces:')}</strong> {t('تكاد تكون معدومة بين الذرات.', 'Negligible intermolecular attraction.')}</li>
                    <li><strong className="text-orange-300">{t('تأثير الضغط:', 'Pressure Effect:')}</strong> {t('قابل للانضغاط بدرجة كبيرة جداً.', 'Highly compressible via piston work.')}</li>
                  </ul>
                </div>
              </div>

              {/* Deep Dive: Pressure & Boyle's Law */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  <span>{t('تأثير الضغط والمكبس: قوانين بويل والكبس الأديباتي', 'Pressure & Piston Impact: Boyle\'s Law & Adiabatic Liquefaction')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className={`p-3.5 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800/70' : 'bg-white border-slate-200'}`}>
                    <strong className="text-cyan-400 font-bold block">{t('1. قانون بويل (Boyle\'s Law):', '1. Boyle\'s Law (Inverse P-V Relation):')}</strong>
                    <p className="text-slate-400 leading-relaxed">
                      {t('عند ثبات درجة الحرارة، يتناسب ضغط الغاز عكسياً مع حجمه:', 'At constant temperature, pressure is inversely proportional to volume:')}
                    </p>
                    <div className="font-mono text-center bg-slate-950 py-1.5 rounded-lg border border-slate-800 text-cyan-400 font-bold text-sm" dir="ltr">
                      P₁ × V₁ = P₂ × V₂
                    </div>
                    <p className="text-slate-400">
                      {t(
                        'عند إنزال المكبس وتقليل الحجم إلى النصف، يتضاعف معدل اصطدام الجزيئات بالجدران فيتضاعف الضغط فوراً!',
                        'Halving the chamber volume doubles particle collision frequency against walls, doubling internal pressure!'
                      )}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-900/60 border-slate-800/70' : 'bg-white border-slate-200'}`}>
                    <strong className="text-orange-400 font-bold block">{t('2. التكاثف بالضغط (Pressure Liquefaction):', '2. Pressure Liquefaction (Clausius-Clapeyron):')}</strong>
                    <p className="text-slate-400 leading-relaxed">
                      {t('لماذا يتحول البخار إلى سائل عند كبسه بالمكبس دون تبريد؟', 'Why does vapor condense into liquid when compressed without cooling?')}
                    </p>
                    <div className="font-mono text-center bg-slate-950 py-1.5 rounded-lg border border-slate-800 text-orange-400 font-bold text-sm" dir="ltr">
                      ↑ Pressure (P) ⟹ ↑ Boiling Point (T_b)
                    </div>
                    <p className="text-slate-400">
                      {t(
                        'الضغط العالي يقرب الجزيئات ويرفع درجة الغليان فوق درجة الحرارة الحالية، مما يجبر الغاز على التحول إلى سائل مائع!',
                        'Compression forces molecules together and elevates the boiling point above current temperature, forcing vapor to condense into liquid!'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deep Dive: Gravity in Action */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>{t('تأثير الجاذبية الأرضية والكونية على الموائع', 'Gravitational Field Impact on Fluid Dynamics')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-cyan-400 block mb-1">{t('🌍 جاذبية الأرض (1.0 g):', '🌍 Earth Gravity (1.0 g):')}</span>
                    <p className="text-slate-400">
                      {t(
                        'تسحب السائل ليستقر أفقياً في قاع الإناء وتشكل تدرجاً ضغطياً طبيعياً.',
                        'Pulls liquids down into a flat pool at the vessel floor with standard hydrostatic pressure.'
                      )}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-orange-400 block mb-1">{t('🪐 جاذبية المشتري (2.5 g):', '🪐 Jupiter Gravity (2.5 g):')}</span>
                    <p className="text-slate-400">
                      {t(
                        'قوة ساحقة تسطح السائل وتضغط الجزيئات بشدة نحو القاع.',
                        'Extreme downward force flattens fluids tightly against the base, increasing bottom density.'
                      )}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-purple-400 block mb-1">{t('🚀 انعدام الوزن (Zero-G):', '🚀 Zero Gravity (0.0 g):')}</span>
                    <p className="text-slate-400">
                      {t(
                        'تختفي قوة السحب نحو القاع، فتسود قوى التوتر السطحي لتشكل كرة مائية طافية معلقة في المنتصف!',
                        'Downward pull vanishes; surface tension dominates, coalescing particles into a floating suspended water sphere!'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exotic Substances Showcase */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('معرض المواد وظواهرها الفيزيائية الخارقة في المحاكي:', 'Exotic Substances Showcase in the Simulator:')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-sky-400 block mb-1">🌡️ {t('الغاليوم (Ga):', 'Gallium (Ga):')}</span>
                    <p className="text-slate-400 leading-relaxed">
                      {t('معدن ينصهر في راحة يدك عند 29.8 °C، ولكنه يغلي عند 2400 °C! أوسع نطاق حراري سائل في الكون.', 'Melts in your palm at 29.8 °C but boils at 2400 °C! Widest liquid range in the universe.')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-slate-300 block mb-1">🚀 {t('التيتانيوم (Ti):', 'Titanium (Ti):')}</span>
                    <p className="text-slate-400 leading-relaxed">
                      {t('معدن الصواريخ الفائقة؛ ينصهر عند 1941 K ويغلي عند 3560 K، صلب كالصلب ونصف وزنه ومقاوم لكل العوامل.', 'Aerospace metal; melts at 1941 K and boils at 3560 K, high tensile strength and ultralight.')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-indigo-400 block mb-1">⚡ {t('الزينون (Xe):', 'Xenon (Xe):')}</span>
                    <p className="text-slate-400 leading-relaxed">
                      {t('أثقل الغازات النبيلة المستقرة، أثقل من الهواء بخمس مرات، وقود الدفع الأيوني لمسبارات الفضاء السحيق.', 'Heaviest noble gas, 5x denser than air, propellant for deep-space ion propulsion thrusters.')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-cyan-400 block mb-1">🧪 {t('الإيثانول (C₂H₅OH):', 'Ethanol (C₂H₅OH):')}</span>
                    <p className="text-slate-400 leading-relaxed">
                      {t('كحول طيار يغلي عند 78.3 °C ويمتص حرارة هائلة أثناء التبخر، مما يفسر إحساس البرودة عند وضعه على الجلد.', 'Volatile alcohol boiling at 78.3 °C with strong evaporative cooling on contact with skin.')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-amber-500 block mb-1">👑 {t('الذهب (Au):', 'Gold (Au):')}</span>
                    <p className="text-slate-400 leading-relaxed">
                      {t('فلز نبيل فائق الكثافة والبريق، لا يتأكسد ولا يصدأ، ينصهر عند 1337 K بحمم ذهبية متوهجة نقية.', 'Noble dense metal that never tarnishes, melting at 1337 K into glowing golden liquid magma.')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="font-bold text-yellow-400 block mb-1">❄️ {t('الهيليوم (He):', 'Helium (He):')}</span>
                    <p className="text-slate-400 leading-relaxed">
                      {t('أقل نقطة غليان في الكون (4.2 K)، لا يتجمد حتى عند الصفر المطلق تحت الضغط الجوي العادي!', 'Lowest boiling point in existence (4.2 K); never freezes at 1 atm even at absolute zero!')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATOM BUILDER & PERIODIC TABLE */}
          {activeCategory === 'atoms' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-cyan-400 flex items-center gap-2">
                  <Atom className="w-5 h-5 text-cyan-400" />
                  <span>{t('دليل بناء الذرة الشامل والجدول الدوري (118 عنصراً)', 'Atom Builder Guide & Periodic Table (118 Elements)')}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {t(
                    'كيف تُبنى النواة؟ ومن أين تكتسب المادة خصائصها الكيميائية والفيزيائية؟',
                    'How are atomic nuclei structured? Where do elements acquire chemical and physical properties?'
                  )}
                </p>
              </div>

              {/* Subatomic Particles Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={`border p-4 rounded-2xl space-y-2 ${isDark ? 'bg-rose-950/40 border-rose-500/40' : 'bg-rose-50/60 border-rose-200'}`}>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
                    <span>{t('البروتونات (p⁺) - شحنة موجبة (+1)', 'Protons (p⁺) - Charge (+1)')}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-rose-400">{t('هوية العنصر (Z):', 'Atomic Identity (Z):')}</strong>{' '}
                    {t(
                      'عدد البروتونات هو الرقم الذري الذي يحدد اسم ونوع العنصر بشكل قاطع كالهوية الوطنية: 1 بروتون = هيدروجين، 6 = كربون، 79 = ذهب!',
                      'The proton count (Z) uniquely identifies the element like an ID number: 1 proton = Hydrogen, 6 = Carbon, 79 = Gold!'
                    )}
                  </p>
                </div>

                <div className={`border p-4 rounded-2xl space-y-2 ${isDark ? 'bg-slate-800/60 border-slate-600/50' : 'bg-slate-100 border-slate-300'}`}>
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block" />
                    <span>{t('النيوترونات (n⁰) - متعادلة (0)', 'Neutrons (n⁰) - Neutral (0)')}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">{t('غراء النواة النووي:', 'Nuclear Glue:')}</strong>{' '}
                    {t(
                      'البروتونات تتنافر كهربائياً بشدة. تعمل النيوترونات كغراء يربط النواة بالقوة النووية الشديدة، ويحدد نظير العنصر واستقراره.',
                      'Protons repel each other electrostatically. Neutrons provide the strong nuclear force glue that binds the nucleus and dictates isotope stability.'
                    )}
                  </p>
                </div>

                <div className={`border p-4 rounded-2xl space-y-2 ${isDark ? 'bg-blue-950/40 border-blue-500/40' : 'bg-blue-50/60 border-blue-200'}`}>
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500/50" />
                    <span>{t('الإلكترونات (e⁻) - شحنة سالبة (-1)', 'Electrons (e⁻) - Charge (-1)')}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-blue-400">{t('حارس التفاعلات:', 'Chemical Reactivity:')}</strong>{' '}
                    {t(
                      'تدور في مدارات طاقة كمية (K, L, M, N). عددها يحدد الشحنة الكلية والتكافؤ وتكوين الروابط الكيميائية مع الذرات المجاورة.',
                      'Orbit in quantized electron shells (K, L, M...). Their valence count dictates ionization charge and chemical bonding behavior.'
                    )}
                  </p>
                </div>
              </div>

              {/* Quantum Shells & Capacity */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>{t('مستويات الطاقة الكمية وسعة المدارات (قاعدة 2n²):', 'Quantum Shell Energy Levels & Capacity (2n² Rule):')}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center" dir="ltr">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">Shell K (n=1)</span>
                    <span className="text-slate-400 text-[11px]">{t('يتسع لـ 2 إلكترون', 'Capacity: 2 e⁻')}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">Shell L (n=2)</span>
                    <span className="text-slate-400 text-[11px]">{t('يتسع لـ 8 إلكترونات', 'Capacity: 8 e⁻')}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">Shell M (n=3)</span>
                    <span className="text-slate-400 text-[11px]">{t('يتسع لـ 18 إلكترون', 'Capacity: 18 e⁻')}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">Shell N (n=4)</span>
                    <span className="text-slate-400 text-[11px]">{t('يتسع لـ 32 إلكترون', 'Capacity: 32 e⁻')}</span>
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t('متى تكون النواة غير مستقرة (مشعة)؟', 'When does a nucleus become unstable (radioactive)?')}</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {t(
                      'إذا كان عدد النيوترونات قليلاً جداً أو كثيراً جداً بالنسبة للبروتونات، تتغلب قوى التنافر وتصبح النواة غير مستقرة، مما يضطرها لإطلاق جسيمات إشعاعية نووية لتصل لحالة الاستقرار!',
                      'When the neutron-to-proton ratio falls outside the valley of stability, electrostatic repulsion overpowers binding energy, prompting spontaneous radioactive disintegration!'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RADIOACTIVE DECAY & HALF-LIFE */}
          {activeCategory === 'decay' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-emerald-400 flex items-center gap-2">
                  <Radiation className="w-5 h-5 text-emerald-400" />
                  <span>{t('النشاط الإشعاعي وعمر النصف (Half-Life T₁/₂)', 'Radioactivity & Half-Life Principles (T₁/₂)')}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {t(
                    'كيف يتحول عنصر إلى عنصر آخر مع مرور الوقت؟ وما هو قانون الاضمحلال الأسي؟',
                    'How does one element transmute into another over time? How does exponential decay work?'
                  )}
                </p>
              </div>

              {/* Microwave Popcorn Analogy */}
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                  <span>🍿</span>
                  <span>{t('تشبيه حبات الفشار في الميكروويف (فهم عمر النصف دون تعقيد):', 'Microwave Popcorn Analogy (Understanding Half-Life Simply):')}</span>
                </div>
                <p className={`text-xs sm:text-sm p-3.5 rounded-xl border leading-relaxed ${
                  isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  {t(
                    'لو وضعت كيساً من حبوب الفشار في الميكروويف: لا يمكنك أبداً التنبؤ أي حبة ذرة ستفرقع أولاً لأن كل فرقعة هي حدث عشوائي بحت! ولكنك تستطيع أن تجزم رياضياً بدقة مذهلة أنه بعد مرور دقيقة واحدة، سيفرقع نصف عدد الحبوب في الكيس تماماً! هذه الدقيقة تسمى في الفيزياء عمر النصف (Half-Life).',
                    'Imagine heating a bag of popcorn: you can never predict exactly which kernel will pop next because individual disintegrations are quantum random events! Yet, statistically, you can know with astonishing precision that after exactly one unit of time, exactly 50% of the kernels will have popped! That exact duration is called the Half-Life (T₁/₂).'
                  )}
                </p>
              </div>

              {/* Real World Applications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>{t('الكربون-14 (عمر النصف: 5,730 سنة):', 'Carbon-14 (Half-Life: 5,730 years):')}</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'يستخدمه علماء الآثار لتحديد عمر المومياوات الفرعونية والأشجار القديمة والمخطوطات التاريخية بدقة متناهية عبر قياس ما تبقى من كربون-14 في العينة.',
                      'Used by archeologists to date ancient organic artifacts, pharaonic mummies, and historical manuscripts up to 50,000 years old by measuring residual C-14.'
                    )}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                    <span>🏥</span>
                    <span>{t('اليود-131 (عمر النصف: 8.02 أيام):', 'Iodine-131 (Half-Life: 8.02 days):')}</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'يستخدم في الطب النووي لعلاج أورام الغدة الدرقية؛ حيث يتحلل سريعاً خلال أيام قليلة دون أن يترك آثاراً إشعاعية طويلة الأمد في جسم المريض.',
                      'Used in targeted nuclear medicine for thyroid cancer therapy; decays within days so patient tissues recover without prolonged radiation exposure.'
                    )}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <span>🚀</span>
                    <span>{t('البولونيوم-210 (عمر النصف: 138.4 يوماً):', 'Polonium-210 (Space RTG Power):')}</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'باعث ألفا مكثف جداً اكتشفته ماري كوري. يُولّد جرام واحد منه 140 واط من الحرارة الذاتية، ويستخدم لتوليد الكهرباء في مركبات الفضاء ومسبارات الكواكب.',
                      'Intense alpha emitter discovered by Marie Curie; 1 gram yields 140 W of thermal heat, powering thermoelectric generators in deep space probes.'
                    )}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-teal-400 text-xs flex items-center gap-1.5">
                    <span>🌱</span>
                    <span>{t('الثوريوم-232 (عمر النصف: 14.05 مليار سنة):', 'Thorium-232 (Green Nuclear Fuel):')}</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'وقود المفاعلات النووية الخضراء للمستقبل. عمر نصفه يفوق عمر الكون المعروف (13.8 مليار سنة)، ويتميز باستحالة الانصهار النووي وإنتاجه نفايات آمنة.',
                      'Green nuclear fuel with a half-life exceeding the age of the universe (14.05 billion years), powering walk-away safe Molten Salt Reactors.'
                    )}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-purple-400 text-xs flex items-center gap-1.5">
                    <span>🩺</span>
                    <span>{t('التكنيشيوم-99m (عمر النصف: 6.01 ساعات):', 'Technetium-99m (Diagnostic Scan King):')}</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'النظير الطبي الأكثر استخداماً في العالم (85% من الفحوصات). باعث غاما نقي دون جسيمات مؤذية، ويختفي إشعاعه من جسم المريض خلال يوم واحد.',
                      'The gold standard in diagnostic medical imaging (85% of scans worldwide). Emits pure 140 keV gamma with a 6-hour half-life for safe diagnosis.'
                    )}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="font-bold text-red-400 text-xs flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>{t('البلوتونيوم-239 (عمر النصف: 24,110 سنة):', 'Plutonium-239 (Fission Energy):')}</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t(
                      'نظير انشطاري فائق الكثافة الطاقية يُستخدم في مفاعلات التوليد السريعة، ينتج طاقة كهربائية تفوق احتراق أطنان الفحم بملايين المرات.',
                      'Key fissile transuranic isotope for fast breeder power reactors, generating millions of times more electrical energy per mass than fossil fuels.'
                    )}
                  </p>
                </div>
              </div>

              {/* Decay Formula Explained */}
              <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="font-bold text-cyan-300 text-xs block">
                  {t('📐 القانون الرياضي الأسي للاضمحلال الإشعاعي:', '📐 Exponential Radioactive Decay Equation:')}
                </span>
                <div className="font-mono text-center bg-slate-950 py-2 rounded-xl border border-slate-800 text-emerald-400 font-bold text-sm" dir="ltr">
                  N(t) = N₀ × (1/2)^(t / T₁/₂)
                </div>
                <p className="text-xs text-slate-400 text-center">
                  {t(
                    'كلما انقضى عمر نصف واحد، يتبقى 50% من الذرات، بعد عمرين يتبقى 25%، ثم 12.5%، وهكذا أبدياً!',
                    'After 1 half-life, 50% remains; after 2 half-lives, 25% remains; after 3, 12.5% remains in an asymptotic exponential curve!'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: HANDS-ON MISSIONS & LAB EXPERIMENTS */}
          {activeCategory === 'missions' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>{t('تحديات ومهمات عملية مقترحة للتطبيق في المحاكي', 'Hands-On Missions & Experiments to Try in the Simulator')}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {t(
                    'قم بتطبيق هذه التجارب بنفسك الآن في المحاكي ولاحظ النتائج العلمية المباشرة:',
                    'Execute these experiments step-by-step in the interactive simulator and observe the physical results:'
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {/* Mission 1 */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 font-black shrink-0 text-sm">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-purple-400">
                      {t('تحدي فقاعة الماء الكونية في محطة الفضاء (Zero-G Water Sphere)', 'Challenge: Zero-G Water Sphere (Space Station Physics)')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'اختر مادة الماء (H₂O) عند حرارة 300 K، ثم اضغط على زر انعدام وزن (🚀). الملاحظة: شاهد كيف تتجمع الجزيئات تلقائياً في كرة مائية معلقة تطوف في منتصف الوعاء بفعل التوتر السطحي!',
                        'Select Water (H₂O) at 300 K, then click Zero-G (🚀). Observation: Watch molecules coalesce into a floating liquid sphere suspended in mid-air due to surface tension!'
                      )}
                    </p>
                  </div>
                </div>

                {/* Mission 2 */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-black shrink-0 text-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-cyan-400">
                      {t('تحدي قدر الضغط وتسييل الغاز دون تبريد (Pressure Liquefaction)', 'Challenge: Pressure Liquefaction without Cooling')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'سخن الماء إلى 390 K حتى يملأ البخار الوعاء. الآن، اسحب المكبس للأسفل حتى 25% لرفع الضغط فوق 3.5 Atm. الملاحظة: ستشاهد تكاثف البخار إلى قطرات سائلة رغماً عن حرارته العالية!',
                        'Heat water to 390 K until it vaporizes. Then push the piston down to 25% volume to raise pressure above 3.5 Atm. Observation: Steam condenses into liquid despite being hot!'
                      )}
                    </p>
                  </div>
                </div>

                {/* Mission 3 */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-300 font-black shrink-0 text-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-amber-400">
                      {t('تحدي تسامي الجليد الجاف (CO₂ Sublimation)', 'Challenge: Dry Ice Sublimation (CO₂ Direct Phase Change)')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'اختر ثاني أكسيد الكربون (CO₂)، واضغط زر صلب 🧊 ثم سخّنه ببطء فوق 195 K عند ضغط جوي عادي. الملاحظة: لن ترى أي قطرة سائل! الجليد الصلب يتحول فوراً لدخان غازي متطاير.',
                        'Select Carbon Dioxide (CO₂), choose Solid 🧊, and heat above 195 K at 1 Atm. Observation: No liquid puddle forms! Solid dry ice sublimes straight into vapor.'
                      )}
                    </p>
                  </div>
                </div>

                {/* Mission 4 */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-black shrink-0 text-sm">
                    4
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-emerald-400">
                      {t('تحدي بناء ذرة النيتروجين أو الذهب المستقر', 'Challenge: Building Stable Nitrogen or Gold')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'انتقل إلى قسم بناء الذرة، وضع 7 بروتونات و 7 نيوترونات و 7 إلكترونات لبناء ذرة النيتروجين المستقرة. ثم جرّب إزالة كل النيوترونات وشاهد كيف تضطرب النواة ويحذرك المحاكي!',
                        'Switch to Atom Builder, assemble 7 protons, 7 neutrons, and 7 electrons for stable Nitrogen-14. Then remove neutrons to watch the nucleus vibrate under radioactive instability!'
                      )}
                    </p>
                  </div>
                </div>

                {/* Mission 5: Peroxide Oxygen Volcano */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-pink-950 border border-pink-500/50 flex items-center justify-center text-pink-300 font-black shrink-0 text-sm">
                    5
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-pink-400">
                      {t('تحدي بركان الأكسجين ومعجون الفيل (H₂O₂ + المحفز)', 'Challenge: Oxygen Volcano & Elephant Toothpaste (H₂O₂ Catalysis)')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'في معمل التجارب: أضف 15 مل من ماء الأكسجين H₂O₂، ثم أضف بلورات برمنغنات البوتاسيوم KMnO₄ أو برادة الحديد Fe. الملاحظة: يحدث تفكك حفزي عنيف يطلق فقاعات غاز الأكسجين O₂ الصافي ويرفع الحرارة فورياً لأكثر من 65°C!',
                        'In Experimental Lab: Add 15 mL H₂O₂, then add KMnO₄ crystals or Fe iron filings. Observation: Instant catalytic decomposition furiously releases pure O₂ bubbles and drives temperature past 65°C!'
                      )}
                    </p>
                  </div>
                </div>

                {/* Mission 6: Silver Chloride Precipitation */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-white font-black shrink-0 text-sm">
                    6
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-200">
                      {t('تحدي كشف الكلوريد الكيميائي بنترات الفضة (AgCl)', 'Challenge: Qualitative Chloride Test (AgNO₃ + Cl⁻)')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'في معمل التجارب: ضع حمض الهيدروكلوريك HCl أو ملح CaCl₂، ثم اسكب قطرات من نترات الفضة AgNO₃. الملاحظة: يتكون فوراً راسب كلوريد الفضة الأبيض الحليبي الشهير غير القابل للذوبان في الماء!',
                        'In Experimental Lab: Add dilute HCl or CaCl₂, then pour drops of AgNO₃ silver nitrate. Observation: Dense milky white insoluble AgCl precipitate forms instantly!'
                      )}
                    </p>
                  </div>
                </div>

                {/* Mission 7: Royal Navy Copper-Ammonia Complex */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-300 font-black shrink-0 text-sm">
                    7
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-blue-400">
                      {t('تحدي معقد النحاس الأمينياتي الأزرق النيلي الملكي', 'Challenge: Royal Navy Tetraamminecopper(II) Complex')}
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        'في معمل التجارب: أضف كبريتات النحاس الزرقاء CuSO₄ ثم أضف محلول الأمونيا NH₄OH. الملاحظة: يتحول اللون السماوي فورياً إلى أزرق نيلي داكن ملكي ساحر لتشكل معقد التناسق [Cu(NH₃)₄]²⁺!',
                        'In Experimental Lab: Add blue CuSO₄ solution then add ammonia NH₄OH. Observation: The sky-blue fluid dramatically transforms into an intense, deep royal navy coordination complex [Cu(NH₃)₄]²⁺!'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            {t('نصيحة: يمكنك النقر على مقياس الأطوار في أي وقت لقفز الحرارة فورياً!', 'Tip: Click any phase scale mark anytime to jump temperatures instantly!')}
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2"
          >
            <span>{t('فهمت كل شيء، عودة للمحاكي', 'Got it, return to simulator')}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
