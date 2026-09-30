export type GuideCategory = 'basics' | 'states' | 'atoms' | 'decay' | 'missions';
type Bilingual = { ar: string; en: string };
export interface ScienceArticle {
  id: string;
  category: GuideCategory;
  title: Bilingual;
  body: Bilingual;
  takeaway: Bilingual;
  formula?: string;
  source: 'quantum' | 'phases' | 'nuclear';
}

export const scienceSources = {
  quantum: { name: 'OpenStax · Development of Quantum Theory', url: 'https://openstax.org/books/chemistry-2e/pages/6-3-development-of-quantum-theory' },
  phases: { name: 'OpenStax · Phase Transitions', url: 'https://openstax.org/books/chemistry-2e/pages/10-3-phase-transitions' },
  nuclear: { name: 'OpenStax · Radioactive Decay', url: 'https://openstax.org/books/chemistry-2e/pages/21-3-radioactive-decay' },
};

export const scienceArticles: ScienceArticle[] = [
  {
    id: 'heat-temperature', category: 'basics', source: 'phases',
    title: { ar: 'الحرارة ليست درجة الحرارة', en: 'Heat is not temperature' },
    body: { ar: 'درجة الحرارة تصف الحالة الحرارية للمادة. أما الحرارة فهي طاقة تنتقل بسبب فرق درجة الحرارة. في الغاز المثالي ترتبط درجة الحرارة بمتوسط طاقة الحركة الانتقالية للجسيمات. قد يحوي حوض ماء دافئ طاقة داخلية أكبر من كوب ساخن لأن كمية المادة أكبر.', en: 'Temperature describes thermal state. Heat is energy transferred because of a temperature difference. In an ideal gas, temperature tracks average translational kinetic energy. A warm bath can contain more internal energy than a hot cup because it contains more matter.' },
    takeaway: { ar: 'في المحاكي، رفع درجة الحرارة يغيّر الحركة؛ مقدار الطاقة الحقيقي يعتمد أيضًا على الكتلة والسعة الحرارية.', en: 'Raising temperature changes motion. Actual energy changes also depend on mass and heat capacity.' },
    formula: String.raw`$Q = mc\,\Delta T$`,
  },
  {
    id: 'absolute-zero', category: 'basics', source: 'quantum',
    title: { ar: 'الصفر المطلق وطاقة النقطة الصفرية', en: 'Absolute zero and zero-point energy' },
    body: { ar: 'الصفر المطلق يساوي −273.15 درجة مئوية. عند الاقتراب منه تُزال الإثارات الحرارية، لكن لا يصح القول إن كل الجسيمات تتوقف تمامًا: قد تبقى طاقة وحركة كمومية في الحالة الأرضية. المحاكاة الكلاسيكية هنا لا تحسب هذه التأثيرات.', en: 'Absolute zero is −273.15 °C. Thermal excitations diminish as a system approaches it, but particles do not necessarily become perfectly still: quantum ground states can retain zero-point energy and motion. This classical simulator does not calculate those effects.' },
    takeaway: { ar: 'استخدم كلفن في قوانين الغازات، وليس الدرجة المئوية.', en: 'Use kelvin, not degrees Celsius, in gas-law calculations.' },
    formula: String.raw`$T_{\mathrm K} = T_{\mathrm{^{\circ}C}} + 273.15$`,
  },
  {
    id: 'model-limits', category: 'basics', source: 'quantum',
    title: { ar: 'كيف تقرأ المشهد ثلاثي الأبعاد؟', en: 'How should you read the 3D view?' },
    body: { ar: 'الكرات والألوان أدوات تمثيل وليست صورًا حقيقية للذرات. أحجام النواة والإلكترونات والمسافات بينها غير مرسومة بمقياس موحد. عمق المشهد يوضح البنية، لكنه لا يحوّل النموذج إلى حساب كمي أو محاكاة ديناميكا جزيئية معايرة.', en: 'Spheres and colors are visual conventions, not photographs of atoms. Nuclei, electrons and distances are not drawn to a common scale. Depth helps explain structure; it does not turn the model into a quantum calculation or calibrated molecular-dynamics simulation.' },
    takeaway: { ar: 'اسحب المشهد للدوران، ومرّر للتكبير. تجميد العرض لا يوقف الحسابات أو القراءات.', en: 'Drag to orbit and scroll to zoom. Freezing the view does not stop calculations or readings.' },
  },
  {
    id: 'latent-heat', category: 'states', source: 'phases',
    title: { ar: 'الحرارة الكامنة: طاقة بلا ارتفاع في الحرارة', en: 'Latent heat: energy without a temperature rise' },
    body: { ar: 'عندما تنصهر مادة نقية في حالة اتزان وعند ضغط ثابت، تُستخدم الطاقة لتغيير ترتيب الجسيمات والتغلب جزئيًا على قوى التجاذب بينها، لا لرفع درجة الحرارة. يظهر ذلك كجزء أفقي على منحنى التسخين. بعد اكتمال التحول ترتفع درجة الحرارة من جديد.', en: 'When a pure substance melts at equilibrium and constant pressure, added energy changes particle arrangement and partially overcomes attractions rather than raising temperature. A heating curve develops a plateau. Temperature rises again after the phase change finishes.' },
    takeaway: { ar: 'الجليد والماء يمكن أن يتواجدا معًا قرب 0 °C عند الضغط الجوي. المحاكي يبسّط عملية التحول ولا يحسب الحرارة الكامنة تفصيليًا.', en: 'Ice and water can coexist near 0 °C at atmospheric pressure. The simulator simplifies transitions rather than solving latent heat in detail.' },
    formula: String.raw`$Q = mL$`,
  },
  {
    id: 'evaporation-boiling', category: 'states', source: 'phases',
    title: { ar: 'لماذا التبخر مختلف عن الغليان؟', en: 'Why are evaporation and boiling different?' },
    body: { ar: 'يحدث التبخر عند السطح حتى دون الوصول لدرجة الغليان. أما الغليان فيحدث عندما يصبح ضغط البخار مساويًا للضغط المحيط، فتستطيع فقاعات البخار النمو داخل السائل. لذلك يغلي الماء عند حرارة أقل في المرتفعات، وعند حرارة أعلى في قدر الضغط.', en: 'Evaporation occurs at the surface even below boiling temperature. Boiling occurs when vapor pressure equals surrounding pressure, allowing vapor bubbles to grow throughout the liquid. Water therefore boils at a lower temperature at altitude and a higher temperature in a pressure cooker.' },
    takeaway: { ar: 'الغليان عند حرارة الغرفة يحتاج ضغطًا منخفضًا جدًا؛ ضغط 0.2 atm وحده لا يجعل ماء 25 °C يغلي.', en: 'Room-temperature boiling needs a very low pressure; 0.2 atm alone does not make 25 °C water boil.' },
  },
  {
    id: 'hydrogen-bonds', category: 'states', source: 'phases',
    title: { ar: 'الروابط الهيدروجينية وشكل جزيء الماء', en: 'Hydrogen bonds and the shape of water' },
    body: { ar: 'جزيء الماء منحنٍ، وزاوية الرابطة فيه نحو 104.5°. الروابط التساهمية تربط الأكسجين بالهيدروجين داخل الجزيء، أما الروابط الهيدروجينية فتربط الجزيئات ببعضها. الشبكة الأكثر انفتاحًا في الجليد العادي تجعله أقل كثافة من الماء السائل.', en: 'A water molecule is bent, with a bond angle near 104.5°. Covalent bonds join oxygen and hydrogen within each molecule, while hydrogen bonds attract different molecules. The more open structure of ordinary ice makes it less dense than liquid water.' },
    takeaway: { ar: 'عند غليان الماء لا تتفكك جزيئاته إلى أكسجين وهيدروجين؛ تتغير المسافات والتجاذبات بين الجزيئات.', en: 'Boiling water does not split its molecules into oxygen and hydrogen; it changes intermolecular separation and attractions.' },
  },
  {
    id: 'gas-laws', category: 'states', source: 'phases',
    title: { ar: 'المكبس وقانون الغاز المثالي', en: 'The piston and the ideal gas law' },
    body: { ar: 'لغاز مثالي وبكمية مادة ثابتة، يتناسب الضغط مع درجة الحرارة المطلقة وعكسيًا مع الحجم. قانون بويل يشترط ثبات درجة الحرارة؛ أما الضغط السريع مع عزل حراري فقد يرفعها. الغازات الحقيقية تنحرف عن هذا التقريب قرب التكاثف وعند الكثافات العالية.', en: 'For a fixed amount of ideal gas, pressure increases with absolute temperature and decreases with volume. Boyle’s law requires constant temperature; rapid thermally insulated compression can instead heat a gas. Real gases depart from this approximation near condensation and at high density.' },
    takeaway: { ar: 'قراءة الضغط هنا تعليمية وليست معادلة حالة دقيقة لكل مادة؛ لا تستخدمها لتصميم أوعية ضغط.', en: 'Pressure readings are illustrative, not a precise equation of state for every substance. Do not use them to design pressure vessels.' },
    formula: String.raw`$PV = nRT$`,
  },
  {
    id: 'sublimation', category: 'states', source: 'phases',
    title: { ar: 'التسامي والنقطة الثلاثية', en: 'Sublimation and the triple point' },
    body: { ar: 'يتحول الجليد الجاف مباشرة إلى غاز عند الضغط الجوي. لا يوجد طور سائل مستقر لثاني أكسيد الكربون دون ضغط نقطته الثلاثية، نحو 5.11 atm عند 216.6 K. عند النقطة الثلاثية تتعايش الأطوار الثلاثة في اتزان.', en: 'Dry ice changes directly into gas at atmospheric pressure. Carbon dioxide has no stable liquid phase below its triple-point pressure, about 5.11 atm at 216.6 K. At the triple point, solid, liquid and gas coexist in equilibrium.' },
    takeaway: { ar: 'السحابة البيضاء فوق الجليد الجاف غالبًا قطرات ماء متكثفة؛ غاز ثاني أكسيد الكربون نفسه غير مرئي.', en: 'The white cloud above dry ice is largely condensed water droplets; carbon dioxide gas itself is invisible.' },
  },
  {
    id: 'orbitals', category: 'atoms', source: 'quantum',
    title: { ar: 'من نموذج بور إلى السحابة الإلكترونية', en: 'From Bohr orbits to electron clouds' },
    body: { ar: 'مدارات العرض الدائرية طريقة مبسطة لعد الإلكترونات وتوضيح الأغلفة. في الوصف الكمي لا يسلك الإلكترون مسارًا كوكبيًا محددًا؛ يصف الأوربيتال توزيع احتمالية وجوده. أوربيتالات s كروية التوزيع، بينما تختلف أشكال أوربيتالات p وd وf.', en: 'The circular paths are a simplified way to count electrons and show shells. Quantum electrons do not follow definite planetary paths: an orbital describes a probability distribution. s orbitals are spherically symmetric, while p, d and f orbitals have other shapes.' },
    takeaway: { ar: 'المشهد ثلاثي الأبعاد نموذج أغلفة توضيحي، وليس حلًا لمعادلة شرودنغر.', en: 'The 3D scene is an illustrative shell model, not a solution of the Schrödinger equation.' },
    formula: String.raw`$\rho(\mathbf r)=|\psi(\mathbf r)|^2$`,
  },
  {
    id: 'pauli-spin', category: 'atoms', source: 'quantum',
    title: { ar: 'مبدأ باولي: اللف المغزلي ليس اتجاه المدار', en: 'Pauli exclusion: spin is not orbital direction' },
    body: { ar: 'لا يشترك إلكترونان في الذرة في الأعداد الكمية الأربعة نفسها. لذلك يشغل الأوربيتال الواحد إلكترونان كحد أقصى بلفين مغزليين متعاكسين. اللف المغزلي خاصية كمومية ذاتية، وليس دوران كرة صغيرة أو دورانًا مع عقارب الساعة حول النواة.', en: 'No two electrons in an atom share all four quantum numbers. An orbital therefore holds at most two electrons with opposite spins. Spin is an intrinsic quantum property, not a little ball spinning or a clockwise path around the nucleus.' },
    takeaway: { ar: 'أسهم الحركة في المحاكي علامات بصرية فقط، ولا تحدد اللف المغزلي الحقيقي أو التوزيع المغناطيسي للحالة الأرضية.', en: 'Motion arrows are visual markers, not measurements of spin or the actual ground-state magnetic configuration.' },
    formula: String.raw`$m_s=+\frac12\quad\text{or}\quad-\frac12$`,
  },
  {
    id: 'isotopes-ions', category: 'atoms', source: 'nuclear',
    title: { ar: 'ما الفرق بين النظير والأيون؟', en: 'What is the difference between an isotope and an ion?' },
    body: { ar: 'البروتونات تحدد هوية العنصر. تغيير النيوترونات يصنع نظيرًا آخر للعنصر نفسه، وقد يغيّر استقرار النواة. تغيير عدد الإلكترونات يصنع أيونًا موجبًا أو سالبًا دون تغيير هوية العنصر. الكربون-12 والكربون-14 نظيران، أما الصوديوم المتعادل وأيون الصوديوم فيختلفان في الإلكترونات.', en: 'Protons define the element. Changing neutron count produces a different isotope and can change nuclear stability. Changing electron count produces a positive or negative ion without changing the element. Carbon-12 and carbon-14 are isotopes; neutral sodium and a sodium ion differ in electrons.' },
    takeaway: { ar: 'جرّب تغيير نوع واحد من الجسيمات في كل مرة، وسجّل ما يتغير في الهوية والشحنة.', en: 'Change one particle type at a time and watch element identity and charge.' },
    formula: String.raw`$A=Z+N\qquad q/e=Z-n_e$`,
  },
  {
    id: 'half-life', category: 'decay', source: 'nuclear',
    title: { ar: 'عمر النصف احتمال، وليس موعدًا محددًا', en: 'Half-life is a probability, not a deadline' },
    body: { ar: 'لا يمكن التنبؤ بوقت اضمحلال نواة مفردة، لكن يمكن وصف سلوك مجموعة كبيرة. بعد عمر نصف واحد يبقى في المتوسط نصف الأنوية الأصلية؛ وبعد اثنين ربعها؛ وبعد ثلاثة ثمنها. العينة الصغيرة قد تنحرف عن هذه النسب بسبب العشوائية.', en: 'You cannot predict when a particular nucleus will decay, but a large population follows a statistical law. On average, half the original nuclei remain after one half-life, a quarter after two, and an eighth after three. Small samples fluctuate around those fractions.' },
    takeaway: { ar: 'إذا بدأت بـ 800 نواة، فالمتوقع بقاء 100 نواة أصلية بعد ثلاثة أعمار نصف.', en: 'Starting with 800 nuclei, you expect about 100 original nuclei after three half-lives.' },
    formula: String.raw`$N(t)=N_0\,2^{-t/t_{1/2}}$`,
  },
  {
    id: 'radiation-types', category: 'decay', source: 'nuclear',
    title: { ar: 'ألفا وبيتا وغاما: ماذا يتغيّر في النواة؟', en: 'Alpha, beta and gamma: what changes?' },
    body: { ar: 'ألفا نواة هيليوم: ينقص العدد الكتلي بمقدار 4 والعدد الذري بمقدار 2. في بيتا السالبة يتحول نيوترون إلى بروتون مع انبعاث إلكترون وضديد نيوترينو؛ يبقى العدد الكتلي ثابتًا. غاما فوتون عالي الطاقة، ولا تغيّر وحدها العددين الذري والكتلي.', en: 'Alpha emission releases a helium nucleus, reducing mass number by four and atomic number by two. In beta-minus decay a neutron becomes a proton, emitting an electron and antineutrino; mass number stays constant. Gamma emission releases a high-energy photon without itself changing either number.' },
    takeaway: { ar: 'الإلكترون المنبعث في بيتا يتولد في العملية النووية؛ ليس إلكترونًا خرج من أحد الأغلفة.', en: 'A beta electron is produced by the nuclear process; it is not an electron ejected from a shell.' },
  },
  {
    id: 'radiation-safety', category: 'decay', source: 'nuclear',
    title: { ar: 'النشاط والجرعة والسلامة الإشعاعية', en: 'Activity, dose and radiation safety' },
    body: { ar: 'البكريل يقيس عدد الاضمحلالات في الثانية، بينما الغراي يقيس الطاقة الممتصة لكل كيلوغرام، والسيفرت يُستخدم لتقدير التأثير البيولوجي وفق نوع الإشعاع والأنسجة. لا يمكن تحويل النشاط إلى خطر صحي دون معلومات عن التعرض والمسافة والتدريع وطريقة دخول المادة للجسم.', en: 'Becquerels measure decays per second; grays measure absorbed energy per kilogram. Sieverts help express biological impact with radiation and tissue weighting. Activity alone does not determine health risk without exposure, distance, shielding and intake information.' },
    takeaway: { ar: 'استخدم المصادر الإشعاعية الحقيقية فقط ضمن منشأة مرخصة وتحت إشراف مختص. التجارب هنا افتراضية.', en: 'Real radioactive sources belong in licensed facilities under qualified supervision. These experiments are virtual.' },
  },
  {
    id: 'controlled-experiment', category: 'missions', source: 'phases',
    title: { ar: 'صمّم تجربة عادلة: غيّر متغيرًا واحدًا', en: 'Design a fair test: change one variable' },
    body: { ar: 'ابدأ بسؤال: كيف تؤثر الحرارة في حركة جزيئات غاز؟ اختر مادة، وثبّت عدد الجزيئات والحجم والجاذبية، ثم غيّر الحرارة فقط وسجّل الحركة والضغط. كرّر التجربة للمقارنة. ميّز بين ما تتنبأ به النظرية وما تلاحظه في النموذج المبسّط.', en: 'Start with a question: how does temperature affect gas-particle motion? Choose a substance, hold particle count, volume and gravity constant, then change only temperature and record motion and pressure. Repeat for comparison. Distinguish theoretical predictions from observations in a simplified model.' },
    takeaway: { ar: 'الحرارة متغير مستقل؛ الضغط متغير تابع؛ عدد الجزيئات والحجم متغيرات مضبوطة.', en: 'Temperature is independent; pressure is dependent; particle count and volume are controlled variables.' },
  },
  {
    id: 'virtual-safety', category: 'missions', source: 'phases',
    title: { ar: 'المختبر الافتراضي ليس وصفة لتجربة منزلية', en: 'A virtual lab is not a home experiment recipe' },
    body: { ar: 'المحاكي يبسّط التركيز والنقاوة والسرعات والحرارة، وقد يبالغ بصريًا في الفقاعات والشرر لشرح الظاهرة. لا تُنقل كميات أو خطوات التجارب الافتراضية إلى الواقع؛ بعض المواد سامة أو أكّالة وبعض التفاعلات تطلق غازات قابلة للاشتعال.', en: 'The simulator simplifies concentration, purity, rates and heat, and may visually exaggerate bubbles or sparks. Do not transfer virtual amounts or steps into real experiments: some substances are toxic or corrosive and some reactions release flammable gases.' },
    takeaway: { ar: 'التجارب الواقعية تحتاج تقييم مخاطر، ومعدات مناسبة، وإشراف معلم أو مختص.', en: 'Real experiments require a risk assessment, appropriate equipment and qualified supervision.' },
  },
];
