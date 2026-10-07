
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSpokenReply } from '../src/domain/spoken-reply.ts';
const message={id:4,role:'assistant' as const,text:'Sugestão antiga',revision:1};
const base={session:2,revision:1,status:'review' as const,messages:[message]};
test('current assistant reply may be spoken once',()=>{
  assert.deepEqual(getSpokenReply(base,''),{key:'2:1:4',text:'Sugestão antiga'});
  assert.equal(getSpokenReply(base,'2:1:4'),null);
});
test('editing a report never replays its old assistant reply',()=>{
  assert.equal(getSpokenReply({...base,revision:2,status:'needs-analysis'},''),null);
  assert.equal(getSpokenReply({...base,revision:2,status:'clarify'},''),null);
});
test('analysis, reset and failure do not speak a previous reply',()=>{
  for(const status of ['analyzing','ready','error'] as const) assert.equal(getSpokenReply({...base,status},''),null);
  assert.equal(getSpokenReply({...base,messages:[]},''),null);
});
test('a user message never becomes assistant speech',()=>{
  assert.equal(getSpokenReply({...base,messages:[{...message,role:'user'}]},''),null);
});
