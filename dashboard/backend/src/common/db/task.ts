import { DynamoDB } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocument,
  paginateScan,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { EnvMode } from "../env";
import { mapItemToKernelTask, TaskFields, TaskKey } from "./task.type";
import "dotenv/config";

// @ts-ignore
export const fullClient = new DynamoDB({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}); // Full Client
export const docClient = DynamoDBDocument.from(fullClient); // Document Client for abstraction

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
////////////////////////////// CREATE //////////////////////////////////
export async function createTask(mode: EnvMode, key: TaskKey, fields: Partial<TaskFields>) {
  const params = {
    TableName: tableNameFromMode(mode),
    Item: { ...key, ...fields },
    // NOTE: uncomment this to allow overwrite if `processIntent` failed on executor.
    // This silently suppress the error for FE.
    ConditionExpression: "attribute_not_exists(userAddress)",
    ReturnValue: "ALL_OLD",
  };

  try {
    const response = await docClient.send(new PutCommand(params));
    if (!!response.$metadata && response.$metadata.httpStatusCode == 200) {
      console.log(`SkateAvs.Indexer::db.createTask ---- taskId=${key.taskId} | user=${fields.user} created!`);
      return params.Item;
    } else {
      return null;
    }
  } catch (e: any) {
    if (e.name == "ConditionalCheckFailedException") {
      console.error("SkateAvs.Indexer::db.createTask ---- Failed to create: (Order Already Exists)");
    } else {
      console.error("SkateAvs.Indexer::db.createTask ---- Failed to create mapping: " + e);
    }
    throw e;
  }
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////// UPDATE //////////////////////////////////
export async function updateTask(mode: EnvMode, key: TaskKey, fields: Partial<TaskFields>) {
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
export async function getSingleTask(mode: EnvMode, key: TaskKey) {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: tableNameFromMode(mode),
        Key: { ...key },
        ConsistentRead: true,
      }),
    );
    return response.Item ? (mapItemToKernelTask(response.Item) ?? null) : null;
  } catch (e) {
    console.log(`SkateAvs.Indexer::db.getSingleTask failed: ` + e);
    throw e;
  }
}

/**
 * WARN: Value is only approximagte
 */
export async function getApproximateTaskCount(mode: EnvMode) {
  const params = {
    TableName: tableNameFromMode(mode),
  };

  try {
    const result = await fullClient.describeTable(params);
    return result.Table?.ItemCount;
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getApproximateTaskCount failed:`, e);
    throw e;
  }
}

export async function getAllTasks(mode: EnvMode) {
  const params = {
    TableName: tableNameFromMode(mode),
    ConsistentRead: true, // Ensures consistent reads
  };

  try {
    const items = [];
    const paginator = paginateScan({ client: docClient }, params);

    for await (const page of paginator) {
      if (page.Items) {
        items.push(...page.Items.map((o) => mapItemToKernelTask(o)).filter((o) => o != null));
      }
    }

    return items.length > 0 ? items : [];
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getAllTasks failed:`, e);
    throw e;
  }
}

export async function getSingleBatchOfTasks(mode: EnvMode, messageBoxAddress: string) {
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

    const items = response.Items ? response.Items.map(mapItemToKernelTask) : [];
    return items;
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getSingleBatchOfTasks failed:`, e);
    throw e;
  }
}
