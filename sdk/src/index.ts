export * from './types';
export {
  SorobanClient,
  ComplianceRegistryClient,
  PropertyRegistryClient,
  FractionVaultClient,
  MortgagePoolClient,
  OracleAdapterClient,
  RentDistributorClient,
  PaymentBridgeClient,
  GovernanceClient,
  type SorobanSigner,
} from './clients';

import {
  ComplianceRegistryClient,
  PropertyRegistryClient,
  FractionVaultClient,
  MortgagePoolClient,
  OracleAdapterClient,
  RentDistributorClient,
  PaymentBridgeClient,
  GovernanceClient,
} from './clients';

export interface PropFiSDK {
  rpcUrl: string;
  networkPassphrase?: string;

  complianceRegistry: ComplianceRegistryClient;
  propertyRegistry: PropertyRegistryClient;
  fractionVault: FractionVaultClient;
  mortgagePool: MortgagePoolClient;
  oracleAdapter?: OracleAdapterClient;
  rentDistributor?: RentDistributorClient;
  paymentBridge?: PaymentBridgeClient;
  governance?: GovernanceClient;

  getComplianceRegistry(): ComplianceRegistryClient;
  getPropertyRegistry(): PropertyRegistryClient;
  getFractionVault(): FractionVaultClient;
  getMortgagePool(): MortgagePoolClient;
  getOracleAdapter(): OracleAdapterClient | undefined;
  getRentDistributor(): RentDistributorClient | undefined;
  getPaymentBridge(): PaymentBridgeClient | undefined;
  getGovernance(): GovernanceClient | undefined;
}

export interface PropFiConfig {
  rpcUrl: string;
  networkPassphrase?: string;
  complianceRegistryId: string;
  propertyRegistryId: string;
  fractionVaultId: string;
  mortgagePoolId: string;
  oracleAdapterId?: string;
  rentDistributorId?: string;
  paymentBridgeId?: string;
  governanceId?: string;
}

export function createPropFi(config: PropFiConfig): PropFiSDK {
  const { rpcUrl, networkPassphrase } = config;

  const complianceRegistry = new ComplianceRegistryClient(
    rpcUrl,
    config.complianceRegistryId,
    networkPassphrase,
  );
  const propertyRegistry = new PropertyRegistryClient(
    rpcUrl,
    config.propertyRegistryId,
    networkPassphrase,
  );
  const fractionVault = new FractionVaultClient(
    rpcUrl,
    config.fractionVaultId,
    networkPassphrase,
  );
  const mortgagePool = new MortgagePoolClient(
    rpcUrl,
    config.mortgagePoolId,
    networkPassphrase,
  );
  const oracleAdapter = config.oracleAdapterId
    ? new OracleAdapterClient(rpcUrl, config.oracleAdapterId, networkPassphrase)
    : undefined;
  const rentDistributor = config.rentDistributorId
    ? new RentDistributorClient(rpcUrl, config.rentDistributorId, networkPassphrase)
    : undefined;
  const paymentBridge = config.paymentBridgeId
    ? new PaymentBridgeClient(rpcUrl, config.paymentBridgeId, networkPassphrase)
    : undefined;
  const governance = config.governanceId
    ? new GovernanceClient(rpcUrl, config.governanceId, networkPassphrase)
    : undefined;

  return {
    rpcUrl,
    networkPassphrase,

    complianceRegistry,
    propertyRegistry,
    fractionVault,
    mortgagePool,
    oracleAdapter,
    rentDistributor,
    paymentBridge,
    governance,

    getComplianceRegistry() {
      return complianceRegistry;
    },
    getPropertyRegistry() {
      return propertyRegistry;
    },
    getFractionVault() {
      return fractionVault;
    },
    getMortgagePool() {
      return mortgagePool;
    },
    getOracleAdapter() {
      return oracleAdapter;
    },
    getRentDistributor() {
      return rentDistributor;
    },
    getPaymentBridge() {
      return paymentBridge;
    },
    getGovernance() {
      return governance;
    },
  };
}
