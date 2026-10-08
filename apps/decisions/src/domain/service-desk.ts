/** Deterministic teaching fixtures. No model or external service is called. */
import { demoHistory, monitoringInsight, type HistoryEntry, type MonitoringInsight } from './monitoring.ts';
export type { HistoryEntry, MonitoringInsight };
export type Team = 'access' | 'applications' | 'infrastructure' | 'human';
export type ScenarioId = 'access' | 'network' | 'ambiguous';
export const TEAMS: Record<Team, string> = {
  access: 'Acessos e identidade', applications: 'Aplicações internas',
  infrastructure: 'Infraestrutura', human: 'Revisão humana',
};
export const SCENARIOS = {
  access: {
    label: 'Acesso ao portal', category: 'Identidade', title: 'Não consigo entrar no portal interno',
    text: 'Não consigo entrar no portal interno desde que troquei a senha. Só eu fui afetada e consigo continuar as outras tarefas.',
    correction: 'A senha funciona. O portal interno mostra erro 500 para todo o time e ninguém consegue trabalhar. Não há alternativa.',
  },
  network: {
    label: 'Conexão instável', category: 'Conectividade', title: 'A rede da sala de reunião está instável',
    text: 'A rede Wi-Fi da sala de reunião cai durante as chamadas. O restante do escritório funciona e podemos usar o cabo de rede.',
    correction: 'A rede da sala de reunião voltou a funcionar. Ainda preciso verificar se o problema retorna.',
  },
  ambiguous: {
    label: 'Relato incompleto', category: 'Clarificação', title: 'Preciso de ajuda com um problema',
    text: 'Está tudo dando problema. Preciso de ajuda urgente.',
    correction: 'O portal interno mostra erro 500 para todo o time e ninguém consegue trabalhar. Não há alternativa.',
  },
} satisfies Record<ScenarioId, { label:string;category:string;title:string;text:string;correction:string }>;
/** Shown in the conversation when simulated mode cannot score typed text. Not a team suggestion. */
export const FREE_TEXT_REPLY = 'O modo simulado só analisa os três relatos prontos. Este texto ficou registrado, mas nenhuma equipe foi sugerida. Escolha um cenário em Outros relatos ou mude para OpenAI ao vivo.';
export type Decision = { team:Team; probability:number; confidence:number; score:number; explanation:string; source:'mock'|'openai' };
export type Message = { id:number;role:'user'|'assistant';text:string;revision:number };
export type Ticket = { id:string;title:string;description:string;team:Team;revision:number;simulated:true };
export type DeskState = {
  mode:'mock'|'live'; session:number;revision:number;reportVersion:number;draftDirty:boolean;
  scenario:ScenarioId;corrected:boolean;
  status:'ready'|'needs-analysis'|'analyzing'|'review'|'clarify'|'unsupported'|'created'|'error';
  draftText:string;title:string;team:Team;messages:Message[];analysis:Decision|null;
  reviewed:boolean;ticket:Ticket|null;notice:string;
  history:HistoryEntry[];insight:MonitoringInsight|null;
};
export type DeskEvent =
 | {type:'REPLAY';scenario:ScenarioId} | {type:'CORRECT'} | {type:'EDIT';value:string}
 | {type:'TITLE';value:string} | {type:'TEAM';value:Team} | {type:'REVIEW';checked:boolean}
 | {type:'ANALYZE'} | {type:'RESOLVED';session:number;revision:number;result:Decision}
 | {type:'FAILED';session:number;revision:number} | {type:'CREATE'} | {type:'RESET'};
export function createDesk(session=1,mode:DeskState['mode']='mock'):DeskState {
  return {mode,session,revision:0,reportVersion:0,draftDirty:false,scenario:'access',corrected:false,status:'ready',draftText:'',title:'',team:'human',messages:[],analysis:null,reviewed:false,ticket:null,notice:'',history:demoHistory(Date.now()),insight:null};
}
export function mockDecision(scenario:ScenarioId,corrected:boolean):Decision {
  if ((scenario==='access'||scenario==='ambiguous')&&corrected) return {
    team:'applications',probability:.97,confidence:.93,score:1.92,source:'mock',
    explanation:'O acesso funciona. O erro 500 afeta o time inteiro, então a sugestão passa para Aplicações internas.',
  };
  if (scenario==='access') return {team:'access',probability:.95,confidence:.91,score:1.02,source:'mock',explanation:'O relato descreve uma falha de acesso após a troca de senha. Acessos e identidade é a equipe sugerida.'};
  if (scenario==='network'&&!corrected) return {team:'infrastructure',probability:.94,confidence:.90,score:.96,source:'mock',explanation:'A falha está na conexão Wi-Fi e há uma alternativa por cabo. A sugestão é Infraestrutura.'};
  return {team:'human',probability:.31,confidence:.38,score:.64,source:'mock',explanation:'É preciso esclarecer qual serviço falhou, quem foi afetado e se há uma alternativa antes de encaminhar.'};
}
function append(state:DeskState,role:Message['role'],text:string):Message[] {
  return [...state.messages,{id:(state.messages.at(-1)?.id??0)+1,role,text,revision:state.revision}];
}
/** The transcript follows the draft that will be analyzed. An open turn is rewritten; an answered turn stays in history. */
function commitDraft(state:DeskState):DeskState {
  const text=state.draftText;
  const last=state.messages.at(-1);
  if(last?.role==='user'&&last.text===text) return {...state,draftDirty:false};
  if(last?.role==='user') return {...state,draftDirty:false,messages:state.messages.slice(0,-1).concat({...last,text,revision:state.revision})};
  return {...state,draftDirty:false,messages:append(state,'user',text)};
}
export function canCreate(state:DeskState):boolean {
  return state.status==='review' && state.reviewed && state.analysis!==null &&
    state.team!=='human' && state.title.trim().length>0 && state.draftText.trim().length>0 && state.ticket===null;
}
export function deskReducer(state:DeskState,event:DeskEvent):DeskState {
  switch(event.type) {
    case 'RESET': return {...createDesk(state.session+1,state.mode),history:state.history};
    case 'REPLAY': {
      const scenario=SCENARIOS[event.scenario];
      return {...createDesk(state.session+1),history:state.history,scenario:event.scenario,revision:1,reportVersion:1,status:'needs-analysis',draftText:scenario.text,title:scenario.title,
        messages:[{id:1,revision:1,role:'assistant',text:'Olá! Conte o que aconteceu e quem foi afetado. Vamos preparar um ticket juntos.'},{id:2,revision:1,role:'user',text:scenario.text}],
        notice:''};
    }
    case 'EDIT': {
      if(state.ticket||event.value===state.draftText) return state;
      const opening=!state.draftDirty;
      return {...state,revision:state.revision+1,reportVersion:opening?state.reportVersion+1:state.reportVersion,draftDirty:true,draftText:event.value,status:'needs-analysis',analysis:null,reviewed:false,ticket:null,corrected:event.value===SCENARIOS[state.scenario].correction,notice:'Relato alterado. A análise anterior perdeu a validade.'};
    }
    case 'CORRECT': {
      if(state.ticket)return state;
      const correction=SCENARIOS[state.scenario].correction;
      const next:DeskState={...state,revision:state.revision+1,reportVersion:state.reportVersion+1,draftDirty:false,corrected:true,draftText:correction,status:'needs-analysis',analysis:null,reviewed:false,ticket:null,notice:'Correção recebida. Vamos analisar esta nova versão.'};
      return {...next,messages:append(next,'user',correction)};
    }
    case 'TITLE': return state.ticket ? state : {...state,title:event.value,reviewed:false};
    case 'TEAM': return state.ticket ? state : {...state,team:event.value,reviewed:false};
    case 'REVIEW': return {...state,reviewed:state.status==='review'&&event.checked};
    case 'ANALYZE': {
      if(!state.draftText.trim()||state.ticket||state.status==='analyzing') return state;
      const fixture=SCENARIOS[state.scenario];
      const freeText=state.mode==='mock'&&state.draftText!==fixture.text&&state.draftText!==fixture.correction;
      if(freeText){
        const last=state.messages.at(-1),previous=state.messages.at(-2);
        if(last?.role==='assistant'&&last.text===FREE_TEXT_REPLY&&previous?.role==='user'&&previous.text===state.draftText) return {...state,status:'unsupported',analysis:null,reviewed:false,corrected:false,team:'human',title:state.title===fixture.title?'':state.title,draftDirty:false,notice:FREE_TEXT_REPLY};
        const committed=commitDraft(state);
        return {...committed,status:'unsupported',analysis:null,reviewed:false,corrected:false,team:'human',title:state.title===fixture.title?'':state.title,messages:append(committed,'assistant',FREE_TEXT_REPLY),notice:FREE_TEXT_REPLY};
      }
      const committed=state.mode==='mock'?commitDraft(state):{...state,draftDirty:false};
      return {...committed,status:'analyzing',analysis:null,reviewed:false,corrected:state.draftText===fixture.correction,notice:state.mode==='mock'?'Analisando o relato.':'Consultando Decisions no servidor.'};
    }
    case 'RESOLVED': {
      if(event.session!==state.session||event.revision!==state.revision||state.status!=='analyzing') return state;
      const r=event.result;
      if(!r||r.source!==(state.mode==='mock'?'mock':'openai')||!Object.hasOwn(TEAMS,r.team)||![r.probability,r.confidence,r.score].every(Number.isFinite)||r.probability<0||r.probability>1||r.confidence<0||r.confidence>1||r.score<0||r.score>2||typeof r.explanation!=='string') return {...state,status:'error',notice:'A resposta não corresponde ao contrato esperado.',analysis:null,reviewed:false};
      return {...state,status:r.team==='human'?'clarify':'review',analysis:r,team:r.team,reviewed:false,messages:append(state,'assistant',r.explanation),notice:r.team==='human'?'Precisamos de mais contexto. Nenhum ticket foi criado.':'Revise o relato e a equipe. O ticket ainda é um rascunho.'};
    }
    case 'FAILED': return event.session!==state.session||event.revision!==state.revision||state.status!=='analyzing'?state:{...state,status:'error',analysis:null,reviewed:false,notice:'A análise falhou. Seu relato continua aqui; tente novamente.'};
    case 'CREATE': {
      if(!canCreate(state)) return state;
      const ticket:Ticket={id:'DEMO-0001',title:state.title.trim(),description:state.draftText.trim(),team:state.team,revision:state.reportVersion,simulated:true};
      const at=Date.now();
      const history=[...state.history,{id:ticket.id,team:ticket.team,at,demo:false,title:ticket.title}];
      return {...state,status:'created',ticket,history,insight:monitoringInsight(history,{team:ticket.team,at},TEAMS[ticket.team]),notice:'Ticket simulado criado. Nenhum sistema externo recebeu informações.',messages:append(state,'assistant',`O ticket simulado DEMO-0001 foi criado para ${TEAMS[state.team]}.`)};
    }
  }
}
