/**
 * Responses delegation on GPT-Live.
 * https://developers.openai.com/api/docs/guides/live-delegation
 * Send response.item.create for every pending function call, then one response.create.
 * session.thinking.append only adds quiet context. It does not continue the delegated response.
 * GPT-Live has no output-audio-done event; the client tracks playback.
 * https://developers.openai.com/api/docs/guides/live-conversations
 */

export type TurnEvent =
  | { type: 'session.thinking.append'; delegation_id: null; content: string }
  | { type: 'response.item.create'; item: { type: 'function_call_output'; call_id: string; output: string } }
  | { type: 'response.create' };

export function discardedAnalysisOutput(reason: string): string {
  return JSON.stringify({ ok: false, comando: 'analisar', erro: 'resultado_descartado', resumo: reason, ticket: null });
}

/** Voice replacement and session close return the cancellation without continuing it.
 *  The voice path continues once, on the replacement result. Close does not continue. */
export function planCancelledAnalysis(callId: string, reason: string): TurnEvent[] {
  return [{
    type: 'response.item.create',
    item: { type: 'function_call_output', call_id: callId, output: discardedAnalysisOutput(reason) },
  }];
}

/**
 * Typed edit while analisar is pending.
 * Quiet context, then the cancellation result, then exactly one continuation.
 * No pending call means there is no delegated response to resume.
 */
export function planEditedAnalysisTurn(input: { callId: string | null; reason: string; context: string }): TurnEvent[] {
  const events: TurnEvent[] = [{ type: 'session.thinking.append', delegation_id: null, content: input.context }];
  if (!input.callId) return events;
  events.push({
    type: 'response.item.create',
    item: { type: 'function_call_output', call_id: input.callId, output: discardedAnalysisOutput(input.reason) },
  });
  events.push({ type: 'response.create' });
  return events;
}
