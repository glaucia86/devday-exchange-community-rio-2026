const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();

export function matchesProgram(title, speaker, query) {
  return normalize(`${title} ${speaker}`).includes(normalize(query));
}
