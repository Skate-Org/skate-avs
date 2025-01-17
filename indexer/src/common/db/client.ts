import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import "dotenv/config";

// @ts-ignore
const fullClient = new DynamoDB({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}); // Full Client
export const docClient = DynamoDBDocument.from(fullClient); // Document Client for abstraction
