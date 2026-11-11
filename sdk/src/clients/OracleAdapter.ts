import { nativeToScVal } from '@stellar/stellar-sdk';
import { SorobanClient, type SorobanSigner } from './base';
import type { OracleInfo, PriceData, TxOptions } from '../types';

export class OracleAdapterClient extends SorobanClient {
  constructor(rpcUrl: string, contractId: string, networkPassphrase?: string) {
    super(rpcUrl, contractId, networkPassphrase);
  }

  async initialize(
    admin: string,
    stalenessThreshold: number,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'initialize',
      [
        nativeToScVal(admin, { type: 'address' }),
        nativeToScVal(stalenessThreshold, { type: 'u64' }),
      ],
      signer,
      options,
    );
  }

  async addOracle(
    oracleAddr: string,
    weight: number,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'add_oracle',
      [
        nativeToScVal(oracleAddr, { type: 'address' }),
        nativeToScVal(weight, { type: 'u32' }),
      ],
      signer,
      options,
    );
  }

  async removeOracle(
    oracleAddr: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'remove_oracle',
      [nativeToScVal(oracleAddr, { type: 'address' })],
      signer,
      options,
    );
  }

  async submitPrice(
    oracle: string,
    asset: string,
    price: bigint,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'submit_price',
      [
        nativeToScVal(oracle, { type: 'address' }),
        nativeToScVal(asset, { type: 'symbol' }),
        nativeToScVal(price, { type: 'i128' }),
      ],
      signer,
      options,
    );
  }

  async getPrice(asset: string): Promise<PriceData> {
    const result = await this.simulateView('get_price', [
      nativeToScVal(asset, { type: 'symbol' }),
    ]);
    return result as PriceData;
  }

  async twap(asset: string, windowSecs: number): Promise<bigint> {
    const result = await this.simulateView('twap', [
      nativeToScVal(asset, { type: 'symbol' }),
      nativeToScVal(windowSecs, { type: 'u64' }),
    ]);
    return BigInt(result as number);
  }

  async getOracleInfo(oracleAddr: string): Promise<OracleInfo> {
    const result = await this.simulateView('get_oracle_info', [
      nativeToScVal(oracleAddr, { type: 'address' }),
    ]);
    return result as OracleInfo;
  }
}
