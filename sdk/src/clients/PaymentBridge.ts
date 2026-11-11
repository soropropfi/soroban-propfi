import { nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { SorobanClient, type SorobanSigner } from './base';
import type { PathQuote, TxOptions } from '../types';

export class PaymentBridgeClient extends SorobanClient {
  constructor(rpcUrl: string, contractId: string, networkPassphrase?: string) {
    super(rpcUrl, contractId, networkPassphrase);
  }

  async initialize(admin: string, signer: SorobanSigner, options?: TxOptions): Promise<string> {
    return this.signAndSend('initialize', [nativeToScVal(admin, { type: 'address' })], signer, options);
  }

  async deposit(
    user: string,
    asset: string,
    amount: bigint,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'deposit',
      [
        nativeToScVal(user, { type: 'address' }),
        nativeToScVal(asset, { type: 'symbol' }),
        nativeToScVal(amount, { type: 'i128' }),
      ],
      signer,
      options,
    );
  }

  async withdraw(
    user: string,
    asset: string,
    amount: bigint,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'withdraw',
      [
        nativeToScVal(user, { type: 'address' }),
        nativeToScVal(asset, { type: 'symbol' }),
        nativeToScVal(amount, { type: 'i128' }),
      ],
      signer,
      options,
    );
  }

  async send(
    from: string,
    to: string,
    amount: bigint,
    src: string,
    dst: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'send',
      [
        nativeToScVal(from, { type: 'address' }),
        nativeToScVal(to, { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' }),
        nativeToScVal(src, { type: 'symbol' }),
        nativeToScVal(dst, { type: 'symbol' }),
      ],
      signer,
      options,
    );
  }

  async batchSend(
    from: string,
    recipients: Array<{ to: string; amount: bigint }>,
    src: string,
    dst: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    const recipientsVec = xdr.ScVal.scvVec(
      recipients.map((r) =>
        xdr.ScVal.scvVec([
          nativeToScVal(r.to, { type: 'address' }),
          nativeToScVal(r.amount, { type: 'i128' }),
        ]),
      ),
    );
    return this.signAndSend(
      'batch_send',
      [
        nativeToScVal(from, { type: 'address' }),
        recipientsVec,
        nativeToScVal(src, { type: 'symbol' }),
        nativeToScVal(dst, { type: 'symbol' }),
      ],
      signer,
      options,
    );
  }

  async registerAnchor(
    asset: string,
    tokenAddress: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'register_anchor',
      [
        nativeToScVal(asset, { type: 'symbol' }),
        nativeToScVal(tokenAddress, { type: 'address' }),
      ],
      signer,
      options,
    );
  }

  async estimatePath(src: string, dst: string, amount: bigint): Promise<PathQuote> {
    const result = await this.simulateView('estimate_path', [
      nativeToScVal(src, { type: 'symbol' }),
      nativeToScVal(dst, { type: 'symbol' }),
      nativeToScVal(amount, { type: 'i128' }),
    ]);
    return result as PathQuote;
  }

  async getBalance(user: string, asset: string): Promise<bigint> {
    const result = await this.simulateView('get_balance', [
      nativeToScVal(user, { type: 'address' }),
      nativeToScVal(asset, { type: 'symbol' }),
    ]);
    return BigInt(result as number);
  }
}
