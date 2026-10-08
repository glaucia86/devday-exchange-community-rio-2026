/** Candidata de revisão: contém um defeito intencional. Não use como solução. */
export function routeTicket(text) {
  if (typeof text !== 'string') return 'revisao_humana';
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (/\b(senha|login|permissao)\b/.test(normalized)) return 'acessos';
  if (/\b(conexao|wifi|wi-fi|rede)\b/.test(normalized)) return 'infraestrutura';
  if (/\b(erro 500|aplicativo)\b/.test(normalized)) return 'aplicacoes';
  return 'revisao_humana';
}
