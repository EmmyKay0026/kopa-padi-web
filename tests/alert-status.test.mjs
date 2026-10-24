import {test} from 'node:test';import assert from 'node:assert/strict';
import {alertStatusMessage} from '../lib/alert-status.mjs';
test('zero and phone-only recipients do not produce an alerted success',()=>{
 const text=alertStatusMessage({status:'NO_ELIGIBLE_RECIPIENTS'},'Saved');assert.match(text,/No eligible email recipients/);assert.match(text,/Phone-only/);assert.doesNotMatch(text,/contacts alerted/i);
});
test('queued notification is distinguished from provider acceptance and delivery',()=>{
 const text=alertStatusMessage({status:'QUEUED',queued:2},'Saved');assert.match(text,/2 email notification/);assert.match(text,/not confirmed delivered/);assert.equal(alertStatusMessage(undefined,'Saved'),'Saved');
});
