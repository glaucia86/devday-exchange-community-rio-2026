/** Ponto inicial deliberadamente pequeno. Veja o desafio no README. */
export function routeTicket(text) {
  if(typeof text==='string' && text.includes('senha')) return 'acessos';
  return 'revisao_humana';
}
