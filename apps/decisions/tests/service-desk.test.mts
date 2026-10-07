import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesk, deskReducer, mockDecision } from '../src/domain/service-desk.ts';

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
  assert.ok(s.revision > old); assert.equal(s.reviewed, false); assert.equal(s.analysis, null);
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
 s=deskReducer(s,{type:'ANALYZE'}); assert.equal(s.status,'clarify'); assert.equal(s.analysis,null);
});
