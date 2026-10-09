'use client';
import { motion } from 'motion/react';
import { AppWindow, Flame, Info, KeyRound, LayoutGrid, Mic, Network, Sparkles, TriangleAlert, UserSearch, Workflow, type LucideIcon } from 'lucide-react';
import type { Team } from '../domain/service-desk';

const STEPS = [
  { key: 'listening', label: 'Ouvindo', Icon: Mic },
  { key: 'delegated', label: 'Delegou', Icon: Workflow },
  { key: 'deciding', label: 'Decisions', Icon: Sparkles },
  { key: 'placed', label: 'No quadro', Icon: LayoutGrid },
] as const;
export type FlowStage = 'idle' | (typeof STEPS)[number]['key'];

function stepState(index: number, at: number): string {
  if (at < 0) return '';
  if (index < at) return 'done';
  return index === at ? 'current' : '';
}

/** Voice → delegation → Decisions → board, lighting up as each step happens. */
export function FlowRail({ stage }: { stage: FlowStage }) {
  const at = STEPS.findIndex(step => step.key === stage);
  return <ol className="tri-flow" aria-label="Etapas da triagem">
    {STEPS.map(({ key, label, Icon }, index) => {
      const state = stepState(index, at);
      return <li key={key} className={state} aria-current={state === 'current' ? 'step' : undefined}>
        <span className="tri-flow-icon"><Icon size={16} /></span>{label}
      </li>;
    })}
  </ol>;
}

function ringTone(value: number): string {
  if (value >= .8) return 'high';
  return value >= .7 ? 'mid' : 'low';
}

export function ConfidenceRing({ value }: { value: number }) {
  const radius = 15, length = 2 * Math.PI * radius, percent = Math.round(value * 100);
  return <span className={'tri-ring ' + ringTone(value)} role="img" aria-label={`Confiança ${percent}%`}>
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={radius} className="track" />
      <motion.circle cx="18" cy="18" r={radius} className="value" strokeDasharray={length}
        initial={{ strokeDashoffset: length }} animate={{ strokeDashoffset: length * (1 - value) }}
        transition={{ duration: 1, ease: [.2, .8, .2, 1], delay: .3 }} />
    </svg>
    <span aria-hidden="true">{percent}</span>
  </span>;
}

const COLUMN_ICONS: Record<Team, LucideIcon> = { access: KeyRound, applications: AppWindow, infrastructure: Network, human: UserSearch };

export function ColumnIcon({ team }: { team: Team }) {
  const Icon = COLUMN_ICONS[team];
  return <span className={'tri-column-icon ' + team}><Icon size={18} /></span>;
}

export function UrgencyIcon({ score }: { score: number }) {
  if (score >= 1.5) return <Flame size={14} className="tri-urgency-icon blocked" aria-hidden="true" />;
  if (score >= .5) return <TriangleAlert size={14} className="tri-urgency-icon degraded" aria-hidden="true" />;
  return <Info size={14} className="tri-urgency-icon guidance" aria-hidden="true" />;
}
