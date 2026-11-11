import { nativeToScVal } from '@stellar/stellar-sdk';
import { SorobanClient, toBytesBuffer, type SorobanSigner } from './base';
import type { ProposalData, TxOptions } from '../types';

export class GovernanceClient extends SorobanClient {
  constructor(rpcUrl: string, contractId: string, networkPassphrase?: string) {
    super(rpcUrl, contractId, networkPassphrase);
  }

  async initialize(
    admin: string,
    fractionVault: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'initialize',
      [
        nativeToScVal(admin, { type: 'address' }),
        nativeToScVal(fractionVault, { type: 'address' }),
      ],
      signer,
      options,
    );
  }

  async setQuorum(
    quorum: bigint,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'set_quorum',
      [nativeToScVal(quorum, { type: 'u128' })],
      signer,
      options,
    );
  }

  async addTrackedProperty(
    propId: number,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'add_tracked_property',
      [nativeToScVal(propId, { type: 'u64' })],
      signer,
      options,
    );
  }

  async propose(
    actionType: number,
    calldata: string | Uint8Array,
    description: string,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'propose',
      [
        nativeToScVal(actionType, { type: 'u32' }),
        nativeToScVal(toBytesBuffer(calldata), { type: 'bytes' }),
        nativeToScVal(description, { type: 'string' }),
      ],
      signer,
      options,
    );
  }

  async vote(
    voter: string,
    proposalId: number,
    support: boolean,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'vote',
      [
        nativeToScVal(voter, { type: 'address' }),
        nativeToScVal(proposalId, { type: 'u64' }),
        nativeToScVal(support, { type: 'bool' }),
      ],
      signer,
      options,
    );
  }

  async execute(
    proposalId: number,
    signer: SorobanSigner,
    options?: TxOptions,
  ): Promise<string> {
    return this.signAndSend(
      'execute',
      [nativeToScVal(proposalId, { type: 'u64' })],
      signer,
      options,
    );
  }

  async votingPower(user: string): Promise<bigint> {
    const result = await this.simulateView('voting_power', [
      nativeToScVal(user, { type: 'address' }),
    ]);
    return BigInt(result as number);
  }

  async getProposal(proposalId: number): Promise<ProposalData> {
    const result = await this.simulateView('get_proposal', [
      nativeToScVal(proposalId, { type: 'u64' }),
    ]);
    return result as ProposalData;
  }

  async getQuorum(): Promise<bigint> {
    const result = await this.simulateView('get_quorum', []);
    return BigInt(result as number);
  }

  async getTrackedProperties(): Promise<number[]> {
    const result = await this.simulateView('get_tracked_properties', []);
    return (result as Array<number | bigint>).map((id) => Number(id));
  }

  async hasVoted(proposalId: number, voter: string): Promise<boolean> {
    const result = await this.simulateView('has_voted', [
      nativeToScVal(proposalId, { type: 'u64' }),
      nativeToScVal(voter, { type: 'address' }),
    ]);
    return Boolean(result);
  }

  async proposalCount(): Promise<number> {
    const result = await this.simulateView('proposal_count', []);
    return Number(result);
  }
}
