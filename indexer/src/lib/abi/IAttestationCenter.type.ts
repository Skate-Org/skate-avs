import { DecodeEventLogReturnType, Log } from "viem";
import { AttestationCenter_ABI } from "./IAttestationCenter.abi";

export const TaskSubmittedEventAbi = [
  AttestationCenter_ABI.find((item) => item.type === "event" && item.name === "TaskSubmitted")!,
];
export type TaskSubmittedEventAbiType = typeof TaskSubmittedEventAbi;
export type TaskSubmittedLog = Log<bigint, number, false, undefined, true, TaskSubmittedEventAbiType>;
export type TaskSubmittedEventArgs = DecodeEventLogReturnType<TaskSubmittedEventAbiType>["args"];

export const TaskRejectedEventAbi = [
  AttestationCenter_ABI.find((item) => item.type === "event" && item.name === "TaskRejected")!,
];
export type TaskRejectedEventAbiType = typeof TaskRejectedEventAbi;
export type TaskRejectedLog = Log<bigint, number, false, undefined, true, TaskRejectedEventAbiType>;
export type TaskRejectedEventArgs = DecodeEventLogReturnType<TaskRejectedEventAbiType>["args"];

export const RewardAccumulatedEventAbi = [
  AttestationCenter_ABI.find((item) => item.type === "event" && item.name === "RewardAccumulated")!,
];
export type RewardAccumulatedEventAbiType = typeof RewardAccumulatedEventAbi;
export type RewardAccumulatedLog = Log<bigint, number, false, undefined, true, RewardAccumulatedEventAbiType>;
export type RewardAccumulatedEventArgs = DecodeEventLogReturnType<RewardAccumulatedEventAbiType>["args"];
