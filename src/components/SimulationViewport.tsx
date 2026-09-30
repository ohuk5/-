import { Component, lazy, Suspense, useState, type ReactNode, type ErrorInfo } from 'react';
import { Box, RotateCcw, Rotate3D, Pause, Play, MousePointer2, LoaderCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ScientificSceneProps } from './ScientificScene';

const ScientificScene = lazy(() => import('./ScientificScene'));
type SceneInput<T> = T extends unknown ? Omit<T, 'resetKey' | 'autoRotate' | 'paused'> : never;
type Props = SceneInput<ScientificSceneProps> & { children: ReactNode };

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function SimulationViewport({ children, ...scene }: Props) {
  const { t } = useApp();
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [failed, setFailed] = useState(false);
  return <div className="simulation-viewport">
    <div className="viewport-topbar">
      <span className="viewport-label"><Box size={14} />{t('المشهد الجزيئي', 'MOLECULAR VIEW')}</span>
      <div className="viewport-switch" role="group" aria-label={t('طريقة العرض', 'View mode')}>
        <button aria-pressed={mode === '3d'} disabled={failed} onClick={() => setMode('3d')}>3D</button>
        <button aria-pressed={mode === '2d'} onClick={() => setMode('2d')}>2D</button>
      </div>
    </div>
    <div className="viewport-stage">
      <div className="viewport-fallback" hidden={mode !== '2d'}>{children}</div>
      {mode === '3d' && <SceneBoundary onError={() => { setFailed(true); setMode('2d'); }}>
        <Suspense fallback={<div className="viewport-loading" role="status"><LoaderCircle className="animate-spin" size={22} />{t('تجهيز المشهد ثلاثي الأبعاد…', 'Preparing the 3D scene…')}</div>}>
          <ScientificScene {...scene} resetKey={resetKey} autoRotate={autoRotate} paused={paused} />
        </Suspense>
      </SceneBoundary>}
      {mode === '3d' && <div className="viewport-toolbar" role="group" aria-label={t('أدوات المشهد', 'Scene tools')}>
        <button title={t('إعادة زاوية العرض', 'Reset camera')} aria-label={t('إعادة زاوية العرض', 'Reset camera')} onClick={() => setResetKey(k => k + 1)}><RotateCcw size={16} /></button>
        <button title={t('تدوير تلقائي', 'Auto rotate')} aria-label={t('تدوير تلقائي', 'Auto rotate')} aria-pressed={autoRotate} onClick={() => setAutoRotate(v => !v)}><Rotate3D size={17} /></button>
        <button title={t('تجميد العرض فقط', 'Freeze visual only')} aria-label={paused ? t('تشغيل العرض', 'Resume visual') : t('تجميد العرض فقط', 'Freeze visual only')} aria-pressed={paused} onClick={() => setPaused(v => !v)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
      </div>}
      <div className="viewport-axis" aria-hidden="true"><span>Y</span><span>Z</span><span>X</span></div>
      <span className="viewport-watermark">ATOM LAB / {scene.kind === 'matter' ? 'MATTER' : 'STRUCTURE'}</span>
    </div>
    <div className="viewport-caption"><MousePointer2 size={13} /><span>{failed ? t('العرض ثلاثي الأبعاد غير متاح؛ تم تفعيل العرض ثنائي الأبعاد.', '3D is unavailable. The 2D view is active.') : mode === '3d' ? t('اسحب للتدوير · مرّر للتكبير', 'Drag to orbit · Scroll to zoom') : scene.kind === 'matter' ? t('اسحب المكبس لتغيير الحجم', 'Drag the piston to change volume') : t('نموذج الأغلفة الإلكترونية المبسّط', 'Simplified electron-shell model')}</span><span className="viewport-live">{paused && mode === '3d' ? t('عرض مجمّد', 'FROZEN VIEW') : t('عرض مباشر', 'LIVE VIEW')}</span></div>
    <p className="viewport-note"><Info size={12} />{t('تمثيل تعليمي مكبّر؛ الألوان والأحجام والحركة والقراءات تقريبية وليست قياسًا مخبريًا.', 'Enlarged educational model. Colors, scale, motion and readings are illustrative, not laboratory measurements.')}</p>
  </div>;
}
