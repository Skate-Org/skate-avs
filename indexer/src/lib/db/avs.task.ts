import { paginateScan, GetCommand, UpdateCommand, PutCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { EnvMode } from "../env";
import { mapToAvsTask, AvsTaskFields, AvsTaskKey } from "./avs.task.type";
import "dotenv/config";
import { docClient } from "./client";
import { ATTESTATION_CENTER_ADDRESS, CHAIN } from "../const";

const AVS_TASK_TABLE = "Skate.AVS.SubmittedTasks" as const;

function tableNameFromMode(mode: EnvMode) {
  switch (mode) {
    case "PRODUCTION":
    case "STAGING":
      return AVS_TASK_TABLE;
  }
}

export function getAvsTaskKey(taskId: number): AvsTaskKey {
  return {
    taskId: taskId,
    attestationCenterInfo: `${CHAIN.MANTLE}--${ATTESTATION_CENTER_ADDRESS}`,
  };
}

////////////////////////////////////////////////////////////////////////
////////////////////////////// UPDATE //////////////////////////////////
export async function createAvsTask(mode: EnvMode, taskId: number, fields: AvsTaskFields) {
  const params = {
    TableName: tableNameFromMode(mode),
    Item: { ...getAvsTaskKey(taskId), ...fields },
    ReturnValue: "ALL_NEW",
  };
  try {
    const response = await docClient.send(new PutCommand(params));

    if (!!response.$metadata && response.$metadata.httpStatusCode == 200) {
      return params.Item;
    } else {
      return null;
    }
  } catch (e: any) {
    console.error("SkateCore.Relayer::db.createAMMTask ---- Failed to create task: " + e);
    throw e;
  }
}

export async function updateAvsTask(mode: EnvMode, taskId: number, fields: Partial<AvsTaskFields>) {
  const updateParams = {
    TableName: tableNameFromMode(mode),
    Key: {
      ...getAvsTaskKey(taskId),
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
      console.warn(`Indexer::db.updateAvsTask ---- ID=${taskId} not found`);
      return null;
    }
  } catch (e) {
    console.error(`Indexer::db.updateAvsTask ---- Update failed: Error=` + e);
    throw e;
  }
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////// GET /////////////////////////////////////
export async function getSingleAvsTask(mode: EnvMode, taskId: number) {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: tableNameFromMode(mode),
        Key: { ...getAvsTaskKey(taskId) },
        ConsistentRead: true,
      }),
    );
    return response.Item ? (mapToAvsTask(response.Item) ?? null) : null;
  } catch (e) {
    console.log(`SkateAvs.Indexer::db.getSingleTask failed: ` + e);
    throw e;
  }
}

export async function getBatchAvsTasks(mode: EnvMode, taskIds: number[]) {
  if (taskIds.length === 0) {
    return [];
  }
  if (taskIds.length > 100) {
    // DynamoDB BatchGetItem has a limit of 100 items per request
    console.warn(
      `SkateAvs.Indexer::db.getBatchAvsTasks ---- Attempted to fetch more than 100 items (${taskIds.length}), splitting into multiple requests is recommended for production use.`,
    );
    // For simplicity in this example, we'll proceed but this might fail or be inefficient.
    // A production implementation should handle batching requests if taskIds.length > 100.
  }

  const tableName = tableNameFromMode(mode);
  const keys = taskIds.map(getAvsTaskKey);

  const params = {
    RequestItems: {
      [tableName]: {
        Keys: keys,
        ConsistentRead: true,
      },
    },
  };

  try {
    const response = await docClient.send(new BatchGetCommand(params));

    if (response.Responses && response.Responses[tableName]) {
      const items = response.Responses[tableName];
      // Note: response.UnprocessedKeys might contain keys that failed, handle if necessary
      if (response.UnprocessedKeys && Object.keys(response.UnprocessedKeys).length > 0) {
        console.warn(
          `SkateAvs.Indexer::db.getBatchAvsTasks ---- Some keys were unprocessed:`,
          response.UnprocessedKeys,
        );
      }
      return items.map((o) => mapToAvsTask(o)).filter((o): o is NonNullable<typeof o> => o != null);
    } else {
      return [];
    }
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getBatchAvsTasks failed:`, e);
    throw e;
  }
}

export async function getAllAvsTasks(mode: EnvMode) {
  const params = {
    TableName: tableNameFromMode(mode),
    ConsistentRead: true, // Ensures consistent reads
  };

  try {
    const items = [];
    const paginator = paginateScan({ client: docClient }, params);

    for await (const page of paginator) {
      if (page.Items) {
        items.push(...page.Items.map((o) => mapToAvsTask(o)).filter((o) => o != null));
      }
    }

    return items.length > 0 ? items : [];
  } catch (e) {
    console.error(`SkateAvs.Indexer::db.getAllTasks failed:`, e);
    throw e;
  }
}
