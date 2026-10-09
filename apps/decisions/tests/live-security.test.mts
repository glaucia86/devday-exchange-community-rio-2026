import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveHandler } from '../src/server/live-handler.ts';

const origin = 'http://127.0.0.1:3000';
const token = 'test-only-demo-access-token-not-a-real-secret';
const env = { MESA_LIVE_ENABLED: 'true', MESA_LIVE_ACCESS_TOKEN: token, OPENAI_API_KEY: 'test-only-fake-key' };
const request = (body: unknown, changes: Record<string, string | null> = {}) => {
  const headers = new Headers({ origin, host: '127.0.0.1:3000', 'content-type': 'application/json', authorization: `Bearer ${token}` });
  for (const [name, value] of Object.entries(changes)) value === null ? headers.delete(name) : headers.set(name, value);
  return new Request(origin + '/api/live', { method: 'POST', headers, body: JSON.stringify(body) });
};

test('invalid access is rejected before either inference or the session guard', async t => {
  let upstream = 0, guards = 0;
  const handle = createLiveHandler(env, async () => { upstream++; throw Error('Unexpected upstream call'); }, async () => { guards++; throw Error('Unexpected guard call'); });
  for (const [name, headers, status] of [
    ['missing token', { authorization: null }, 401],
    ['wrong token', { authorization: 'Bearer wrong' }, 401],
    ['oversized token', { authorization: 'Bearer ' + 'x'.repeat(600) }, 401],
    ['non-ASCII token', { authorization: 'Bearer ' + 'é'.repeat(40) }, 401],
    ['missing origin', { origin: null }, 403],
    ['missing host', { host: null }, 403],
    ['wrong port', { origin: 'http://127.0.0.1:3001' }, 403],
    ['mixed loopback names', { origin: 'http://localhost:3000' }, 403],
    ['public origin', { origin: 'https://public.example' }, 403],
    ['public host', { host: 'public.example:3000' }, 403],
    ['wrong content type', { 'content-type': 'text/plain' }, 415],
  ] as const) {
    await t.test(name, async () => {
      assert.equal((await handle(request({ action: 'start', sdp: 'v=0' }, headers))).status, status);
      assert.equal(upstream, 0);
      assert.equal(guards, 0);
    });
  }
});

test('invalid start bodies are rejected before opening a session', async t => {
  let upstream = 0, guards = 0;
  const handle = createLiveHandler(env, async () => { upstream++; throw Error('Unexpected upstream call'); }, async () => { guards++; throw Error('Unexpected guard call'); });
  for (const [name, body, status] of [
    ['null body', null, 400],
    ['array body', [], 400],
    ['unknown action', { action: 'execute_shell' }, 400],
    ['missing SDP', { action: 'start' }, 400],
    ['non-string SDP', { action: 'start', sdp: 42 }, 400],
    ['invalid SDP', { action: 'start', sdp: 'not-sdp' }, 400],
    ['SDP exceeds its field limit', { action: 'start', sdp: 'v=0' + 'x'.repeat(60000) }, 400],
    ['body exceeds its byte limit', { action: 'start', sdp: 'v=0' + 'x'.repeat(70000) }, 413],
  ] as const) {
    await t.test(name, async () => {
      assert.equal((await handle(request(body))).status, status);
      assert.equal(upstream, 0);
      assert.equal(guards, 0);
    });
  }
  const malformed = request({});
  const badJSON = new Request(malformed.url, { method: 'POST', headers: malformed.headers, body: '{' });
  assert.equal((await handle(badJSON)).status, 400);
  assert.equal(upstream, 0);
});

test('invalid decision fields are rejected before inference in an owned session', async t => {
  let upstream = 0;
  const handle = createLiveHandler(env, async () => {
    upstream++;
    return Response.json({ session: { id: 'fixture_security' }, transport: { type: 'webrtc', sdp: 'v=0' } });
  }, async () => ({ close: async () => true, finalized: new Promise<boolean>(() => {}) }));
  assert.equal((await handle(request({ action: 'start', sdp: 'v=0', mode: 'triage' }))).status, 200);
  t.after(() => handle(request({ action: 'close', sessionId: 'fixture_security' })));
  const valid = { action: 'decide', sessionId: 'fixture_security', revision: 1, text: 'Relato fictício.', transcript: [] };
  for (const [name, changes, status] of [
    ['unknown session', { sessionId: 'not_owned' }, 409],
    ['negative revision', { revision: -1 }, 409],
    ['fractional revision', { revision: 1.5 }, 409],
    ['string revision', { revision: '1' }, 409],
    ['unsafe revision', { revision: Number.MAX_SAFE_INTEGER + 1 }, 409],
    ['non-string report', { text: [] }, 400],
    ['empty report', { text: '   ' }, 400],
    ['long report', { text: 'x'.repeat(8001) }, 400],
    ['non-array transcript', { transcript: {} }, 400],
    ['too many transcript lines', { transcript: Array.from({ length: 31 }, () => ({ role: 'user', text: 'x' })) }, 400],
    ['invalid transcript role', { transcript: [{ role: 'system', text: 'x' }] }, 400],
    ['non-string transcript text', { transcript: [{ role: 'user', text: 42 }] }, 400],
    ['long transcript text', { transcript: [{ role: 'user', text: 'x'.repeat(8001) }] }, 400],
  ] as const) {
    await t.test(name, async () => {
      assert.equal((await handle(request({ ...valid, ...changes }))).status, status);
      assert.equal(upstream, 1, 'only the fixture session start reached the injected upstream');
    });
  }
});
