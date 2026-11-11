const test = require('node:test');
const assert = require('node:assert/strict');
const { xdr } = require('@stellar/stellar-sdk');
const { parseEvent } = require('../dist/parse.js');
const { registerContract, processEvent } = require('../dist/events/index.js');

test('parseEvent extracts event name, topic values, and payload', () => {
  const topics = [
    xdr.ScVal.scvSymbol('PropertyRegistered'),
    xdr.ScVal.scvU64(new xdr.Uint64(1n)),
  ];
  const value = xdr.ScVal.scvVec([
    xdr.ScVal.scvAddress(
      xdr.ScAddress.scAddressTypeAccount(
        xdr.PublicKey.publicKeyTypeEd25519(Buffer.alloc(32, 1)),
      ),
    ),
    xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: 0n, lo: 100000n })),
    xdr.ScVal.scvSymbol('US'),
  ]);

  const parsed = parseEvent(topics, value);
  assert.equal(parsed.name, 'PropertyRegistered');
  assert.equal(parsed.topicValues.length, 1);
  assert.equal(parsed.topicValues[0], 1n);
  assert.ok(Array.isArray(parsed.data));
  assert.equal(parsed.data[1], 100000n);
  assert.equal(parsed.data[2], 'US');
});

test('processEvent routes to registered contract handler', async () => {
  let handlerCalled = false;
  let receivedTopic = null;
  let receivedData = null;

  registerContract('mock_contract_id', {
    StatusUpdated: async (data, topics, ledger) => {
      handlerCalled = true;
      receivedTopic = topics[0];
      receivedData = data;
    },
  });

  const topics = [
    xdr.ScVal.scvSymbol('StatusUpdated'),
    xdr.ScVal.scvU64(new xdr.Uint64(42n)),
  ];
  const value = xdr.ScVal.scvSymbol('UnderMaintenance');

  await processEvent('mock_contract_id', topics, value, 100);

  assert.equal(handlerCalled, true);
  assert.equal(receivedTopic, 42n);
  assert.equal(receivedData, 'UnderMaintenance');
});
