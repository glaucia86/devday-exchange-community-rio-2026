import { sameWeek, type HistoryEntry, type MonitoringInsight } from '../domain/monitoring';
import { TEAMS } from '../domain/service-desk';

export default function MonitoringNote({ insight, history }: { insight: MonitoringInsight | null; history: HistoryEntry[] }) {
  if (!insight) return null;
  const at = history.reduce((max, entry) => entry.team === insight.team ? Math.max(max, entry.at) : max, 0);
  const entries = sameWeek(history, insight.team, at);
  return <div className="monitoring" role="status" aria-label="Monitoramento de demonstração">
    <p className="step-label">MONITORAMENTO · DADOS DE DEMONSTRAÇÃO</p>
    <p>{insight.text}</p>
    <p className="ticket-footnote">{insight.demoCount} de {insight.count} são registros de demonstração, não chamados reais.</p>
    <ul>{entries.map(entry => <li key={`${entry.id}-${entry.at}`}><span>{entry.demo ? 'Demonstração' : 'Neste ensaio'}</span> · {TEAMS[entry.team]} · {entry.title}</li>)}</ul>
  </div>;
}
