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
  Zap,
  Globe2,
  Layers,
  Thermometer,
  ShieldAlert
} from 'lucide-react';

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
  const [activeCategory, setActiveCategory] = useState<'basics' | 'states' | 'atoms' | 'decay' | 'missions'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm shadow-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>الموسوعة والدليل العلمي التفاعلي المبسط</span>
                <span className="text-[11px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 hidden sm:inline-block">
                  من الصفر حتى الاحتراف
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                شرح كل ظاهرة فيزيائية وكيميائية بتشبيهات يومية وأمثلة واقعية يفهمها الجميع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            title="إغلاق الدليل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Navigation Bar */}
        <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold no-scrollbar">
            <button
              onClick={() => setActiveCategory('basics')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'basics'
                  ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🐣</span>
              <span>مقدمة المبتدئين (من الصفر)</span>
            </button>

            <button
              onClick={() => setActiveCategory('states')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'states'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>أسرار حالات المادة والضغط</span>
            </button>

            <button
              onClick={() => setActiveCategory('atoms')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'atoms'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>بنية الذرة والجدول الدوري</span>
            </button>

            <button
              onClick={() => setActiveCategory('decay')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'decay'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Radiation className="w-3.5 h-3.5" />
              <span>عمر النصف والإشعاع</span>
            </button>

            <button
              onClick={() => setActiveCategory('missions')}
              className={`px-3 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'missions'
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>مهمات وتجارب عملية</span>
            </button>
          </div>

          {/* Quick Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث عن مفهوم (مثل: الضغط، بويل، كربون)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 leading-relaxed text-slate-200">
          {/* TAB 1: BEGINNER BASICS (من الصفر بتشبيهات يومية) */}
          {activeCategory === 'basics' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
                  <span>💡 ما هي الذرة والمادة؟ تخيل أن الكون مبني من مكعبات ليغو مجهرية!</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  كل شيء تراه أو تلمسه حولك — الهواء الذي تتنفسه، الماء الذي تشربه، شاشة هاتفك، وحتى خلايا جسدك — كلها تتكون من لبنات بناء صغيرة جداً لا تُرى حتى بأقوى المجاهر العادية تسمى <strong>الذرات (Atoms)</strong>.
                </p>
              </div>

              {/* Analogy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Analogy 1: Football Stadium Atom */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <span>🏟️</span>
                    <span>تشبيه ملعب كرة القدم (كم يبلغ حجم الذرة؟):</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    لو كبّرنا الذرة لتصبح بحجم <strong>استاد كرة قدم ضخم</strong>:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <li><strong className="text-cyan-300">النواة:</strong> ستكون في منتصف الملعب تماماً بحجم <em>حبة بازلاء أو خرزة صغيرة</em>!</li>
                    <li><strong className="text-blue-300">الإلكترونات:</strong> حشرات مجهرية سريعة جداً تطير حول أعلى صفوف مدرجات الملعب!</li>
                    <li><strong className="text-amber-300">المفاجأة العلمية:</strong> باقي الملعب بالكامل (99.99999%) عبارة عن <em>فراغ محض</em>! الذرة معظمها فراغ!</li>
                  </ul>
                </div>

                {/* Analogy 2: Heat as a Dance Party */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <span>🕺</span>
                    <span>ما هي الحرارة حقاً؟ (ليست سائلاً سحرياً!):</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    كثير من الناس يظنون أن الحرارة مادة تضاف، لكن في الفيزياء الحرارة هي ببساطة <strong>سرعة رقص واهتزاز الجزيئات</strong>:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <li><strong className="text-blue-300">البرد القارس (الصلب):</strong> الجزيئات تمسك أيدي بعضها بإحكام، وتهتز فقط في مكانها دون أن تفلت.</li>
                    <li><strong className="text-cyan-300">الحرارة المعتدلة (السائل):</strong> تفلت الأيدي قليلاً وتنزلق الجزيئات فوق بعضها مثل ممر المشاة المزدحم.</li>
                    <li><strong className="text-orange-300">الحرارة العالية (الغاز):</strong> تركض الجزيئات بسرعة جنونية وتطير في كل الاتجاهات وتصطدم بالجدران!</li>
                  </ul>
                </div>

                {/* Analogy 3: Pressure as Tennis Balls */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span>🎾</span>
                    <span>ما هو الضغط (Pressure)؟:</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تخيل غرفة مغلقة بداخلها 100 شخص يقذفون كرات تنس بسرعة هائلة نحو الجدران باستمرار:
                  </p>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                    كل ضربة كرة على الجدار هي دفعة صغيرة. مجموع مليارات الضربات في الثانية الواحدة هو ما نسميه <strong>الضغط</strong>! إذا صغّرت حجم الغرفة (كبست المكبس)، أو زدت سرعة الكرات (رفعت الحرارة)، ستضرب الكرات الجدران بمعدل أكبر، وسيقفز مؤشر الضغط عالياً!
                  </p>
                </div>

                {/* Analogy 4: Absolute Zero (0 Kelvin) */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <span>❄️</span>
                    <span>الصفر المطلق (0 Kelvin = -273.15 °C):</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    هل يمكن أن تبرد الأشياء إلى ما لا نهاية؟ الإجابة: <strong>لا!</strong>
                  </p>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                    بما أن الحرارة هي حركة الجزيئات، فهناك حد أدنى تتوقف عنده الجزيئات عن الحركة تماماً وتسكن كلياً! هذا الحد يسمى <strong>الصفر المطلق (0 كلفن)</strong>، ولا يمكن لأي شيء في الكون أن يكون أبرد منه أبداً.
                  </p>
                </div>
              </div>

              {/* Quick FAQ Accordion / Cards */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>أسئلة شائعة يجيب عنها هذا المحاكي:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">❓ لماذا يطفو الماء ككرة سحرية في الفضاء؟</span>
                    <span className="text-slate-400">لأنه في غياب الجاذبية تسحبه قوى التوتر السطحي لأقل مساحة سطح ممكنة وهي الكرة!</span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">❓ لماذا يطهى اللحم بسرعة في قدر الضغط؟</span>
                    <span className="text-slate-400">لأن حبس البخار يرفع الضغط، والضغط العالي يمنع الماء من التبخر حتى يصل إلى 120 مئوية بدلاً من 100!</span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">❓ لماذا لا يذوب الجليد الجاف (CO₂) إلى ماء؟</span>
                    <span className="text-slate-400">لأنه يتسامى مباشرة من صلب إلى غاز، ويحتاج ضغطاً هائلاً (أكثر من 5.1 ضغط جوي) لكي يصبح سائلاً!</span>
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">❓ ما هو المعدن الوحيد السائل في غرفتنا؟</span>
                    <span className="text-slate-400">إنه الزئبق (Hg)، روابطه المعدنية فريدة تجعله يذوب عند -38 درجة مئوية ويبقى سائلاً كثيفاً!</span>
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
                  <span>حالات المادة الثلاث وقوانين الغازات والضغط والجاذبية</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  شرح علمي لكيفية تأثير درجة الحرارة (T)، والضغط (P)، والحجم (V)، وقوة الجاذبية (g) على المادة وسلوكها الحركي.
                </p>
              </div>

              {/* The Three States Table / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-950/40 border border-blue-500/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-black text-sm">الحالة الصلبة (Solid)</span>
                    <span className="text-xl">🧊</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li><strong>الشكل والحجم:</strong> ثابتان ومحددان.</li>
                    <li><strong>حركة الجزيئات:</strong> اهتزاز موضعي حول مراكز اتزان ثابتة.</li>
                    <li><strong>قوى التماسك:</strong> قوية جداً تقاوم التفكك.</li>
                    <li><strong>تأثير الحرارة:</strong> التسخين يكسبها طاقة لتكسير الروابط (الانصهار).</li>
                  </ul>
                </div>

                <div className="bg-cyan-950/40 border border-cyan-500/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-black text-sm">الحالة السائلة (Liquid)</span>
                    <span className="text-xl">💧</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li><strong>الشكل والحجم:</strong> تأخذ شكل الوعاء مع حجم شبه ثابت.</li>
                    <li><strong>حركة الجزيئات:</strong> انسيابية وانزلاقية حرّة ومائعة.</li>
                    <li><strong>قوى التماسك:</strong> متوسطة تسمح بالتدفق والتوتر السطحي.</li>
                    <li><strong>تأثير الحرارة:</strong> التسخين يفلت الجزيئات السطحية (التبخر والغليان).</li>
                  </ul>
                </div>

                <div className="bg-orange-950/40 border border-orange-500/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-black text-sm">الحالة الغازية (Gas)</span>
                    <span className="text-xl">💨</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li><strong>الشكل والحجم:</strong> تتمدد لتملأ أي وعاء بالكامل.</li>
                    <li><strong>حركة الجزيئات:</strong> عشوائية وفائقة السرعة في كافة الأبعاد.</li>
                    <li><strong>قوى التماسك:</strong> تكاد تكون منعدمة بين الجزيئات.</li>
                    <li><strong>تأثير الضغط:</strong> قابلة للانضغاط بدرجة كبيرة جداً.</li>
                  </ul>
                </div>
              </div>

              {/* Deep Dive: Pressure & Boyle's Law */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  <span>تأثير الضغط والمكبس: قوانين بويل وكلاوزيوس-كلابيرون</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/70 space-y-1.5">
                    <strong className="text-cyan-300 font-bold block">1. قانون بويل (Boyle's Law - العلاقة العكسية):</strong>
                    <p className="text-slate-400 leading-relaxed">
                      عند ثبات درجة الحرارة، يتناسب ضغط الغاز عكسياً مع حجمه:
                    </p>
                    <div className="font-mono text-center bg-slate-950 py-1.5 rounded-lg border border-slate-800 text-cyan-400 font-bold">
                      P₁ × V₁ = P₂ × V₂
                    </div>
                    <p className="text-slate-400">
                      كلما أنزلت المكبس لتقليل حجم الوعاء بمقدار النصف، تضاعف عدد اصطدامات الجزيئات بالجدران وتضاعف الضغط الداخلي!
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/70 space-y-1.5">
                    <strong className="text-orange-300 font-bold block">2. التكاثف بالضغط (Pressure Liquefaction):</strong>
                    <p className="text-slate-400 leading-relaxed">
                      لماذا يتحول البخار إلى ماء عند كبسه بالمكبس؟
                    </p>
                    <div className="font-mono text-center bg-slate-950 py-1.5 rounded-lg border border-slate-800 text-orange-400 font-bold">
                      ↑ الضغط (P) ⟸ ↑ نقطة الغليان (T_b)
                    </div>
                    <p className="text-slate-400">
                      وفق علاقة كلاوزيوس-كلابيرون، الضغط العالي يقرب الجزيئات ويدعم قوى التجاذب، مما يرفع درجة الغليان ويجعل الغاز يسيل فوراً!
                    </p>
                  </div>
                </div>
              </div>

              {/* Deep Dive: Gravity in Action */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>تأثير الجاذبية الأرضية والكونية على الموائع</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-cyan-300 block mb-1">🌍 جاذبية الأرض (1.0 g):</span>
                    <p className="text-slate-400">
                      تسحب السائل ليستقر أفقياً في قاع الإناء، وتشكل تدرجاً ضغطياً طبيعياً يكون فيه الضغط أعلى عند القاع.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-orange-300 block mb-1">🪐 جاذبية المشتري (2.5 g):</span>
                    <p className="text-slate-400">
                      قوة ساحقة تسطح السائل تماماً، وتجبر حتى جزيئات الغاز على التجمع بكثافة شديدة في الجزء السفلي.
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-purple-300 block mb-1">🚀 انعدام الوزن (Zero-G):</span>
                    <p className="text-slate-400">
                      تختفي قوة السحب نحو القاع! فتسود قوى <strong>التوتر السطحي</strong> وتجذب الجزيئات لتشكل <em>كرة مائية طافية معلقة في المنتصف</em>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Added Elements Explained */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>المواد والعناصر المضافة حديثاً في المحاكي:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-cyan-300 block">🧪 الزئبق (Hg)</span>
                    <span className="text-[11px] text-slate-400">المعدن السائل الوحيد عند حرارة الغرفة القياسية بكثافة عالية وتماسك معدني فريد.</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-yellow-300 block">🎈 الهيليوم (He)</span>
                    <span className="text-[11px] text-slate-400">أقل نقطة غليان في الكون (4.2 K)، غاز نبيل خفيف وسريع جداً.</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-200 block">🧊 ثاني أكسيد الكربون (CO₂)</span>
                    <span className="text-[11px] text-slate-400">يتسامى مباشرة كجليد جاف دون سائل ما لم يتجاوز الضغط 5.1 ض.ج.</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-orange-400 block">🛡️ الحديد (Fe)</span>
                    <span className="text-[11px] text-slate-400">شبكة بلورية فلزية شديدة التماسك بدرجة انصهار تتجاوز 1800 كلفن.</span>
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
                  <span>دليل بناء الذرة الشامل والجدول الدوري (العناصر الـ 118)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  كيف تبنى النواة؟ ومن أين تكتسب المادة خصائصها الكيميائية والفيزيائية؟
                </p>
              </div>

              {/* Particle Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
                    <span>البروتونات (p⁺) - شحنة موجبة (+1)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>هوية العنصر:</strong> عدد البروتونات (العدد الذري Z) يحدد نوع العنصر تماماً كرقم الهوية الوطنية. 1 بروتون = هيدروجين، 6 = كربون، 79 = ذهب!
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-600/50 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block" />
                    <span>النيوترونات (n⁰) - متعادلة (0)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>غراء النواة:</strong> البروتونات موجبة وتتنافر كهربائياً بشدة. النيوترونات تعمل كحاجز وغراء يربط النواة بالقوة النووية الشديدة، وتحدد النظير واستقراره.
                  </p>
                </div>

                <div className="bg-blue-950/40 border border-blue-500/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block shadow-sm shadow-blue-500/50" />
                    <span>الإلكترونات (e⁻) - شحنة سالبة (-1)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>حارس التفاعلات:</strong> تدور في مدارات طاقة كمية (K, L, M, N...). عددها يحدد الشحنة الكلية والتكافؤ وتكوين الروابط الكيميائية مع الذرات المجاورة.
                  </p>
                </div>
              </div>

              {/* Quantum Shells & Stability Rules */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>مستويات الطاقة الكمية وسعة المدارات (قاعدة 2n²):</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">المستوى K (n=1)</span>
                    <span className="text-slate-400 text-[11px]">يتسع لـ 2 إلكترون</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">المستوى L (n=2)</span>
                    <span className="text-slate-400 text-[11px]">يتسع لـ 8 إلكترونات</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">المستوى M (n=3)</span>
                    <span className="text-slate-400 text-[11px]">يتسع لـ 18 إلكترون</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-bold block">المستوى N (n=4)</span>
                    <span className="text-slate-400 text-[11px]">يتسع لـ 32 إلكترون</span>
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>متى تكون النواة غير مستقرة (مشعة)؟</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    إذا كان عدد النيوترونات قليلاً جداً أو كثيراً جداً بالنسبة للبروتونات، تتغلب قوى التنافر الكهروستاتيكي وتصبح النواة غير مستقرة، مما يضطرها لإطلاق إشعاع نووي لتصل إلى حالة الاستقرار!
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
                  <span>النشاط الإشعاعي وعمر النصف (Half-Life T₁/₂)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  كيف يتحول عنصر إلى عنصر آخر مع مرور الوقت؟ وما هو قانون الاضمحلال الأسي؟
                </p>
              </div>

              {/* Popcorn Analogy Card */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                  <span>🍿</span>
                  <span>تشبيه حبات الفشار في الميكروويف (كيف تفهم عمر النصف دون معادلات معقدة؟):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                  لو وضعت كيساً من حبوب الفشار في الميكروويف:
                  <br />
                  لا يمكنك أبداً التنبؤ <strong>أي حبة ذرة ستفرقع أولاً</strong> لأن كل فرقعة هي حدث عشوائي بحت!
                  ولكنك تستطيع أن تجزم رياضياً بدقة مذهلة أنه بعد مرور <strong>دقيقة واحدة</strong>، سيفرقع نصف عدد الحبوب في الكيس تماماً!
                  هذه الدقيقة تسمى في الفيزياء <strong>عمر النصف (Half-Life)</strong>.
                </p>
              </div>

              {/* Real World Applications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>الكربون-14 (عمر النصف: 5,730 سنة):</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يستخدمه علماء الآثار لتحديد عمر المومياوات الفرعونية والأشجار القديمة والمخطوطات التاريخية بدقة متناهية عبر قياس ما تبقى من كربون-14 في العينة.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                    <span>🏥</span>
                    <span>اليود-131 (عمر النصف: 8 أيام):</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    يستخدم في الطب النووي لعلاج وتشخيص أورام الغدة الدرقية؛ حيث يتحلل سريعاً خلال أيام قليلة دون أن يترك آثاراً إشعاعية طويلة الأمد في جسم المريض.
                  </p>
                </div>
              </div>

              {/* Decay Formula Explained simply */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 text-xs block">
                  📐 القانون الرياضي الأسي للاضمحلال:
                </span>
                <div className="font-mono text-center bg-slate-900 py-2 rounded-xl border border-slate-800 text-emerald-400 font-bold text-sm">
                  N(t) = N₀ × (1/2)^(t / T₁/₂)
                </div>
                <p className="text-xs text-slate-400 text-center">
                  كلما مر عمر نصف واحد، يتبقى 50% من الذرات الأصلية، بعد اثنين يتبقى 25%، بعد ثلاثة 12.5%، وهكذا!
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: HANDS-ON MISSIONS & EXPERIMENTS */}
          {activeCategory === 'missions' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 p-4 sm:p-5 rounded-2xl">
                <h3 className="text-base sm:text-lg font-black text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>تحديات ومهمات عملية مقترحة للتطبيق في المحاكي!</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  قم بتطبيق هذه التجارب بنفسك الآن في المحاكي ولاحظ النتائج العلمية المباشرة:
                </p>
              </div>

              <div className="space-y-3">
                {/* Mission 1 */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 font-black shrink-0 text-sm">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs sm:text-sm">
                      تحدي فقاعة الماء الكونية في محطة الفضاء (Zero-G Water Sphere)
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      اختر مادة <strong>الماء (H₂O)</strong> عند درجة حرارة <strong>300 K</strong> (حالة سائلة)، ثم اضغط على زر <strong>انعدام وزن (🚀)</strong>.
                      <br />
                      <span className="text-purple-300 font-semibold">الملاحظة:</span> شاهد كيف تتجمع كل الجزيئات تلقائياً في كرة مائية معلقة تطوف في منتصف الوعاء بفضل قوى التوتر السطحي والتجاذب البيني!
                    </p>
                  </div>
                </div>

                {/* Mission 2 */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-black shrink-0 text-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs sm:text-sm">
                      تحدي قدر الضغط وتسييل الغاز دون تبريد (Pressure Liquefaction)
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      سخن الماء إلى <strong>390 K</strong> حتى يصبح غازاً حاراً يملأ الوعاء. الآن، اسحب المكبس للأسفل حتى <strong>25%</strong> لرفع الضغط فوق 3.5 ضغط جوي.
                      <br />
                      <span className="text-cyan-300 font-semibold">الملاحظة:</span> سترى إشعاراً علمياً بحدوث <em>التكاثف بالضغط</em>، وستتقارب الجزيئات لتتحول إلى قطرات سائلة رغماً عن حرارتها العالية!
                    </p>
                  </div>
                </div>

                {/* Mission 3 */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-300 font-black shrink-0 text-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs sm:text-sm">
                      تحدي تسامي الجليد الجاف (CO₂ Sublimation)
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      اختر <strong>ثاني أكسيد الكربون (CO₂)</strong>، واضغط زر <strong>صلب 🧊</strong> ثم سخّنه ببطء فوق 195 K عند ضغط جوي قياسي.
                      <br />
                      <span className="text-amber-300 font-semibold">الملاحظة:</span> لن ترى أي قطرة سائل! الجليد الصلب سيتحول مباشرة إلى دخان غازي طائر (تسامي). إذا أردت تحويله لسائل، عليك رفع الضغط فوق 5.1 ض.ج!
                    </p>
                  </div>
                </div>

                {/* Mission 4 */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-black shrink-0 text-sm">
                    4
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs sm:text-sm">
                      تحدي بناء ذرة الذهب أو النيتروجين المستقر
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      انتقل إلى قسم <strong>بناء الذرة</strong>، وضع 7 بروتونات و 7 نيوترونات و 7 إلكترونات لبناء ذرة <strong>النيتروجين المستقر</strong>. ثم جرّب إزالة كل النيوترونات وشاهد كيف تهتز النواة وتحذرك من عدم الاستقرار النووي!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            نصيحة: يمكنك النقر على مقياس الأطوار في أي وقت لقفز الحرارة فورياً!
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2"
          >
            <span>فهمت كل شيء، عودة للمحاكي</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
