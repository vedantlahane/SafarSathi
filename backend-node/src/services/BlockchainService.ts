import { randomUUID } from "crypto";
import {
  createBlockchainLog,
  getBlockchainLogsByTouristId,
} from "./mongoStore.js";
import { BlockchainLogModel } from "../schemas/index.js";

const MOCK_TX_PREFIX = "0xHACK_SAT_";
const SUCCESS_STATUS = "SUCCESS_ISSUED_ON_TESTNET";

export async function issueDigitalID(touristId: string, idHash: string) {
  return createBlockchainLog({
    touristId,
    dataHash: idHash,
    transactionId: `${MOCK_TX_PREFIX}${randomUUID().slice(0, 8)}`,
    status: SUCCESS_STATUS,
  });
}

export async function verifyIDProof(idHash: string) {
  const log = await BlockchainLogModel.findOne({
    dataHash: idHash,
    status: SUCCESS_STATUS,
  }).lean();
  return !!log;
}

export async function getRecentLogs(touristId: string, limit: number) {
  const logs = await getBlockchainLogsByTouristId(touristId);
  if (limit <= 0 || logs.length <= limit) {
    return logs;
  }
  return logs.slice(0, limit);
}
