import {test} from 'node:test';
import assert from 'node:assert/strict';
import {downloadPrivateDocument} from '../lib/private-document-download.mjs';
test('private downloads include session credentials and surface authorization failures',async t=>{
  let options;
  t.mock.method(globalThis,'fetch',async (_url,init)=>{options=init;return new Response('{}',{status:403});});
  await assert.rejects(downloadPrivateDocument('https://api.staging.invalid/document'),/403/);
  assert.deepEqual(options,{credentials:'include',cache:'no-store'});
});
test('error HTML or JSON and empty documents are never saved as evidence',async t=>{
  const mock=t.mock.method(globalThis,'fetch',async()=>new Response('{}',{headers:{'content-type':'application/json'}}));
  await assert.rejects(downloadPrivateDocument('https://api.staging.invalid/document'),/did not return/);
  mock.mock.mockImplementation(async()=>new Response('',{headers:{'content-type':'image/png'}}));
  await assert.rejects(downloadPrivateDocument('https://api.staging.invalid/document'),/empty/);
});
