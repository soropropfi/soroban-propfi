const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createPropFi,
  ComplianceRegistryClient,
  PropertyRegistryClient,
  FractionVaultClient,
  MortgagePoolClient,
  OracleAdapterClient,
  RentDistributorClient,
  PaymentBridgeClient,
  GovernanceClient,
  PropertyStatus,
  LoanStatus,
} = require('../dist/index.js');

const SAMPLE_CONTRACT_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
const SAMPLE_USER = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';

test('createPropFi instantiates all 8 contract clients when configured', () => {
  const sdk = createPropFi({
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    complianceRegistryId: SAMPLE_CONTRACT_ID,
    propertyRegistryId: SAMPLE_CONTRACT_ID,
    fractionVaultId: SAMPLE_CONTRACT_ID,
    mortgagePoolId: SAMPLE_CONTRACT_ID,
    oracleAdapterId: SAMPLE_CONTRACT_ID,
    rentDistributorId: SAMPLE_CONTRACT_ID,
    paymentBridgeId: SAMPLE_CONTRACT_ID,
    governanceId: SAMPLE_CONTRACT_ID,
  });

  assert.equal(sdk.rpcUrl, 'https://soroban-testnet.stellar.org');
  assert.ok(sdk.getComplianceRegistry() instanceof ComplianceRegistryClient);
  assert.ok(sdk.getPropertyRegistry() instanceof PropertyRegistryClient);
  assert.ok(sdk.getFractionVault() instanceof FractionVaultClient);
  assert.ok(sdk.getMortgagePool() instanceof MortgagePoolClient);
  assert.ok(sdk.getOracleAdapter() instanceof OracleAdapterClient);
  assert.ok(sdk.getRentDistributor() instanceof RentDistributorClient);
  assert.ok(sdk.getPaymentBridge() instanceof PaymentBridgeClient);
  assert.ok(sdk.getGovernance() instanceof GovernanceClient);
});

test('ComplianceRegistryClient encodes u32 duration_days in attest', async () => {
  const client = new ComplianceRegistryClient(
    'https://soroban-testnet.stellar.org',
    SAMPLE_CONTRACT_ID,
  );

  let capturedMethod = null;
  let capturedParams = null;
  client.signAndSend = async (method, params) => {
    capturedMethod = method;
    capturedParams = params;
    return 'mock_tx_hash';
  };

  const mockSigner = {
    getPublicKey: async () => SAMPLE_USER,
    signTransaction: async (xdr) => xdr,
  };

  const hash = await client.attest(SAMPLE_USER, 'proof_123', 'US', 365, mockSigner);
  assert.equal(hash, 'mock_tx_hash');
  assert.equal(capturedMethod, 'attest');
  assert.equal(capturedParams.length, 4);
  assert.equal(capturedParams[3].switch().name, 'scvU32');
});

test('FractionVaultClient and MortgagePoolClient expose new view methods', async () => {
  const vault = new FractionVaultClient(
    'https://soroban-testnet.stellar.org',
    SAMPLE_CONTRACT_ID,
  );
  vault.simulateView = async (method) => {
    if (method === 'sold_supply') return 250;
    if (method === 'available_fractions') return 750;
    return 0;
  };

  assert.equal(await vault.soldSupply(1), 250n);
  assert.equal(await vault.availableFractions(1), 750n);

  const pool = new MortgagePoolClient(
    'https://soroban-testnet.stellar.org',
    SAMPLE_CONTRACT_ID,
  );
  pool.simulateView = async (method) => {
    if (method === 'get_total_liquidity') return 500000;
    if (method === 'get_lp_balance') return 125000;
    return null;
  };

  assert.equal(await pool.getTotalLiquidity(), 500000n);
  assert.equal(await pool.getLpBalance(SAMPLE_USER), 125000n);
});

test('GovernanceClient and RentDistributorClient view methods parse responses', async () => {
  const gov = new GovernanceClient(
    'https://soroban-testnet.stellar.org',
    SAMPLE_CONTRACT_ID,
  );
  gov.simulateView = async (method) => {
    if (method === 'get_quorum') return 1000;
    if (method === 'get_tracked_properties') return [1n, 2n];
    if (method === 'has_voted') return true;
    if (method === 'proposal_count') return 3;
    return 0;
  };

  assert.equal(await gov.getQuorum(), 1000n);
  assert.deepEqual(await gov.getTrackedProperties(), [1, 2]);
  assert.equal(await gov.hasVoted(1, SAMPLE_USER), true);
  assert.equal(await gov.proposalCount(), 3);

  const rent = new RentDistributorClient(
    'https://soroban-testnet.stellar.org',
    SAMPLE_CONTRACT_ID,
  );
  rent.simulateView = async () => 4200;
  assert.equal(await rent.pendingYield(SAMPLE_USER, 1), 4200n);
  assert.equal(PropertyStatus.Active, 'Active');
  assert.equal(LoanStatus.Repaid, 'Repaid');
});
