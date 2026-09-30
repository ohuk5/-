import React from 'react';
import { Atom, Waves, Radiation, BookOpen, FlaskConical, Sun, Moon, Globe2, ArrowUpLeft } from 'lucide-react';
import { useApp, type ActiveTabType } from '../context/AppContext';

interface HeaderProps { onOpenGuide: () => void }

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  const { lang, toggleLang, theme, toggleTheme, t, activeTab, setActiveTab } = useApp();
  const tabs: { id: ActiveTabType; ar: string; en: string; icon: typeof Atom; number: string }[] = [
    { id: 'atom-builder', ar: 'بناء الذرة', en: 'Atom builder', icon: Atom, number: '01' },
    { id: 'states-of-matter', ar: 'حالات المادة', en: 'States of matter', icon: Waves, number: '02' },
    { id: 'radioactive-decay', ar: 'النشاط الإشعاعي', en: 'Radioactive decay', icon: Radiation, number: '03' },
    { id: 'experiments-lab', ar: 'معمل التجارب', en: 'Experimental lab', icon: FlaskConical, number: '04' },
  ];
  return (
    <header className="lab-header">
      <div className="lab-header-top">
        <a className="lab-brand" href="#main-content" aria-label={t('مختبر الذرة — انتقل للمحاكاة', 'Atom lab — skip to simulation')}>
          <span className="lab-brand-mark"><Atom size={25} strokeWidth={1.5} /></span>
          <span><strong>{t('مختبر الذرّة', 'ATOM LAB')}</strong><small>EXPLORE THE INVISIBLE</small></span>
        </a>
        <span className="lab-header-caption">{t('مساحة صغيرة. اكتشافات بلا حدود.', 'A small space. Infinite discoveries.')}</span>
        <div className="lab-header-actions">
          <button className="lab-icon-button" onClick={toggleTheme} aria-label={t('تبديل المظهر', 'Toggle theme')} title={t('تبديل المظهر', 'Toggle theme')}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="lab-language-button" onClick={toggleLang}><Globe2 size={16} /><span>{lang === 'ar' ? 'EN' : 'عربي'}</span></button>
          <span className="lab-header-divider" />
          <button className="lab-guide-button" onClick={onOpenGuide}><BookOpen size={16} /><span>{t('الدليل العلمي', 'Science guide')}</span><ArrowUpLeft size={15} className="guide-arrow" /></button>
        </div>
      </div>
      <div className="lab-nav-row">
        <nav className="lab-nav" aria-label={t('أقسام المختبر', 'Laboratory sections')}>
          {tabs.map(({ id, ar, en, icon: Icon, number }) => (
            <button key={id} className="lab-nav-tab" aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>
              <Icon size={17} /><span>{t(ar, en)}</span><small>{number}</small>
            </button>
          ))}
        </nav>
        <div className="lab-status"><span />{t('مختبر افتراضي تفاعلي', 'INTERACTIVE VIRTUAL LAB')}</div>
      </div>
    </header>
  );
};
