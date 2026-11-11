import { prisma } from '../db';

export async function handleOracleEvent(
  kind: string,
  data: any,
  topics: any[],
  ledger: number,
): Promise<void> {
  switch (kind) {
    case 'added': {
      const oracleAddr = String(topics[0]);
      const weight = Number(data);
      console.log(`[Indexer] Oracle added: ${oracleAddr} (weight ${weight})`);
      break;
    }
    case 'removed': {
      const oracleAddr = String(topics[0]);
      console.log(`[Indexer] Oracle removed: ${oracleAddr}`);
      break;
    }
    case 'price_updated': {
      const asset = String(topics[0]);
      const [avgPrice, timestamp, oracleCount] = data;
      await prisma.oraclePrice.create({
        data: {
          asset,
          price: BigInt(avgPrice),
          oracleCount: Number(oracleCount),
          timestamp: BigInt(timestamp),
          ledgerSeq: ledger,
        },
      });
      break;
    }
    case 'stale_alert': {
      const asset = String(topics[0]);
      const [price, timestamp] = data;
      console.warn(
        `[Indexer] Stale price alert for ${asset}: price=${price}, timestamp=${timestamp}`,
      );
      break;
    }
  }
}
