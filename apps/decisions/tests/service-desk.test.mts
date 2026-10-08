import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, deskReducer, FREE_TEXT_REPLY, mockDecision, SCENARIOS } from '../src/domain/service-desk.ts';

function reviewable() {
  let s = createDesk();
  s = deskReducer(s, { type: 'REPLAY', scenario: 'access' });
  s = deskReducer(s, { type: 'ANALYZE' });
  return deskReducer(s, { type: 'RESOLVED', session: s.session, revision: s.revision, result: mockDecision(s.scenario, false) });
}

test('starts in a clearly simulated state without a ticket', () => {
  const s = createDesk();
  assert.equal(s.mode, 'mock'); assert.equal(s.ticket, null); assert.equal(s.status, 'ready');
});
test('replaying a completed utterance does not analyze it automatically', () => {
  const s = deskReducer(createDesk(), { type: 'REPLAY', scenario: 'access' });
  assert.equal(s.status, 'needs-analysis'); assert.equal(s.analysis, null); assert.match(s.draftText, /senha/);
});
test('a valid decision suggests a team but cannot create a ticket by itself', () => {
  const s = reviewable(); assert.equal(s.analysis?.team, 'access'); assert.equal(s.ticket, null);
  assert.equal(deskReducer(s, { type: 'CREATE' }).ticket, null);
});
test('explicit review enables a single simulated ticket and repeated clicks are idempotent', () => {
  const s = deskReducer(reviewable(), { type: 'REVIEW', checked: true });
  const once = deskReducer(s, { type: 'CREATE' });
  assert.equal(once.ticket?.id, 'DEMO-0001'); assert.equal(once.ticket?.team, 'access');
  assert.deepEqual(deskReducer(once, { type: 'CREATE' }), once);
});
test('a correction invalidates the analysis and old approval', () => {
  let s = deskReducer(reviewable(), { type: 'REVIEW', checked: true });
  const old = s.revision; s = deskReducer(s, { type: 'CORRECT' });
  assert.ok(s.revision > old); assert.equal(s.reportVersion, 2);
  assert.equal(s.draftText, SCENARIOS.access.correction);
  assert.equal(s.reviewed, false); assert.equal(s.analysis, null);
  assert.equal(deskReducer(s, { type: 'CREATE' }).ticket, null);
});
test('an old result cannot overwrite a corrected request', () => {
  let s = deskReducer(createDesk(), { type: 'REPLAY', scenario: 'access' });
  s = deskReducer(s, { type: 'ANALYZE' }); const old = { session:s.session, revision:s.revision };
  s = deskReducer(s, { type: 'CORRECT' }); s = deskReducer(s, { type: 'ANALYZE' });
  const ignored = deskReducer(s, { type: 'RESOLVED', ...old, result:mockDecision('access',false) });
  assert.deepEqual(ignored,s);
  const valid = deskReducer(s, { type:'RESOLVED', session:s.session, revision:s.revision, result:mockDecision('access',true) });
  assert.equal(valid.analysis?.team,'applications');
});
test('reset ignores a late response from the previous session', () => {
  const before=deskReducer(deskReducer(createDesk(),{type:'REPLAY',scenario:'access'}),{type:'ANALYZE'});
  const reset=deskReducer(before,{type:'RESET'});
  assert.ok(reset.session > before.session);
  assert.deepEqual(deskReducer(reset,{type:'RESOLVED',session:before.session,revision:before.revision,result:mockDecision('access',false)}),reset);
});
test('editing the title or team revokes the human review',()=>{
  const s=deskReducer(reviewable(),{type:'REVIEW',checked:true});
  assert.equal(deskReducer(s,{type:'TITLE',value:'Outro título'}).reviewed,false);
  assert.equal(deskReducer(s,{type:'TEAM',value:'infrastructure'}).reviewed,false);
});
test('blank incident or title cannot be confirmed',()=>{
  let s=deskReducer(reviewable(),{type:'EDIT',value:'   '});
  assert.equal(deskReducer(s,{type:'ANALYZE'}).status,'needs-analysis');
  s=deskReducer(reviewable(),{type:'TITLE',value:' '});s=deskReducer(s,{type:'REVIEW',checked:true});
  assert.equal(deskReducer(s,{type:'CREATE'}).ticket,null);
});
test('failure and ambiguous cases require clarification without invented tickets',()=>{
  let s=deskReducer(deskReducer(createDesk(),{type:'REPLAY',scenario:'ambiguous'}),{type:'ANALYZE'});
  s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:mockDecision('ambiguous',false)});
  assert.equal(s.status,'clarify');assert.equal(s.ticket,null);
});

test('free text does not get a canned suggestion disguised as an analysis',()=>{
 let s=deskReducer(createDesk(),{type:'EDIT',value:'Um relato fora das fixtures'});
 s=deskReducer(s,{type:'ANALYZE'});
 assert.equal(s.status,'unsupported'); assert.notEqual(s.status,'clarify');
 assert.equal(s.analysis,null); assert.equal(s.team,'human'); assert.equal(s.ticket,null);
 assert.equal(s.messages.filter(message=>message.role==='user').at(-1)?.text,'Um relato fora das fixtures');
 assert.equal(s.messages.at(-1)?.text,FREE_TEXT_REPLY);
 assert.equal(deskReducer(s,{type:'ANALYZE'}).messages.length,s.messages.length);
});
test('simulated free text stays in the conversation and does not keep the previous scenario',()=>{
 let s=deskReducer(createDesk(),{type:'REPLAY',scenario:'network'});
 s=deskReducer(s,{type:'ANALYZE'});
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:mockDecision('network',false)});
 assert.equal(s.team,'infrastructure'); assert.equal(s.title,SCENARIOS.network.title);
 const typed='Desde as 9h o VPN da filial de Niterói cai a cada 10 minutos, afeta o time financeiro inteiro';
 s=deskReducer(s,{type:'EDIT',value:typed});
 s=deskReducer(s,{type:'ANALYZE'});
 assert.equal(s.status,'unsupported'); assert.equal(s.analysis,null); assert.equal(s.team,'human');
 assert.equal(s.title,''); assert.equal(s.ticket,null); assert.equal(s.notice,FREE_TEXT_REPLY);
 assert.equal(s.messages.filter(message=>message.role==='user').at(-1)?.text,typed);
 assert.equal(s.messages.at(-1)?.text,FREE_TEXT_REPLY);
 assert.equal(s.messages.filter(message=>message.text===SCENARIOS.network.text).length,1);
});
test('replacing an incomplete report does not resend the earlier text',()=>{
 let s=deskReducer(createDesk(),{type:'REPLAY',scenario:'ambiguous'});
 s=deskReducer(s,{type:'ANALYZE'});
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:mockDecision('ambiguous',false)});
 const previous=s.messages.at(-1)?.text??'';
 assert.match(previous,/esclarecer/);
 s=deskReducer(s,{type:'EDIT',value:'não está funcionando'});
 const version=s.reportVersion;
 s=deskReducer(s,{type:'ANALYZE'});
 assert.equal(s.reportVersion,version); assert.equal(s.status,'unsupported');
 assert.equal(s.messages.filter(message=>message.role==='user').at(-1)?.text,'não está funcionando');
 assert.notEqual(s.messages.at(-1)?.text,previous);
 assert.ok(s.messages.some(message=>message.text===SCENARIOS.ambiguous.text));
});
test('reanalysis uses the report the person edited',()=>{
 let s=deskReducer(createDesk(),{type:'REPLAY',scenario:'access'});
 s=deskReducer(s,{type:'ANALYZE'});
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:mockDecision('access',false)});
 const edited=SCENARIOS.access.correction;
 s=deskReducer(s,{type:'EDIT',value:edited});
 assert.equal(s.draftText,edited); assert.equal(s.analysis,null); assert.equal(s.reportVersion,2);
 s=deskReducer(s,{type:'ANALYZE'});
 assert.equal(s.status,'analyzing'); assert.equal(s.corrected,true);
 assert.equal(s.messages.filter(message=>message.role==='user').at(-1)?.text,edited);
 s=deskReducer(s,{type:'RESOLVED',session:s.session,revision:s.revision,result:mockDecision(s.scenario,s.corrected)});
 assert.equal(s.analysis?.team,'applications');
 assert.equal(s.messages.at(-1)?.text,s.analysis?.explanation);
});
test('the visible report version advances once per edit while every change invalidates in-flight work',()=>{
 let s=deskReducer(createDesk(),{type:'REPLAY',scenario:'network'});
 assert.equal(s.reportVersion,1);
 s=deskReducer(s,{type:'ANALYZE'});
 const old={session:s.session,revision:s.revision};
 s=deskReducer(s,{type:'EDIT',value:'Desde'});
 s=deskReducer(s,{type:'EDIT',value:'Desde as 9h o VPN'});
 assert.equal(s.reportVersion,2); assert.equal(s.revision,old.revision+2);
 assert.deepEqual(deskReducer(s,{type:'RESOLVED',...old,result:mockDecision('network',false)}),s);
 s=deskReducer(s,{type:'ANALYZE'});
 assert.equal(s.reportVersion,2); assert.equal(s.revision,old.revision+2);
});
