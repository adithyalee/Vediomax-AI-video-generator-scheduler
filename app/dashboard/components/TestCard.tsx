'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FlaskConical, RefreshCw } from 'lucide-react';

import { VideoProject } from '../types';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';

type Props = {
  series: VideoProject[];
};

export function TestCard({ series }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const storageKey = 'vediomax:testProjectId';

  useEffect(() => {
    if (!series.length) return;

    const preferred = series.find(
      (p) =>
        (p.image_urls?.length ?? 0) > 0 ||
        Boolean(p.voice_url) ||
        (p.captions?.length ?? 0) > 0 ||
        Boolean(p.script_data)
    );

    const fromStorage = (() => {
      try {
        return localStorage.getItem(storageKey) || '';
      } catch {
        return '';
      }
    })();

    const initial =
      (fromStorage && series.some((s) => s.id === fromStorage) && fromStorage) ||
      preferred?.id ||
      series[0].id;

    setSelectedId(initial);
  }, [series]);

  useEffect(() => {
    if (!selectedId) return;
    try {
      localStorage.setItem(storageKey, selectedId);
    } catch {
      // ignore
    }
  }, [selectedId]);

  const testProject = useMemo(() => {
    if (!series.length) return undefined;
    return series.find((p) => p.id === selectedId) || series[0];
  }, [series, selectedId]);

  const runTest = async () => {
    if (!testProject) return;
    setIsRunning(true);
    try {
      toast.message('Sending TEST run (reuse-only)…');

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // reuseOnly=true => NEVER call paid APIs; only reuse what's already saved
        body: JSON.stringify({ projectId: testProject.id, force: false, reuseOnly: true }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(data?.error || 'Failed to start test run');

      const ids = data?.sent?.ids || data?.sent?.id || data?.ids || data?.id;
      const idText = Array.isArray(ids) ? ids.join(', ') : ids ? String(ids) : '';
      toast.success(idText ? `TEST started. Event ID: ${idText}` : 'TEST started. Check Inngest.');
    } catch (e: any) {
      toast.error(e?.message || 'Test run failed');
    } finally {
      setIsRunning(false);
    }
  };

  if (!testProject) {
    return (
      <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">TEST</div>
              <div className="text-sm text-slate-400">
                Create at least one series first. Test mode reuses assets and never spends credits.
              </div>
            </div>
          </div>
          <Button disabled className="gap-2 bg-slate-800 text-slate-400">
            <RefreshCw className="h-4 w-4" />
            Run Test
          </Button>
        </div>
      </div>
    );
  }

  const hasImages = (testProject.image_urls?.length ?? 0) > 0;
  const hasVoice = Boolean(testProject.voice_url);
  const hasCaptions = (testProject.captions?.length ?? 0) > 0;
  const hasScript = Boolean(testProject.script_data);

  return (
    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">TEST</div>
            <div className="text-sm text-slate-400">
              Re-run using saved assets only (won’t call paid APIs).
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 border',
                  hasScript ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-white/10 text-slate-400'
                )}
              >
                Script
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 border',
                  hasVoice ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-white/10 text-slate-400'
                )}
              >
                Voice
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 border',
                  hasCaptions ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-white/10 text-slate-400'
                )}
              >
                Captions
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 border',
                  hasImages ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-white/10 text-slate-400'
                )}
              >
                Images
              </span>
            </div>

            <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span>Using</span>
              <NativeSelect
                size="sm"
                className="min-w-[260px] bg-slate-950/40 border-white/10 text-slate-200"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                aria-label="Select series for test"
              >
                {series.map((s) => (
                  <NativeSelectOption key={s.id} value={s.id}>
                    {s.series_name || s.id} • {new Date(s.created_at).toLocaleDateString()}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            {(!hasScript || !hasVoice || !hasCaptions || !hasImages) && (
              <div className="mt-2 text-xs text-amber-400">
                Missing some assets. Generate once (paid) to populate everything, then TEST is free.
              </div>
            )}
          </div>
        </div>

        <Button onClick={runTest} disabled={isRunning} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <RefreshCw className={cn('h-4 w-4', isRunning && 'animate-spin')} />
          {isRunning ? 'Running…' : 'Run Test'}
        </Button>
      </div>
    </div>
  );
}

