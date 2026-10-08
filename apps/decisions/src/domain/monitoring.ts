import type { Team } from './service-desk.ts';

/** Local demo dashboard. Seed rows are labelled and are not production incidents. */
export type HistoryEntry = {
  id: string;
  team: Team;
  at: number;
  demo: boolean;
  title: string;
};
export type MonitoringInsight = {
  text: string;
  count: number;
  demoCount: number;
  team: Team;
};
const WEEK = 7 * 86_400_000;
const ORDINALS = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono', 'décimo'];

export function demoHistory(now: number): HistoryEntry[] {
  const day = 86_400_000;
  return [
    { id: 'DEMO-HIST-01', team: 'infrastructure', at: now - 2 * day, demo: true, title: 'Wi-Fi da sala de reunião instável' },
    { id: 'DEMO-HIST-02', team: 'infrastructure', at: now - day, demo: true, title: 'Queda curta da VPN do escritório' },
    { id: 'DEMO-HIST-03', team: 'access', at: now - 3 * day, demo: true, title: 'Senha do portal recusada para uma pessoa' },
    { id: 'DEMO-HIST-04', team: 'applications', at: now - 2 * day, demo: true, title: 'Erro 500 pontual no portal interno' },
    { id: 'DEMO-HIST-05', team: 'applications', at: now - day, demo: true, title: 'Portal interno lento para o time' },
  ];
}

export function sameWeek(history: HistoryEntry[], team: Team, at: number): HistoryEntry[] {
  return history.filter(entry => entry.team === team && entry.at <= at && at - entry.at <= WEEK);
}

/** Sentence is derived from the week count. It always says the records are a demonstration. */
export function monitoringInsight(history: HistoryEntry[], ticket: { team: Team; at: number }, teamLabel: string): MonitoringInsight {
  const entries = sameWeek(history, ticket.team, ticket.at);
  const count = entries.length;
  const demoCount = entries.filter(entry => entry.demo).length;
  const ordinal = ORDINALS[count - 1] ?? `${count}º`;
  return {
    team: ticket.team,
    count,
    demoCount,
    text: `Notei que este é o ${ordinal} problema de ${teamLabel} nesta semana, nos registros de demonstração. Nenhum painel externo foi consultado.`,
  };
}

export type InsightSpeechPlan = 'speak' | 'wait' | 'skip';

/** App-initiated speech waits until both sides are quiet, and never runs without a live session. */
export function planInsightSpeech(input: {
  insight: string | null;
  alreadySaid: boolean;
  sessionActive: boolean;
  userQuietMs: number;
  assistantQuietMs: number;
  requiredQuietMs: number;
}): InsightSpeechPlan {
  if (!input.insight || input.alreadySaid) return 'skip';
  if (!input.sessionActive) return 'skip';
  if (input.userQuietMs < input.requiredQuietMs || input.assistantQuietMs < input.requiredQuietMs) return 'wait';
  return 'speak';
}
