import {test} from 'node:test';
import assert from 'node:assert/strict';
import {previewApiTarget,previewBuildTarget} from '../lib/staging-target.mjs';
test('preview fails closed without an isolated HTTPS API',()=>{
  for(const value of ['https://api.kopa-padi.corper-paddy.com.ng.','https://API.KOPA-PADI.CORPER-PADDY.COM.NG','https://api.kopa-padi.corper-paddy.com.ng:8443']) assert.throws(()=>previewApiTarget(value));
  for(const value of [undefined,'http://staging.invalid','https://api.kopa-padi.corper-paddy.com.ng','https://user:secret@staging.invalid','https://staging.invalid/path','https://staging.invalid/?x=1']) assert.throws(()=>previewApiTarget(value));
  assert.equal(previewApiTarget('https://api.staging.invalid/'),'https://api.staging.invalid');
});
test('the compiled public API target must match the preview runtime binding',()=>{
  for(const value of [undefined,'https://api.kopa-padi.corper-paddy.com.ng']) assert.throws(()=>previewBuildTarget('https://api.staging.invalid',value));
  assert.equal(previewBuildTarget('https://api.staging.invalid','https://api.staging.invalid'),'https://api.staging.invalid');
});
