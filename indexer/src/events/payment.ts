import { prisma } from '../db';

export async function handlePaymentEvent(
  kind: string,
  data: any,
  topics: any[],
  ledger: number,
): Promise<void> {
  switch (kind) {
    case 'sent': {
      const from = String(topics[0]);
      const [to, amount, src, destAmount, dst] = data;
      await prisma.payment.create({
        data: {
          from,
          to: String(to),
          srcAsset: String(src),
          srcAmount: BigInt(amount),
          dstAsset: String(dst),
          dstAmount: BigInt(destAmount),
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          ledgerSeq: ledger,
        },
      });
      break;
    }
    case 'batch_dispatched': {
      const from = String(topics[0]);
      const [recipientCount, src, dst] = data;
      console.log(
        `[Indexer] Batch dispatched from ${from}: ${recipientCount} recipients, ${src} -> ${dst}`,
      );
      break;
    }
    case 'anchor_registered': {
      const asset = String(topics[0]);
      const tokenAddress = String(data);
      console.log(`[Indexer] Anchor registered: ${asset} -> ${tokenAddress}`);
      break;
    }
  }
}
