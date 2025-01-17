import {
  paginateScan,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { EnvMode } from "../env";
import { mapToSkateTask, SkateTaskFields, SkateTaskKey } from "./skate.task.type";
import "dotenv/config";
import { docClient } from "./client";

const AVS_TASK_TABLE = "Skate.AVS.Tasks" as const;
const AVS_TASK_TABLE_PROD = "Skate.AVS.Tasks" as const;

function tableNameFromMode(mode: EnvMode) {
  switch (mode) {
    case "PRODUCTION":
      return AVS_TASK_TABLE_PROD;
    case "STAGING":
      return AVS_TASK_TABLE;
  }
}

////////////////////////////////////////////////////////////////////////
////////////////////////////// UPDATE //////////////////////////////////
export async function updateSkateTask(mode: EnvMode, key: SkateTaskKey, fields: Partial<SkateTaskFields>) {
  const updateParams = {
    TableName: tableNameFromMode(mode),
    Key: {
      ...key,
    },
    ExpressionAttributeValues: {} as any,
    ExpressionAttributeNames: {} as any,
    UpdateExpression: "",
    ReturnValues: "ALL_NEW",
  };

  let updateExpressionArray: string[] = [];

  for (const [field, value] of Object.entries(fields)) {
    const objKey = `:${field}`;
    const attrName = `#${field}`; // Using '#' to create placeholder for the field name

    updateExpressionArray.push(`${attrName} = ${objKey}`);
    updateParams.ExpressionAttributeValues[objKey] = value;
    updateParams.ExpressionAttributeNames[attrName] = field;
  }
  updateParams.UpdateExpression = `SET ${updateExpressionArray.join(", ")}`;

  try {
    // @ts-ignore
    const response = await docClient.send(new UpdateCommand(updateParams));
    if (!!response.Attributes) {
      return response.Attributes;
    } else {
      console.warn(
        `SkateAvs.Indexer::db.updateTask ---- ID=${key.taskId} | messageBox=${key.messageBoxAddress} not found`,
      );
      return null;
    }
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.updateTask ---- Update failed: Error=` + e);
    throw e;
  }
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////// GET /////////////////////////////////////
export async function getSingleSkateTask(mode: EnvMode, key: SkateTaskKey) {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: tableNameFromMode(mode),
        Key: { ...key },
        ConsistentRead: true,
      }),
    );
    return response.Item ? (mapToSkateTask(response.Item) ?? null) : null;
  } catch (e) {
    console.log(`SkateAvs.Indexer::db.getSingleTask failed: ` + e);
    throw e;
  }
}

export async function getAllSkateTasks(mode: EnvMode) {
  const params = {
    TableName: tableNameFromMode(mode),
    ConsistentRead: true, // Ensures consistent reads
  };

  try {
    const items = [];
    const paginator = paginateScan({ client: docClient }, params);

    for await (const page of paginator) {
      if (page.Items) {
        items.push(...page.Items.map((o) => mapToSkateTask(o)).filter((o) => o != null));
      }
    }

    return items.length > 0 ? items : [];
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getAllTasks failed:`, e);
    throw e;
  }
}

export async function getSingleBatchSkateTasks(mode: EnvMode, messageBoxAddress: string) {
  try {
    const response = await docClient.send(
      new QueryCommand({
        TableName: tableNameFromMode(mode),
        IndexName: "messageBoxAddress-taskId-index", // GSI name
        KeyConditionExpression: "messageBoxAddress = :address",
        ExpressionAttributeValues: {
          ":address": messageBoxAddress,
        },
        ScanIndexForward: false, // Descending order by taskId
      }),
    );

    const items = response.Items ? response.Items.map(mapToSkateTask) : [];
    return items;
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getSingleBatchOfTasks failed:`, e);
    throw e;
  }
}
