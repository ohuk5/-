/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AtomBuilder } from './components/AtomBuilder';
import { StatesOfMatter } from './components/StatesOfMatter';
import { RadioactiveDecay } from './components/RadioactiveDecay';
import { ExperimentalLab } from './components/ExperimentalLab';
import { GuideModal } from './components/GuideModal';
import { AppProvider, useApp } from './context/AppContext';

function MainAppContent() {
  const { lang, theme, t, activeTab } = useApp();
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [guideCategory, setGuideCategory] = useState<'basics' | 'states' | 'atoms' | 'decay' | 'missions'>('basics');

  const handleOpenGuide = (category?: 'basics' | 'states' | 'atoms' | 'decay' | 'missions') => {
    if (category) {
      setGuideCategory(category);
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 overflow-x-hidden">
        <div className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 overflow-x-hidden">
          <div className="w-full flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden">
            <div className={activeTab === 'atom-builder' ? 'block w-full' : 'hidden'}>
              <AtomBuilder onOpenGuide={() => handleOpenGuide('atoms')} />
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
      <footer className={`border-t px-4 py-4 text-center text-xs font-medium transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950/80 text-slate-500' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <p>
          {t(
            'محاكي سلوك الذرات وحالات المادة والنشاط الإشعاعي ومعمل التجارب الافتراضي — دعم الوضعين الليلي والنهاري، واللغتين العربية والإنجليزية، وتجارب إرشادية وحرة متقدمة.',
            'Interactive Atomic, States of Matter, Radioactive Decay Simulator & Experimental Lab — Supporting Dark/Light themes, Arabic/English bilingual modes, and Advanced Guided & Open Sandbox Experiments.'
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
