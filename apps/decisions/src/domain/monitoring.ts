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

/** Wall-clock marks. Zero means "not observed", never "silent since the epoch". */
export type ActivityClock = {
  userSpeechAt: number;
  assistantAudioEndedAt: number;
  toolOutputAt: number;
};

export function idleActivity(): ActivityClock {
  return { userSpeechAt: 0, assistantAudioEndedAt: 0, toolOutputAt: 0 };
}

export function noteActivity(clock: ActivityClock, kind: 'user_speech' | 'assistant_audio_end' | 'tool_output', at: number): ActivityClock {
  if (!(at > 0)) return clock;
  if (kind === 'user_speech') return { ...clock, userSpeechAt: Math.max(clock.userSpeechAt, at) };
  if (kind === 'assistant_audio_end') return { ...clock, assistantAudioEndedAt: Math.max(clock.assistantAudioEndedAt, at) };
  return { ...clock, toolOutputAt: Math.max(clock.toolOutputAt, at) };
}

/** Quiet time starts at the latest real activity. Missing marks do not count. */
export function latestActivityAt(clock: ActivityClock): number {
  return Math.max(clock.userSpeechAt, clock.assistantAudioEndedAt, clock.toolOutputAt);
}

export type ConfirmationWatch = {
  sentAt: number;
  heardSinceSend: boolean;
  sawSilenceAfterSend: boolean;
};

export function idleConfirmation(): ConfirmationWatch {
  return { sentAt: 0, heardSinceSend: false, sawSilenceAfterSend: true };
}

/** A confirmation is owed until assistant audio that started after it has ended. */
export function beginConfirmationWatch(at: number, assistantAudible: boolean): ConfirmationWatch {
  return { sentAt: at, heardSinceSend: false, sawSilenceAfterSend: !assistantAudible };
}

/** Call only when audible changes. Silence after speech records the audio end. */
export function noteAssistantAudible(watch: ConfirmationWatch, audible: boolean, at: number): { watch: ConfirmationWatch; audioEndedAt: number | null } {
  if (audible) {
    return { watch: { ...watch, heardSinceSend: watch.heardSinceSend || watch.sawSilenceAfterSend }, audioEndedAt: null };
  }
  return { watch: { ...watch, sawSilenceAfterSend: true }, audioEndedAt: at > 0 ? at : null };
}

export function confirmationInFlight(watch: ConfirmationWatch, assistantAudible: boolean, assistantAudioEndedAt: number): boolean {
  if (!(watch.sentAt > 0)) return false;
  if (!watch.heardSinceSend || assistantAudible) return true;
  return assistantAudioEndedAt < watch.sentAt;
}

/** App-initiated speech waits out a confirmation and then a quiet gap, and never runs without a live session. */
export function planInsightSpeech(input: {
  insight: string | null;
  alreadySaid: boolean;
  sessionActive: boolean;
  now: number;
  activity: ActivityClock;
  confirmationInFlight: boolean;
  requiredQuietMs: number;
}): InsightSpeechPlan {
  if (!input.insight || input.alreadySaid) return 'skip';
  if (!input.sessionActive) return 'skip';
  if (input.confirmationInFlight) return 'wait';
  const latest = latestActivityAt(input.activity);
  if (!(latest > 0) || input.now - latest < input.requiredQuietMs) return 'wait';
  return 'speak';
}
