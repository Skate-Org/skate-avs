import { paginateQuery, PutCommand } from "@aws-sdk/lib-dynamodb";
import { EnvMode } from "../env";
import {
  mapToAttesterAvsTask,
  AvsTaskByAttesterFields,
  AvsTaskByAttesterKey,
  AvsTaskByAttester,
} from "./avs.taskByAttester.type";
import "dotenv/config";
import { docClient } from "./client";

const AVS_TASK_BY_ATTESTER_TABLE = "Skate.Avs.TasksByAttester" as const;

function tableNameFromMode(mode: EnvMode) {
  switch (mode) {
    case "PRODUCTION":
    case "STAGING":
      return AVS_TASK_BY_ATTESTER_TABLE;
  }
}

////////////////////////////////////////////////////////////////////////
////////////////////////////// UPDATE //////////////////////////////////
export async function createAvsTaskByAttester(
  mode: EnvMode,
  key: AvsTaskByAttesterKey,
  fields: AvsTaskByAttesterFields,
) {
  const params = {
    TableName: tableNameFromMode(mode),
    Item: { ...key, ...fields },
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

////////////////////////////////////////////////////////////////////////
////////////////////////////// GET /////////////////////////////////////
export async function getAvsTasksByAttester(
  mode: EnvMode,
  attesterId: number,
  limit: number = 100,
): Promise<{ tasks: AvsTaskByAttester[]; taskCount: number }> {
  const params = {
    TableName: tableNameFromMode(mode),
    KeyConditionExpression: "attesterId = :attesterId",
    ExpressionAttributeValues: {
      ":attesterId": attesterId,
    },
    ScanIndexForward: false, // Sort by taskId (sort key) in descending order
  };

  const paginator = paginateQuery({ client: docClient }, params);
  const collectedTasks: AvsTaskByAttester[] = [];
  let totalCount = 0;

  try {
    for await (const page of paginator) {
      const items = page.Items?.map(mapToAttesterAvsTask) ?? [];
      totalCount += items.length; // Add count from this page

      // Collect tasks only up to the limit
      const remainingSpace = limit - collectedTasks.length;
      if (remainingSpace > 0) {
        collectedTasks.push(...items.slice(0, remainingSpace));
      }
      // We still need to iterate through all pages to get the correct totalCount,
      // even if we have already collected enough tasks for the limit.
    }

    return {
      tasks: collectedTasks, // Already capped at limit during collection
      taskCount: totalCount,
    };
  } catch (e: any) {
    console.error(
      `SkateCore.Relayer::db.getAvsTasksByAttester ---- Failed to get tasks for attester ${attesterId}: ` + e,
    );
    throw e;
  }
}
