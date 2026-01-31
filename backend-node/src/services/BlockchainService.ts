import type { BlockchainLog } from "../models/BlockchainLog.js";
import { blockchainLogs, nextBlockchainLogId, saveStore } from "./dataStore.js";
import { randomUUID } from "crypto";

const MOCK_TX_PREFIX = "0xHACK_SAT_";
const SUCCESS_STATUS = "SUCCESS_ISSUED_ON_TESTNET";

export function issueDigitalID(touristId: string, idHash: string) {
  const log: BlockchainLog = {
    id: nextBlockchainLogId(),
    touristId,
    dataHash: idHash,
    transactionId: `${MOCK_TX_PREFIX}${randomUUID().slice(0, 8)}`,
    status: SUCCESS_STATUS,
    timestamp: new Date().toISOString()
  };
  blockchainLogs.push(log);
  saveStore();
  return log;
}

export function verifyIDProof(idHash: string) {
  return blockchainLogs.some((log) => log.dataHash === idHash && log.status === SUCCESS_STATUS);
}

export function getRecentLogs(touristId: string, limit: number) {
  const logs = blockchainLogs
    .filter((log) => log.touristId === touristId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (limit <= 0 || logs.length <= limit) {
    return logs;
  }
  return logs.slice(0, limit);
}
