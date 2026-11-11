import { nativeToScVal } from '@stellar/stellar-sdk';
import { SorobanClient, type SorobanSigner } from './base';
import type { TxOptions } from '../types';

export class RentDistributorClient extends SorobanClient {
  constructor(rpcUrl: string, contractId: string, networkPassphrase?: string) {
    super(rpcUrl, contractId, networkPassphrase);
  }

  async initialize(admin: string, signer: SorobanSigner, options?: TxOptions): Promise<string> {
    return this.signAndSend('initialize', [nativeToScVal(admin, { type: 'address' })], signer, options);
  }

  async depositRent(
    sender: string,
    propId: number,
    amount: bigint,
    token: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'deposit_rent',
      [
        nativeToScVal(sender, { type: 'address' }),
        nativeToScVal(propId, { type: 'u64' }),
        nativeToScVal(amount, { type: 'i128' }),
        nativeToScVal(token, { type: 'address' }),
      ],
      signer,
      options,
    );
  }

  async distribute(propId: number, signer: SorobanSigner, options?: TxOptions): Promise<string> {
    return this.signAndSend('distribute', [nativeToScVal(propId, { type: 'u64' })], signer, options);
  }

  async claim(
    propId: number,
    investor: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'claim',
      [
        nativeToScVal(propId, { type: 'u64' }),
        nativeToScVal(investor, { type: 'address' }),
      ],
      signer,
      options,
    );
  }

  async pendingYield(investor: string, propId: number): Promise<bigint> {
    const result = await this.simulateView('pending_yield', [
      nativeToScVal(investor, { type: 'address' }),
      nativeToScVal(propId, { type: 'u64' }),
    ]);
    return BigInt(result as number);
  }

  async setSchedule(
    propId: number,
    intervalDays: number,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'set_schedule',
      [
        nativeToScVal(propId, { type: 'u64' }),
        nativeToScVal(intervalDays, { type: 'u32' }),
      ],
      signer,
      options,
    );
  }

  async setFractionVault(
    vault: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'set_fraction_vault',
      [nativeToScVal(vault, { type: 'address' })],
      signer,
      options,
    );
  }
}
