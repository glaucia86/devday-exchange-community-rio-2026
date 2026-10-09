/** Live triage board state. Pure functions only: no model, network or DOM. */
import { TEAMS, type Decision, type Team } from './service-desk.ts';

export const COLUMNS: Team[] = ['access', 'applications', 'infrastructure', 'human'];
const MAX_HEARD = 4000;
const MAX_SUMMARY = 1500;
const MAX_QUEUE = 20;
const MAX_CARDS = 200;
const COMMAND = /(?:^|[,.!?;:-]\s*)(?:ok[\s,]*)?(?:registra|registre|classifica|classifique|pr[oó]ximo chamado)(?:\s+(?:esse|este|o)\s+chamado)?[\s,.;:!?-]*$/i;
// Infinitives also occur in reports ("não consigo registrar"); require a sentence boundary.
const INFINITIVE_COMMAND = /(?:^|[,.!?;:-]\s*)(?:ok[\s,]*)?(?:registrar|classificar)(?:\s+(?:esse|este|o)\s+chamado)?[\s,.;:!?-]*$/i;

export type TriageCard = {
  id: number; text: string; team: Team; suggested: Team;
  probability: number; confidence: number; score: number;
  decidedBy: 'decisions' | 'human'; at: number;
};
export type TriageState = { cards: TriageCard[]; heard: string; calls: number; last: Decision | null; queue: string[] };

export function createTriage(): TriageState {
  return { cards: [], heard: '', calls: 0, last: null, queue: [] };
}

/** Rebuilds a saved board, dropping anything that does not look like one. */
export function restoreTriage(raw: unknown): TriageState {
  const empty = createTriage();
  if (!raw || typeof raw !== 'object') return empty;
  const value = raw as Partial<TriageState>;
  const teams = new Set<string>(COLUMNS);
  const cards = Array.isArray(value.cards) ? value.cards.filter((card): card is TriageCard =>
    !!card && typeof card === 'object' && Number.isInteger(card.id) && typeof card.text === 'string'
    && teams.has(card.team) && teams.has(card.suggested)
    && [card.probability, card.confidence, card.score, card.at].every(Number.isFinite)
    && (card.decidedBy === 'decisions' || card.decidedBy === 'human')).slice(-MAX_CARDS) : [];
  const queue = Array.isArray(value.queue) ? value.queue.filter((text): text is string => typeof text === 'string' && text.trim() !== '').slice(-MAX_QUEUE) : [];
  const calls = Number.isInteger(value.calls) && value.calls! >= 0 ? value.calls! : 0;
  return { ...empty, cards, queue, calls };
}

/** Parks the pending report for later, so the room can keep talking while Decisions is rate-limited. */
export function enqueue(state: TriageState, capturedHeard = state.heard): TriageState {
  const text = pendingReport({ ...state, heard: capturedHeard });
  if (!text) return state;
  return { ...state, queue: [...state.queue, text].slice(-MAX_QUEUE), heard: remainingHeard(state.heard, capturedHeard) };
}

/** Consume only the captured prefix; if the bounded buffer has moved on, keep it. */
function remainingHeard(heard: string, captured: string): string {
  return heard.startsWith(captured) ? heard.slice(captured.length) : heard;
}

/** Appends presenter speech heard since the last card. */
export function hear(state: TriageState, delta: string): TriageState {
  return { ...state, heard: (state.heard + delta).slice(-MAX_HEARD) };
}

/** The report to classify: what was heard, without the trailing spoken command. */
export function pendingReport(state: TriageState): string {
  const heard = state.heard.replace(/\s+/g, ' ').trim();
  const report = heard.replace(COMMAND, '').replace(INFINITIVE_COMMAND, '').trim();
  return report || heard;
}

export function noteCall(state: TriageState): TriageState {
  return { ...state, calls: state.calls + 1 };
}

/** A queued report becomes a card without touching what is being heard right now. */
export function addCard(state: TriageState, text: string, decision: Decision, at: number, source: 'heard' | 'queue' = 'heard', capturedHeard = state.heard): TriageState {
  const card: TriageCard = {
    id: (state.cards.at(-1)?.id ?? 0) + 1, text, team: decision.team, suggested: decision.team,
    probability: decision.probability, confidence: decision.confidence, score: decision.score,
    decidedBy: 'decisions', at,
  };
  const cards = [...state.cards, card];
  if (source === 'heard') return { ...state, cards, heard: remainingHeard(state.heard, capturedHeard), last: decision };
  const index = state.queue.indexOf(text);
  return { ...state, cards, last: decision, queue: index < 0 ? state.queue : state.queue.filter((_, i) => i !== index) };
}

/** Only cards waiting for human review can be routed by a person. */
export function resolveReview(state: TriageState, id: number, team: Team): TriageState {
  if (team === 'human') return state;
  return {
    ...state,
    cards: state.cards.map(card => card.id === id && card.team === 'human' ? { ...card, team, decidedBy: 'human' } : card),
  };
}

export function urgencyLabel(score: number): string {
  if (score >= 1.5) return 'Bloqueado';
  if (score >= 0.5) return 'Degradado';
  return 'Orientação';
}

export function columnCounts(state: TriageState): Record<Team, number> {
  const counts = { access: 0, applications: 0, infrastructure: 0, human: 0 } as Record<Team, number>;
  for (const card of state.cards) counts[card.team]++;
  return counts;
}

export function topTeam(state: TriageState): Team | null {
  const counts = columnCounts(state);
  let best: Team | null = null;
  for (const team of COLUMNS) if (team !== 'human' && counts[team] > 0 && (!best || counts[team] > counts[best])) best = team;
  return best;
}

export function cardAnnouncement(card: TriageCard): string {
  const confidence = `confiança ${Math.round(card.confidence * 100)}%`;
  if (card.team === 'human') {
    return `Chamado ${card.id} foi para Revisão humana: faltou contexto ou a confiança ficou baixa (${confidence}). A apresentadora decide a equipe na tela.`;
  }
  return `Chamado ${card.id}: ${TEAMS[card.team]}, urgência ${urgencyLabel(card.score).toLowerCase()}, ${confidence}. Dados fictícios.`;
}

/** Board context for GPT-Live, kept short enough for one thinking append. */
export function boardSummary(state: TriageState): string {
  const counts = columnCounts(state);
  const top = topTeam(state);
  const head = [
    `Quadro da triagem (dados fictícios): ${state.cards.length} chamados.`,
    COLUMNS.map(team => `${TEAMS[team]}: ${counts[team]}`).join('; ') + '.',
    top ? `Equipe com mais chamados: ${TEAMS[top]}.` : 'Ainda não há equipe com chamados.',
    state.queue.length ? `${state.queue.length} relatos na fila aguardando classificação (limite do Decisions).` : '',
  ].filter(Boolean).join(' ');
  const lines: string[] = [];
  for (const card of [...state.cards].reverse()) {
    const line = ` #${card.id} ${TEAMS[card.team]} (${urgencyLabel(card.score)}${card.decidedBy === 'human' ? ', decidido pela apresentadora' : ''}): ${card.text.slice(0, 120)}`;
    if (head.length + lines.join('').length + line.length > MAX_SUMMARY) break;
    lines.push(line);
  }
  return head + lines.join('');
}
