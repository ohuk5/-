/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AtomBuilder } from './components/AtomBuilder';
import { MoleculeBuilder } from './components/MoleculeBuilder';
import { StatesOfMatter } from './components/StatesOfMatter';
import { RadioactiveDecay } from './components/RadioactiveDecay';
import { ExperimentalLab } from './components/ExperimentalLab';
import { GuideModal } from './components/GuideModal';
import { AppProvider, useApp } from './context/AppContext';

function MainAppContent() {
  const { lang, theme, t, activeTab } = useApp();
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [guideCategory, setGuideCategory] = useState<'basics' | 'states' | 'atoms' | 'decay' | 'missions'>('basics');

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    return () => cancelAnimationFrame(id);
  }, [activeTab]);

  const handleOpenGuide = (category?: 'basics' | 'states' | 'atoms' | 'decay' | 'missions') => {
    if (category) {
      setGuideCategory(category);
    } else if (activeTab === 'molecule-builder') {
      setGuideCategory('basics');
    } else if (activeTab === 'states-of-matter') {
      setGuideCategory('states');
    } else if (activeTab === 'atom-builder') {
      setGuideCategory('atoms');
    } else if (activeTab === 'radioactive-decay') {
      setGuideCategory('decay');
    } else if (activeTab === 'experiments-lab') {
      setGuideCategory('missions');
    } else {
      setGuideCategory('basics');
    }
    setIsGuideOpen(true);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 overflow-x-hidden w-full ${
      isDark
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
        : 'bg-slate-50 text-slate-900 selection:bg-cyan-600/20 selection:text-cyan-800'
    }`}>
      {/* Top Header */}
      <Header onOpenGuide={() => handleOpenGuide()} />

      {/* Main Simulator & Lab Stage Responsive Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 overflow-x-hidden">
        <div className="w-full flex flex-col md:flex-row gap-6 sm:gap-8 overflow-x-hidden">
          <div className="w-full flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
            <div className={activeTab === 'atom-builder' ? 'block w-full' : 'hidden'}>
              <AtomBuilder onOpenGuide={() => handleOpenGuide('atoms')} />
            </div>
            <div className={activeTab === 'molecule-builder' ? 'block w-full' : 'hidden'}>
              <MoleculeBuilder onOpenGuide={(cat) => handleOpenGuide(cat || 'basics')} />
            </div>
            <div className={activeTab === 'states-of-matter' ? 'block w-full' : 'hidden'}>
              <StatesOfMatter onOpenGuide={(cat) => handleOpenGuide(cat || 'states')} />
            </div>
            <div className={activeTab === 'radioactive-decay' ? 'block w-full' : 'hidden'}>
              <RadioactiveDecay onOpenGuide={() => handleOpenGuide('decay')} />
            </div>
            <div className={activeTab === 'experiments-lab' ? 'block w-full' : 'hidden'}>
              <ExperimentalLab />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t px-6 py-6 sm:py-8 text-center transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <p className="max-w-4xl mx-auto text-xs sm:text-sm leading-relaxed font-medium">
          {t(
            'محاكي سلوك الذرات، وتكوين المركبات الكيميائية، وحالات المادة، والنشاط الإشعاعي، ومعمل التجارب الافتراضي — دعم الوضعين الليلي والنهاري، واللغتين العربية والإنجليزية، وتجارب إرشادية وحرة متقدمة.',
            'Interactive Atomic, Molecular Compound Builder, States of Matter, Radioactive Decay Simulator & Experimental Lab — Supporting Dark/Light themes, Arabic/English bilingual modes, and Advanced Guided & Open Sandbox Experiments.'
          )}
        </p>
      </footer>

      {/* Conceptual Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialCategory={guideCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
