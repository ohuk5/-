/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AtomBuilder } from './components/AtomBuilder';
import { StatesOfMatter } from './components/StatesOfMatter';
import { RadioactiveDecay } from './components/RadioactiveDecay';
import { GuideModal } from './components/GuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'atom-builder' | 'states-of-matter' | 'radioactive-decay'>('states-of-matter');
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
    } else {
      setGuideCategory('basics');
    }
    setIsGuideOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGuide={() => handleOpenGuide()}
      />

      {/* Main Simulator Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6">
        {activeTab === 'atom-builder' && (
          <AtomBuilder onOpenGuide={() => handleOpenGuide('atoms')} />
        )}
        {activeTab === 'states-of-matter' && (
          <StatesOfMatter onOpenGuide={(cat) => handleOpenGuide(cat || 'states')} />
        )}
        {activeTab === 'radioactive-decay' && (
          <RadioactiveDecay onOpenGuide={() => handleOpenGuide('decay')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 font-medium">
        <p>
          محاكي سلوك الذرات وحالات المادة والنشاط الإشعاعي التفاعلي — تم التطوير الشامل للدليل العلمي، ومعايرة أطوار المادة، وتأثيرات الضغط والجاذبية، وتجارب التعلم الذاتي.
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
