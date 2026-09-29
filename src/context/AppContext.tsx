import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'ar' | 'en';
export type AppTheme = 'dark' | 'light';
export type ActiveTabType = 'atom-builder' | 'states-of-matter' | 'radioactive-decay' | 'experiments-lab';

export interface LabExperimentTrigger {
  substanceId?: string;
  targetTemp?: number;
  volumeLidPercent?: number;
  gravityPreset?: 'earth' | 'moon' | 'jupiter' | 'zero';
  protons?: number;
  neutrons?: number;
  electrons?: number;
  isotopeId?: string;
  notes?: string;
}

interface AppContextType {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  t: (ar: string, en: string) => string;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  activeLabPreset: LabExperimentTrigger | null;
  launchLabExperiment: (tab: ActiveTabType, config: LabExperimentTrigger) => void;
  clearLabExperiment: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('app_lang') as AppLanguage) || 'ar';
  });

  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('app_theme') as AppTheme) || 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTabType>('states-of-matter');
  const [activeLabPreset, setActiveLabPreset] = useState<LabExperimentTrigger | null>(null);

  const setLang = (newLang: AppLanguage) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [lang, theme]);

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  const launchLabExperiment = (tab: ActiveTabType, config: LabExperimentTrigger) => {
    setActiveLabPreset(config);
    setActiveTab(tab);
  };

  const clearLabExperiment = () => {
    setActiveLabPreset(null);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        theme,
        setTheme,
        toggleTheme,
        t,
        activeTab,
        setActiveTab,
        activeLabPreset,
        launchLabExperiment,
        clearLabExperiment
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
