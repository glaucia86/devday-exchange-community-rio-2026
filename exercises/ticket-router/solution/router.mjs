/** Small deterministic rules for learning to review code, not an AI classifier. */
export function routeTicket(text) {
  if(typeof text !== 'string') return 'revisao_humana';
  const normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const matches=[
    ['acessos',/\b(senha|login|permissao)\b/],
    ['infraestrutura',/\b(conexao|wifi|wi-fi|rede)\b/],
    ['aplicacoes',/\b(erro 500|aplicativo)\b/],
  ].filter(([,pattern])=>pattern.test(normalized));
  return matches.length===1 ? matches[0][0] : 'revisao_humana';
}
